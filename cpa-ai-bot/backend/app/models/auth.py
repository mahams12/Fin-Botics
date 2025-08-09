from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from .user import PyObjectId

class AuthProvider:
    GOOGLE = "google"

AUTH_PROVIDERS = [
    AuthProvider.GOOGLE
]

class LoginAttempt(BaseModel):
    """Track login attempts for security"""
    email: EmailStr
    ip_address: str
    user_agent: Optional[str] = None
    success: bool
    failure_reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    provider: str = AuthProvider.GOOGLE
    
class LoginAttemptInDB(LoginAttempt):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[PyObjectId] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SessionBase(BaseModel):
    session_id: str
    user_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool = True
    expires_at: datetime
    google_token: Optional[str] = None  # Store Google access token
    google_refresh_token: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionInDB(SessionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Session(SessionInDB):
    pass

class OAuthState(BaseModel):
    """OAuth state for security"""
    state: str
    provider: str = AuthProvider.GOOGLE
    redirect_uri: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    used: bool = False

class OAuthStateInDB(OAuthState):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class GoogleUserInfo(BaseModel):
    """Google user information from OAuth"""
    google_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    verified_email: bool = False

class SecuritySettings(BaseModel):
    """User security settings (simplified for Google OAuth only)"""
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

class SecuritySettingsInDB(SecuritySettings):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AuthLog(BaseModel):
    """Authentication events log"""
    user_id: Optional[str] = None
    event_type: str  # login, logout, register, token_refresh, etc.
    ip_address: str
    user_agent: Optional[str] = None
    success: bool
    provider: str = AuthProvider.GOOGLE
    details: Optional[Dict[str, Any]] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AuthLogInDB(AuthLog):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[PyObjectId] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Response models for API
class AuthResponse(BaseModel):
    user: Dict[str, Any]
    session_id: str
    google_token: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    """Google OAuth authorization request"""
    code: Optional[str] = None  # Authorization code from Google
    id_token: Optional[str] = None  # ID token from Google
    access_token: Optional[str] = None  # Access token from Google
    redirect_uri: Optional[str] = None

class GoogleAuthResponse(BaseModel):
    """Google OAuth response"""
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: int
    id_token: Optional[str] = None
    token_type: str = "Bearer"

class LogoutRequest(BaseModel):
    session_id: str