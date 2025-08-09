from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user, get_admin_user
from app.models.user import User, UserUpdate
from app.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
auth_service = AuthService()

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get user profile"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.put("/profile")
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    try:
        from app.database.user_db import UserDatabase
        user_db = UserDatabase()
        
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data provided for update"
            )
        
        updated_user = await user_db.update_user(str(current_user.id), update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": str(updated_user.id),
            "email": updated_user.email,
            "full_name": updated_user.full_name,
            "is_active": updated_user.is_active,
            "updated_at": updated_user.updated_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )