from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime

class GoogleAuthRequest(BaseModel):
    """Google OAuth authentication request"""
    # Add the credential field that your frontend is sending
    credential: Optional[str] = Field(None, description="JWT credential token from Google OAuth")
    token: Optional[str] = Field(None, description="Alternative token field name")
    code: Optional[str] = Field(None, description="Authorization code from Google OAuth")
    id_token: Optional[str] = Field(None, description="ID token from Google")
    access_token: Optional[str] = Field(None, description="Access token from Google")
    redirect_uri: Optional[str] = Field(None, description="Redirect URI used in OAuth flow")
    state: Optional[str] = Field(None, description="State parameter for security")

    class Config:
        # Allow extra fields from frontend
        extra = "allow"
        json_schema_extra = {
            "example": {
                "credential": "eyJhbGciOiJSUzI1NiIs...",
                "code": "4/0AX4XfWh...",
                "redirect_uri": "http://localhost:3000/auth/callback",
                "state": "random_state_string"
            }
        }

class LoginRequest(BaseModel):
    """Login request (redirects to Google OAuth)"""
    redirect_uri: Optional[str] = Field(None, description="Where to redirect after login")
    
    class Config:
        json_schema_extra = {
            "example": {
                "redirect_uri": "http://localhost:3000/dashboard"
            }
        }

class RegisterRequest(BaseModel):
    """Register request (handled through Google OAuth)"""
    redirect_uri: Optional[str] = Field(None, description="Where to redirect after registration")
    terms_accepted: bool = Field(True, description="User must accept terms and conditions")
    
    class Config:
        json_schema_extra = {
            "example": {
                "redirect_uri": "http://localhost:3000/dashboard",
                "terms_accepted": True
            }
        }

class TokenResponse(BaseModel):
    """Authentication token response"""
    session_id: str = Field(..., description="Session identifier")
    user: Dict[str, Any] = Field(..., description="User information")
    google_token: Optional[str] = Field(None, description="Google access token")
    expires_in: Optional[int] = Field(None, description="Token expiration time in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "sess_123456789",
                "user": {
                    "id": "user_123",
                    "email": "user@example.com",
                    "name": "John Doe",
                    "picture": "https://lh3.googleusercontent.com/...",
                    "google_id": "123456789"
                },
                "google_token": "ya29.a0AWY7C...",
                "expires_in": 3600
            }
        }

class LogoutRequest(BaseModel):
    """Logout request"""
    session_id: str = Field(..., description="Session ID to logout")
    everywhere: bool = Field(False, description="Logout from all devices")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "sess_123456789",
                "everywhere": False
            }
        }

class AuthStatusResponse(BaseModel):
    """Authentication status response"""
    is_authenticated: bool = Field(..., description="Whether user is authenticated")
    user: Optional[Dict[str, Any]] = Field(None, description="User information if authenticated")
    session_expires_at: Optional[datetime] = Field(None, description="When session expires")
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_authenticated": True,
                "user": {
                    "id": "user_123",
                    "email": "user@example.com",
                    "name": "John Doe"
                },
                "session_expires_at": "2025-08-09T12:00:00Z"
            }
        }

class GoogleOAuthUrlResponse(BaseModel):
    """Google OAuth URL response"""
    auth_url: str = Field(..., description="Google OAuth authorization URL")
    state: str = Field(..., description="State parameter for security verification")
    
    class Config:
        json_schema_extra = {
            "example": {
                "auth_url": "https://accounts.google.com/oauth/authorize?client_id=...",
                "state": "random_state_string"
            }
        }