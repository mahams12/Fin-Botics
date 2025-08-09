from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from .user import PyObjectId

class TokenType:
    ACCESS = "access"
    REFRESH = "refresh"
    RESET_PASSWORD = "reset_password"
    EMAIL_VERIFICATION = "email_verification"
    API_KEY = "api_key"

TOKEN_TYPES = [
    TokenType.ACCESS,
    TokenType.REFRESH,
    TokenType.RESET_PASSWORD,
    TokenType.EMAIL_VERIFICATION,
    TokenType.API_KEY
]

class AuthProvider:
    EMAIL = "email"
    GOOGLE = "google"
    FACEBOOK = "facebook"
    GITHUB = "github"
    MICROSOFT = "microsoft"

AUTH_PROVIDERS = [
    AuthProvider.EMAIL,
    AuthProvider.GOOGLE,
    AuthProvider.FACEBOOK,
    AuthProvider.GITHUB,
    AuthProvider.MICROSOFT
]

class TokenBase(BaseModel):
    token: str
    token_type: str
    expires_at: datetime
    is_revoked: bool = False
    user_id: str

class TokenCreate(TokenBase):
    pass

class TokenInDB(TokenBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_used_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Token(TokenInDB):
    pass

class LoginAttempt(BaseModel):
    """Track login attempts for security"""
    email: EmailStr
    ip_address: str
    user_agent: Optional[str] = None
    success: bool
    failure_reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
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
    provider: str
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

class PasswordReset(BaseModel):
    """Password reset token"""
    email: EmailStr
    token: str
    expires_at: datetime
    used: bool = False
    
class PasswordResetInDB(PasswordReset):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class EmailVerification(BaseModel):
    """Email verification token"""
    email: EmailStr
    token: str
    expires_at: datetime
    verified: bool = False
    
class EmailVerificationInDB(EmailVerification):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class APIKey(BaseModel):
    """API key for programmatic access"""
    name: str
    key_hash: str  # Hashed version of the key
    permissions: List[str] = []
    is_active: bool = True
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    
class APIKeyInDB(APIKey):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SecuritySettings(BaseModel):
    """User security settings"""
    two_factor_enabled: bool = False
    two_factor_secret: Optional[str] = None
    backup_codes: List[str] = []
    password_changed_at: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    security_questions: Dict[str, str] = {}

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
    event_type: str  # login, logout, register, password_change, etc.
    ip_address: str
    user_agent: Optional[str] = None
    success: bool
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
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None
    scope: Optional[str] = None

class AuthResponse(BaseModel):
    user: Dict[str, Any]
    tokens: TokenResponse
    session_id: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class EnableTwoFactorRequest(BaseModel):
    password: str

class VerifyTwoFactorRequest(BaseModel):
    code: str