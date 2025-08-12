from typing import Optional, Dict, Any
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config.settings import settings
from app.database.user_db import UserDatabase
from app.models.user import User
import uuid
from datetime import datetime, timedelta
import logging
import bcrypt

logger = logging.getLogger(__name__)

# Global session store - shared across all instances
_global_sessions: Dict[str, Dict[str, Any]] = {}

class AuthService:
    def __init__(self):
        self.user_db = UserDatabase()
        # Use global session store instead of instance variable
        self.active_sessions = _global_sessions
        logger.info(f"AuthService initialized with {len(self.active_sessions)} existing sessions")

    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def _verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        return await self.user_db.get_user_by_email(email)

    async def register_user(self, user_data) -> Dict[str, Any]:
        """Register a new user with email and password"""
        # Check if user already exists
        existing_user = await self.user_db.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        # Hash the password
        if user_data.password:
            hashed_password = self._hash_password(user_data.password)
        else:
            raise ValueError("Password is required")

        # Create user data
        user_dict = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "is_admin": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Create user in database
        user = await self.user_db.create_user(user_dict)
        
        # Create session for the new user
        session_id = await self.create_session_email_auth(user)
        
        logger.info(f"Registered new user: {user.email}")
        
        return {
            "user": user,
            "session_id": session_id
        }

    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        # Get user from database
        user = await self.user_db.get_user_by_email(email)
        if not user:
            return None

        # Check if user has a password (might be Google-only user)
        if not hasattr(user, 'hashed_password') or not user.hashed_password:
            logger.warning(f"User {email} attempted login but has no password set")
            return None

        # Verify password
        if not self._verify_password(password, user.hashed_password):
            logger.warning(f"Failed login attempt for user {email}")
            return None

        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login attempt for inactive user {email}")
            return None

        # Create session
        session_id = await self.create_session_email_auth(user)
        
        logger.info(f"Successful login for user {email}")
        
        return {
            "user": user,
            "session_id": session_id
        }

    async def create_session_email_auth(self, user: User) -> str:
        """Create a new session for email/password authentication"""
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "user_id": str(user.id),
            "user_email": user.email,
            "auth_type": "email",
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
            "last_activity": datetime.utcnow()
        }
        
        # Store in memory
        self.active_sessions[session_id] = session_data
        
        # Also store in database for persistence
        try:
            from app.config.database import get_database
            db = await get_database()
            await db.sessions.insert_one(session_data)
            logger.info(f"💾 Stored session in database: {session_id}")
        except Exception as e:
            logger.warning(f"Failed to store session in database: {e}")
        
        logger.info(f"🔐 Created email auth session {session_id} for user {user.email}")
        logger.info(f"🔐 Total active sessions: {len(self.active_sessions)}")
        
        return session_id

    async def verify_google_token(self, token: str) -> Optional[dict]:
        """Verify Google OAuth token"""
        try:
            logger.info(f"🔍 Attempting to verify Google token with CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
            
            # Specify the CLIENT_ID of the app that accesses the backend
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            logger.info(f"✅ Token verification successful. User: {idinfo.get('email')}")

            # If auth request is from a G Suite domain
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                logger.error(f"❌ Wrong issuer: {idinfo['iss']}")
                raise ValueError('Wrong issuer.')

            return idinfo
        except ValueError as e:
            logger.error(f"❌ Google token verification failed: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error during token verification: {e}")
            return None

    async def google_auth(self, token: str) -> Optional[Dict[str, Any]]:
        """Authenticate or create user via Google OAuth and create session"""
        logger.info("🚀 Starting Google authentication")
        
        google_user = await self.verify_google_token(token)
        if not google_user:
            logger.error("❌ Google token verification failed")
            return None

        email = google_user.get('email')
        name = google_user.get('name', '')
        google_id = google_user.get('sub')
        picture = google_user.get('picture', '')

        logger.info(f"✅ Google user verified: {email}")

        # Check if user exists
        user = await self.user_db.get_user_by_email(email)

        if not user:
            logger.info(f"🆕 Creating new user for: {email}")
            # Create new user - REMOVED profile_picture field
            user_data = {
                "email": email,
                "full_name": name,
                "google_id": google_id,
                # "profile_picture": picture,  # REMOVED - your User model doesn't have this
                "is_active": True,
                # "email_verified": True  # REMOVED - your User model doesn't have this
            }
            user = await self.create_google_user(user_data)
        else:
            logger.info(f"👤 Existing user found: {email}")
            # Update Google ID if not set
            update_data = {}
            if not getattr(user, 'google_id', None):
                update_data["google_id"] = google_id
                logger.info(f"📝 Updating Google ID for existing user")
            
            # Note: Removed profile_picture update since your User model doesn't have this field
            
            if update_data:
                await self.user_db.update_user(user.id, update_data)

        # Create session
        session_id = await self.create_session(user, token)
        
        logger.info(f"✅ Google authentication successful for: {email}")
        
        return {
            "user": user,
            "session_id": session_id,
            "google_token": token
        }

    async def create_google_user(self, user_data: dict) -> User:
        """Create new user for Google OAuth"""
        # Check if user already exists
        existing_user = await self.user_db.get_user_by_email(user_data["email"])
        if existing_user:
            raise ValueError("User with this email already exists")

        # Create user data with timestamp
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        
        user = await self.user_db.create_user(user_data)
        logger.info(f"Created new user via Google OAuth: {user.email}")
        return user

    async def create_user(self, user_data: dict) -> User:
        """Create new user (legacy method)"""
        # Check if user already exists
        existing_user = await self.user_db.get_user_by_email(user_data["email"])
        if existing_user:
            raise ValueError("User with this email already exists")

        # Create user (exclude password field completely)
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        
        user = await self.user_db.create_user(user_data)
        logger.info(f"Created new user: {user.email}")
        return user

    async def update_user_profile(self, user_id, profile_data):
        """Update user profile information"""
        try:
            # Prepare update data
            update_data = {}
            if hasattr(profile_data, 'full_name') and profile_data.full_name is not None:
                update_data["full_name"] = profile_data.full_name
            if hasattr(profile_data, 'is_active') and profile_data.is_active is not None:
                update_data["is_active"] = profile_data.is_active
            if hasattr(profile_data, 'profile_picture') and profile_data.profile_picture is not None:
                update_data["profile_picture"] = profile_data.profile_picture
            
            # Add updated timestamp
            update_data["updated_at"] = datetime.utcnow()
            
            logger.info(f"Updating user profile for user_id: {user_id} with data: {update_data}")
            
            # Update user in database using the existing user_db instance
            updated_user = await self.user_db.update_user(user_id, update_data)
            
            if updated_user:
                logger.info(f"Successfully updated profile for user: {updated_user.email}")
            else:
                logger.warning(f"No user returned from update operation for user_id: {user_id}")
                
            return updated_user
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            raise

    async def create_session(self, user: User, google_token: str) -> str:
        """Create a new session for the user"""
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,  # Add this field for consistency
            "user_id": str(user.id),
            "user_email": user.email,
            "google_token": google_token,
            "auth_type": "google",
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),  # 24 hour sessions
            "last_activity": datetime.utcnow()
        }
        
        self.active_sessions[session_id] = session_data
        
        # Also store in database for persistence
        try:
            from app.config.database import get_database
            db = await get_database()
            await db.sessions.insert_one(session_data)
            logger.info(f"💾 Stored Google session in database: {session_id}")
        except Exception as e:
            logger.warning(f"Failed to store Google session in database: {e}")
        
        logger.info(f"Created session {session_id} for user {user.email}")
        return session_id

    async def get_current_user_by_session(self, session_id: str) -> Optional[User]:
        """Get current user from session ID"""
        logger.info(f"🔍 Looking for session: {session_id}")
        logger.info(f"🔍 Active sessions in memory: {list(self.active_sessions.keys())}")
        
        # First check in-memory
        session = self.active_sessions.get(session_id)
        
        # If not in memory, check database
        if not session:
            try:
                from app.config.database import get_database
                db = await get_database()
                session = await db.sessions.find_one({"session_id": session_id})
                if session:
                    logger.info(f"📀 Found session in database: {session_id}")
                    # Add back to memory cache
                    self.active_sessions[session_id] = session
                else:
                    logger.warning(f"❌ Session not found in database either: {session_id}")
            except Exception as e:
                logger.error(f"Failed to check database for session: {e}")
        
        if not session:
            logger.warning(f"❌ Session not found anywhere")
            return None

        # Check if session is expired
        current_time = datetime.utcnow()
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        
        if current_time > expires_at:
            logger.warning(f"❌ Session expired: {expires_at} < {current_time}")
            await self.invalidate_session(session_id)
            return None

        # Update last activity
        session["last_activity"] = current_time
        self.active_sessions[session_id] = session  # Update memory cache
        
        logger.info(f"✅ Session found, user: {session['user_email']}")
        
        # Get user from database
        user = await self.user_db.get_user_by_email(session["user_email"])
        if user:
            logger.info(f"✅ User retrieved from database: {user.email}")
        else:
            logger.warning(f"❌ User not found in database: {session['user_email']}")
        
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