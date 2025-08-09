from typing import Optional
from app.database.base import BaseDatabase
from app.models.user import User, UserInDB
from bson import ObjectId

class UserDatabase(BaseDatabase):
    def __init__(self):
        super().__init__("users")

    async def create_user(self, user_data: dict) -> User:
        """Create a new user"""
        user_dict = await self.create(user_data)
        return User(**user_dict)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        user_dict = await self.get_by_id(user_id)
        if user_dict:
            return User(**user_dict)
        return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        user_dict = await self.collection.find_one({"email": email})
        if user_dict:
            return User(**user_dict)
        return None

    async def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google ID"""
        user_dict = await self.collection.find_one({"google_id": google_id})
        if user_dict:
            return User(**user_dict)
        return None

    async def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        """Update user"""
        user_dict = await self.update(user_id, update_data)
        if user_dict:
            return User(**user_dict)
        return None

    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        return await self.delete(user_id)