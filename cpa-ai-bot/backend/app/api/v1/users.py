from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import JSONResponse
from app.api.deps import get_current_active_user, get_admin_user
from app.models.user import User, UserUpdate
from app.services.auth_service import AuthService
from app.services.user_service import UserService
import logging
import os
import uuid
from typing import Optional
import aiofiles
from PIL import Image
import io

logger = logging.getLogger(__name__)
router = APIRouter()
auth_service = AuthService()
user_service = UserService()

# Configuration for file uploads
UPLOAD_DIR = "uploads/profile_pictures"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
IMAGE_MAX_WIDTH = 500
IMAGE_MAX_HEIGHT = 500

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get user profile"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": getattr(current_user, 'first_name', ''),
        "last_name": getattr(current_user, 'last_name', ''),
        "full_name": current_user.full_name,
        "business_name": getattr(current_user, 'business_name', ''),
        "phone": getattr(current_user, 'phone', ''),
        "address": getattr(current_user, 'address', ''),
        "profile_picture": getattr(current_user, 'profile_picture', None),
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
        
        # Convert user_update to dict and filter out None values
        update_data = {}
        if user_update.first_name is not None:
            update_data["first_name"] = user_update.first_name
        if user_update.last_name is not None:
            update_data["last_name"] = user_update.last_name
        if user_update.business_name is not None:
            update_data["business_name"] = user_update.business_name
        if user_update.phone is not None:
            update_data["phone"] = user_update.phone
        if user_update.address is not None:
            update_data["address"] = user_update.address
        if user_update.full_name is not None:
            update_data["full_name"] = user_update.full_name
        if user_update.profile_picture is not None:
            update_data["profile_picture"] = user_update.profile_picture
        if user_update.is_active is not None:
            update_data["is_active"] = user_update.is_active
        
        # Update full_name if first_name or last_name provided
        if "first_name" in update_data or "last_name" in update_data:
            first_name = update_data.get("first_name", getattr(current_user, 'first_name', ''))
            last_name = update_data.get("last_name", getattr(current_user, 'last_name', ''))
            update_data["full_name"] = f"{first_name} {last_name}".strip()
        
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
            "first_name": getattr(updated_user, 'first_name', ''),
            "last_name": getattr(updated_user, 'last_name', ''),
            "full_name": updated_user.full_name,
            "business_name": getattr(updated_user, 'business_name', ''),
            "phone": getattr(updated_user, 'phone', ''),
            "address": getattr(updated_user, 'address', ''),
            "profile_picture": getattr(updated_user, 'profile_picture', None),
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

def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file extension
    file_ext = os.path.splitext(file.filename.lower())[1]
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

async def resize_image(file_content: bytes, max_width: int = IMAGE_MAX_WIDTH, max_height: int = IMAGE_MAX_HEIGHT) -> bytes:
    """Resize image to fit within max dimensions while maintaining aspect ratio"""
    try:
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Calculate new dimensions maintaining aspect ratio
        image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        return output.getvalue()
    except Exception as e:
        logger.error(f"Error resizing image: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file"
        )

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and update user profile picture"""
    try:
        # Validate file
        validate_image_file(file)
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Reset file pointer for re-reading
        await file.seek(0)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename.lower())[1] or '.jpg'
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Resize image
        resized_content = await resize_image(file_content)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as buffer:
            await buffer.write(resized_content)
        
        # Generate URL (adjust based on your static file serving setup)
        profile_picture_url = f"/static/profile_pictures/{filename}"
        
        # Update user profile with new picture URL
        from app.database.user_db import UserDatabase
        user_db = UserDatabase()
        
        # Delete old profile picture if exists
        old_picture = getattr(current_user, 'profile_picture', None)
        if old_picture:
            try:
                # Extract filename from old URL and delete file
                old_filename = os.path.basename(old_picture)
                old_file_path = os.path.join(UPLOAD_DIR, old_filename)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            except Exception as e:
                logger.warning(f"Could not delete old profile picture: {e}")
        
        # Update database
        updated_user = await user_db.update_user(
            str(current_user.id), 
            {"profile_picture": profile_picture_url}
        )
        
        if not updated_user:
            # Clean up uploaded file if database update fails
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile picture in database"
            )
        
        return {
            "message": "Profile picture uploaded successfully",
            "profile_picture": profile_picture_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading profile picture: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile picture"
        )

@router.delete("/profile-picture")
async def remove_profile_picture(
    current_user: User = Depends(get_current_active_user)
):
    """Remove user profile picture"""
    try:
        from app.database.user_db import UserDatabase
        user_db = UserDatabase()
        
        # Get current profile picture
        current_picture = getattr(current_user, 'profile_picture', None)
        
        # Update database to remove profile picture
        updated_user = await user_db.update_user(
            str(current_user.id), 
            {"profile_picture": None}
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove profile picture from database"
            )
        
        # Delete file if exists
        if current_picture:
            try:
                filename = os.path.basename(current_picture)
                file_path = os.path.join(UPLOAD_DIR, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.warning(f"Could not delete profile picture file: {e}")
        
        return {
            "message": "Profile picture removed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing profile picture: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove profile picture"
        )

@router.get("/statistics")
async def get_user_statistics(
    current_user: User = Depends(get_current_active_user)
):
    """Get user statistics"""
    try:
        stats = await user_service.get_user_statistics(str(current_user.id))
        return stats
    except Exception as e:
        logger.error(f"Error getting user statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )

@router.get("/dashboard")
async def get_dashboard_data(
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard data for user"""
    try:
        data = await user_service.get_user_dashboard_data(str(current_user.id))
        return data
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard data"
        )