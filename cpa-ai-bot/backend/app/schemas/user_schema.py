from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    business_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    business_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

class UserProfileResponse(UserResponse):
    """Extended user profile with additional information"""
    google_id: Optional[str] = None
    last_login: Optional[datetime] = None
    email_verified: bool = False

class ProfilePictureUploadResponse(BaseModel):
    message: str
    profile_picture: str

class ProfilePictureRemoveResponse(BaseModel):
    message: str

class UserStatisticsResponse(BaseModel):
    user_info: Dict[str, Any]
    expense_statistics: Dict[str, Any]
    chat_statistics: Dict[str, Any]
    recent_activity: Dict[str, Any]

class UserDashboardResponse(BaseModel):
    summary: Dict[str, Any]
    recent_expenses: List[Dict[str, Any]]
    recent_chat_sessions: List[Dict[str, Any]]
    category_summary: Dict[str, float]

class UserActivityResponse(BaseModel):
    type: str
    description: str
    timestamp: datetime
    amount: Optional[float] = None
    category: Optional[str] = None
    data: Dict[str, Any] = {}

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_previous: bool

class UserSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    limit: int = Field(20, ge=1, le=100)

class UserPreferencesRequest(BaseModel):
    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    currency: Optional[str] = Field(None, pattern="^[A-Z]{3}$")
    date_format: Optional[str] = None
    timezone: Optional[str] = None
    notifications: Optional[Dict[str, bool]] = None
    privacy: Optional[Dict[str, bool]] = None

class UserPreferencesResponse(BaseModel):
    theme: str = "light"
    currency: str = "USD"
    date_format: str = "MM/dd/yyyy"
    timezone: str = "UTC"
    notifications: Dict[str, bool] = {}
    privacy: Dict[str, bool] = {}

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class EmailVerificationRequest(BaseModel):
    token: str

class UserDeactivationRequest(BaseModel):
    reason: Optional[str] = None
    feedback: Optional[str] = None

class AdminUserUpdateRequest(BaseModel):
    """Admin-only user update fields"""
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    email_verified: Optional[bool] = None

class UserExportRequest(BaseModel):
    format: str = Field(..., pattern="^(json|csv)$")
    include_expenses: bool = True
    include_chats: bool = False
    date_range: Optional[Dict[str, str]] = None