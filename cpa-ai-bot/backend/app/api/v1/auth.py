from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.services.auth_service import AuthService
from app.schemas.auth_schema import GoogleAuthRequest, TokenResponse, LogoutRequest, AuthStatusResponse
from app.api.deps import get_current_active_user_by_session
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
auth_service = AuthService()

@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, http_request: Request):
    """Authenticate with Google OAuth"""
    try:
        # Use either code, id_token, or access_token from the request
        token = request.id_token or request.access_token or request.code
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid Google token provided"
            )
        
        result = await auth_service.google_auth(token)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google authentication failed"
            )
        
        user = result["user"]
        session_id = result["session_id"]
        google_token = result["google_token"]
        
        return TokenResponse(
            session_id=session_id,
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "google_id": user.google_id,
                "profile_picture": user.profile_picture
            },
            google_token=google_token,
            expires_in=86400  # 24 hours in seconds
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )

@router.get("/me", response_model=AuthStatusResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user_by_session)):
    """Get current user information"""
    if not current_user:
        return AuthStatusResponse(
            is_authenticated=False,
            user=None,
            session_expires_at=None
        )
    
    return AuthStatusResponse(
        is_authenticated=True,
        user={
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_active": current_user.is_active,
            "is_admin": getattr(current_user, 'is_admin', False),
            "google_id": current_user.google_id,
            "profile_picture": current_user.profile_picture,
            "created_at": current_user.created_at
        },
        session_expires_at=None  # You can get this from session if needed
    )

@router.post("/logout")
async def logout(request: LogoutRequest):
    """Logout user by invalidating session"""
    try:
        success = await auth_service.logout_user(request.session_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session"
            )
        
        return {"message": "Successfully logged out"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/refresh")
async def refresh_session(session_id: str):
    """Refresh session expiration"""
    try:
        new_session_id = await auth_service.refresh_session(session_id)
        
        if not new_session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        return {
            "session_id": new_session_id,
            "message": "Session refreshed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session refresh failed"
        )

@router.get("/status", response_model=AuthStatusResponse)
async def auth_status(session_id: str = None):
    """Check authentication status"""
    if not session_id:
        return AuthStatusResponse(
            is_authenticated=False,
            user=None,
            session_expires_at=None
        )
    
    try:
        session_info = auth_service.get_session_info(session_id)
        user = await auth_service.get_current_user_by_session(session_id)
        
        if not user or not session_info:
            return AuthStatusResponse(
                is_authenticated=False,
                user=None,
                session_expires_at=None
            )
        
        return AuthStatusResponse(
            is_authenticated=True,
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active
            },
            session_expires_at=session_info["expires_at"]
        )
        
    except Exception as e:
        logger.error(f"Auth status check error: {e}")
        return AuthStatusResponse(
            is_authenticated=False,
            user=None,
            session_expires_at=None
        )