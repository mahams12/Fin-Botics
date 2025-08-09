from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
from typing import Optional
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config.settings import settings
from app.database.user_db import UserDatabase
from app.utils.logger import get_logger

logger = get_logger("auth_middleware")

class AuthMiddleware(BaseHTTPMiddleware):
    """Authentication middleware for protected routes using Google OAuth"""
    
    def __init__(self, app, protected_paths: list = None):
        super().__init__(app)
        self.user_db = UserDatabase()
        self.protected_paths = protected_paths or [
            "/api/v1/users",
            "/api/v1/expenses", 
            "/api/v1/chat",
            "/api/v1/reports"
        ]
        
        # Paths that don't require authentication
        self.public_paths = [
            "/",
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/auth/google"
        ]

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Check if path requires authentication
        path = request.url.path
        method = request.method
        
        # Allow OPTIONS requests for CORS
        if method == "OPTIONS":
            response = await call_next(request)
            return response
        
        # Check if path is public
        if self._is_public_path(path):
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            return response
        
        # Check if path requires authentication
        if self._requires_auth(path):
            auth_header = request.headers.get("Authorization")
            
            if not auth_header or not auth_header.startswith("Bearer "):
                logger.warning(f"Missing or invalid Authorization header for {path}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing or invalid authorization header",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            token = auth_header.split(" ")[1]
            user = await self._verify_google_token_and_get_user(token)
            
            if not user:
                logger.warning(f"Invalid Google token for {path}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Add user info to request state
            request.state.user_id = user.id
            request.state.user = user
            logger.info(f"Authenticated request: {method} {path} [User: {user.email}]")
        
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    async def _verify_google_token_and_get_user(self, token: str) -> Optional[User]:
        """Verify Google token and return user"""
        try:
            # Verify Google OAuth token
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            # Check issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            email = idinfo.get('email')
            if not email:
                return None

            # Get user from database
            user = await self.user_db.get_user_by_email(email)
            return user

        except ValueError as e:
            logger.error(f"Google token verification failed: {e}")
            return None
    
    def _is_public_path(self, path: str) -> bool:
        """Check if path is public (no auth required)"""
        return any(path.startswith(public_path) for public_path in self.public_paths)
    
    def _requires_auth(self, path: str) -> bool:
        """Check if path requires authentication"""
        return any(path.startswith(protected_path) for protected_path in self.protected_paths)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app, calls_per_minute: int = 60):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.requests = {}  # In production, use Redis
    
    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Clean old entries
        self._cleanup_old_requests(current_time)
        
        # Check rate limit
        if client_ip in self.requests:
            if len(self.requests[client_ip]) >= self.calls_per_minute:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded"
                )
        
        # Add current request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        self.requests[client_ip].append(current_time)
        
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self, current_time: float):
        """Remove requests older than 1 minute"""
        cutoff_time = current_time - 60  # 1 minute ago
        
        for ip in list(self.requests.keys()):
            self.requests[ip] = [
                req_time for req_time in self.requests[ip] 
                if req_time > cutoff_time
            ]
            
            if not self.requests[ip]:
                del self.requests[ip]