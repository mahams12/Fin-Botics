from typing import Optional, Dict, Any
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config.settings import settings
from app.database.user_db import UserDatabase
from app.models.user import UserCreate, User
import uuid
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.user_db = UserDatabase()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}  # In-memory session store

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

    async def google_auth(self, token: str) -> Optional[Dict[str, Any]]:
        """Authenticate or create user via Google OAuth and create session"""
        google_user = await self.verify_google_token(token)
        if not google_user:
            return None

        email = google_user.get('email')
        name = google_user.get('name', '')
        google_id = google_user.get('sub')
        picture = google_user.get('picture', '')

        # Check if user exists
        user = await self.user_db.get_user_by_email(email)

        if not user:
            # Create new user
            user_data = UserCreate(
                email=email,
                full_name=name,
                google_id=google_id,
                profile_picture=picture,
                is_active=True,
                email_verified=True  # Google emails are pre-verified
            )
            user = await self.create_user(user_data)
        else:
            # Update Google ID and profile if not set or changed
            update_data = {}
            if not user.google_id:
                update_data["google_id"] = google_id
            if user.profile_picture != picture:
                update_data["profile_picture"] = picture
            if update_data:
                await self.user_db.update_user(user.id, update_data)

        # Create session
        session_id = await self.create_session(user, token)
        
        return {
            "user": user,
            "session_id": session_id,
            "google_token": token
        }

    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        # Check if user already exists
        existing_user = await self.user_db.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        # Create user (exclude password field completely)
        user_dict = user_data.dict(exclude={"password"})
        user_dict["created_at"] = datetime.utcnow()
        
        user = await self.user_db.create_user(user_dict)
        logger.info(f"Created new user via Google OAuth: {user.email}")
        return user

    async def create_session(self, user: User, google_token: str) -> str:
        """Create a new session for the user"""
        session_id = str(uuid.uuid4())
        session_data = {
            "user_id": str(user.id),
            "user_email": user.email,
            "google_token": google_token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),  # 24 hour sessions
            "last_activity": datetime.utcnow()
        }
        
        self.active_sessions[session_id] = session_data
        logger.info(f"Created session {session_id} for user {user.email}")
        return session_id

    async def get_current_user_by_session(self, session_id: str) -> Optional[User]:
        """Get current user from session ID"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None

        # Check if session is expired
        if datetime.utcnow() > session["expires_at"]:
            await self.invalidate_session(session_id)
            return None

        # Update last activity
        session["last_activity"] = datetime.utcnow()
        
        # Get user from database
        user = await self.user_db.get_user_by_email(session["user_email"])
        return user

    async def get_current_user_by_token(self, token: str) -> Optional[User]:
        """Get current user from Google token"""
        google_user = await self.verify_google_token(token)
        if not google_user:
            return None

        email = google_user.get('email')
        if not email:
            return None

        user = await self.user_db.get_user_by_email(email)
        return user

    async def invalidate_session(self, session_id: str) -> bool:
        """Invalidate a session"""
        if session_id in self.active_sessions:
            user_email = self.active_sessions[session_id].get("user_email")
            del self.active_sessions[session_id]
            logger.info(f"Invalidated session {session_id} for user {user_email}")
            return True
        return False

    async def logout_user(self, session_id: str) -> bool:
        """Logout user by invalidating session"""
        return await self.invalidate_session(session_id)

    async def refresh_session(self, session_id: str) -> Optional[str]:
        """Refresh session expiration"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None

        # Extend session expiration
        session["expires_at"] = datetime.utcnow() + timedelta(hours=24)
        session["last_activity"] = datetime.utcnow()
        
        return session_id

    async def cleanup_expired_sessions(self):
        """Clean up expired sessions (should be called periodically)"""
        current_time = datetime.utcnow()
        expired_sessions = []
        
        for session_id, session_data in self.active_sessions.items():
            if current_time > session_data["expires_at"]:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            await self.invalidate_session(session_id)
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")

    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session information"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        return {
            "session_id": session_id,
            "user_email": session["user_email"],
            "created_at": session["created_at"],
            "expires_at": session["expires_at"],
            "last_activity": session["last_activity"]
        }