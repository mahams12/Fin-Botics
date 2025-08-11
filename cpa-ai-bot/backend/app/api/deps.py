from fastapi import Depends, HTTPException, status, Header, Cookie, Request
from typing import Optional
from app.services.auth_service import AuthService
from app.models.user import User
import logging

logger = logging.getLogger(__name__)
auth_service = AuthService()

async def get_current_user_by_session(request: Request) -> User:
    """Get current authenticated user by session ID from multiple sources"""
    
    # Try to get session ID from multiple sources
    session_id = None
    
    # 1. Check X-Session-ID header
    session_id = request.headers.get("X-Session-ID")
    
    # 2. Check Authorization header (Bearer format)
    if not session_id:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_id = auth_header.replace("Bearer ", "")
    
    # 3. Check query parameters
    if not session_id:
        session_id = request.query_params.get("session_id")
    
    # 4. Check cookies
    if not session_id:
        session_id = request.cookies.get("session_id")
    
    if not session_id:
        logger.warning("No session ID found in request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session ID provided",
        )
    
    user = await auth_service.get_current_user_by_session(session_id)
    if not user:
        logger.warning(f"Invalid or expired session: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    
    logger.info(f"Authenticated user: {user.email}")
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
    request: Request
) -> User:
    """Get current active user via session"""
    current_user = await get_current_user_by_session(request)
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

async def get_optional_user(request: Request) -> Optional[User]:
    """Get current user if authenticated, None otherwise (no exception)"""
    try:
        user = await get_current_user_by_session(request)
        return user if user and user.is_active else None
    except Exception:
        return None