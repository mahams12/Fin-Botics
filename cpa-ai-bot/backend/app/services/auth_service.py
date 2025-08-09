from typing import Optional
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config.settings import settings
from app.database.user_db import UserDatabase
from app.models.user import UserCreate, User
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.user_db = UserDatabase()

    async def verify_google_token(self, token: str) -> Optional[dict]:
        """Verify Google OAuth token"""
        try:
            # Specify the CLIENT_ID of the app that accesses the backend
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            # If auth request is from a G Suite domain
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            return idinfo
        except ValueError as e:
            logger.error(f"Google token verification failed: {e}")
            return None

    async def google_auth(self, token: str) -> Optional[User]:
        """Authenticate or create user via Google OAuth"""
        google_user = await self.verify_google_token(token)
        if not google_user:
            return None

        email = google_user.get('email')
        name = google_user.get('name', '')
        google_id = google_user.get('sub')

        # Check if user exists
        user = await self.user_db.get_user_by_email(email)

        if not user:
            # Create new user
            user_data = UserCreate(
                email=email,
                full_name=name,
                google_id=google_id
            )
            user = await self.create_user(user_data)
        else:
            # Update Google ID if not set
            if not user.google_id:
                await self.user_db.update_user(user.id, {"google_id": google_id})

        return user

    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        # Check if user already exists
        existing_user = await self.user_db.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        # Create user (no password hashing needed for Google auth only)
        user_dict = user_data.dict(exclude={"password"})
        
        user = await self.user_db.create_user(user_dict)
        return user

    async def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from Google token"""
        google_user = await self.verify_google_token(token)
        if not google_user:
            return None

        email = google_user.get('email')
        if not email:
            return None

        user = await self.user_db.get_user_by_email(email)
        return user