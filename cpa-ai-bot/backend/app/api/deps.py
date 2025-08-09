from fastapi import Depends, HTTPException, status, Header, Cookie
from typing import Optional
from app.services.auth_service import AuthService
from app.models.user import User

auth_service = AuthService()

async def get_current_user_by_session(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    session_cookie: Optional[str] = Cookie(None, alias="session_id")
) -> User:
    """Get current authenticated user by session ID"""
    # Try to get session ID from header first, then cookie
    current_session_id = session_id or session_cookie
    
    if not current_session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session ID provided",
        )
    
    user = await auth_service.get_current_user_by_session(current_session_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    return user

async def get_current_user_by_token(
    authorization: Optional[str] = Header(None)
) -> User:
    """Get current authenticated user by Google token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization header provided",
        )
    
    # Extract token from Bearer authorization
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    
    user = await auth_service.get_current_user_by_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate Google token",
        )
    return user

async def get_current_active_user_by_session(
    current_user: User = Depends(get_current_user_by_session)
) -> User:
    """Get current active user via session"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

async def get_current_active_user_by_token(
    current_user: User = Depends(get_current_user_by_token)
) -> User:
    """Get current active user via Google token"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

async def get_admin_user_by_session(
    current_user: User = Depends(get_current_active_user_by_session)
) -> User:
    """Get admin user via session"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_admin_user_by_token(
    current_user: User = Depends(get_current_active_user_by_token)
) -> User:
    """Get admin user via Google token"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Convenience aliases for backward compatibility
get_current_active_user = get_current_active_user_by_session
get_admin_user = get_admin_user_by_session

async def get_optional_user(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    session_cookie: Optional[str] = Cookie(None, alias="session_id")
) -> Optional[User]:
    """Get current user if authenticated, None otherwise (no exception)"""
    current_session_id = session_id or session_cookie
    
    if not current_session_id:
        return None
    
    try:
        user = await auth_service.get_current_user_by_session(current_session_id)
        return user if user and user.is_active else None
    except Exception:
        return None