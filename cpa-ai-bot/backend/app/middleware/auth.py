from fastapi import Depends, HTTPException, status, Header, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi import Request
import time
from typing import Optional
from app.services.auth_service import AuthService
from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger("auth_middleware")

# Updated dependencies
auth_service = AuthService()

async def get_current_user_by_session(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    session_cookie: Optional[str] = Cookie(None, alias="session_id")
) -> User:
    """Get current authenticated user by session ID"""
    # Try to get session ID from header first, then cookie
    current_session_id = session_id or session_cookie
    
    if not current_session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session ID provided",
        )
    
    user = await auth_service.get_current_user_by_session(current_session_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    return user

async def get_current_user_by_token(
    authorization: Optional[str] = Header(None)
) -> User:
    """Get current authenticated user by Google token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization header provided",
        )
    
    # Extract token from Bearer authorization
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    
    user = await auth_service.get_current_user_by_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate Google token",
        )
    return user

async def get_current_active_user_by_session(
    current_user: User = Depends(get_current_user_by_session)
) -> User:
    """Get current active user via session"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

async def get_current_active_user_by_token(
    current_user: User = Depends(get_current_user_by_token)
) -> User:
    """Get current active user via Google token"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

async def get_admin_user_by_session(
    current_user: User = Depends(get_current_active_user_by_session)
) -> User:
    """Get admin user via session"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_admin_user_by_token(
    current_user: User = Depends(get_current_active_user_by_token)
) -> User:
    """Get admin user via Google token"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Convenience aliases for backward compatibility
get_current_active_user = get_current_active_user_by_session
get_admin_user = get_admin_user_by_session

class AuthMiddleware(BaseHTTPMiddleware):
    """Authentication middleware for protected routes using session-based auth"""
    
    def __init__(self, app, protected_paths: list = None):
        super().__init__(app)
        self.user_db = auth_service.user_db
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
            "/api/v1/auth/google",
            "/api/v1/auth/status"
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
            # Try session-based auth first
            session_id = request.headers.get("X-Session-ID") or request.cookies.get("session_id")
            user = None
            
            if session_id:
                user = await auth_service.get_current_user_by_session(session_id)
            
            # If session auth failed, try Google token
            if not user:
                auth_header = request.headers.get("Authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    user = await auth_service.get_current_user_by_token(token)
            
            if not user:
                logger.warning(f"Authentication failed for {method} {path}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            
            if not user.is_active:
                logger.warning(f"Inactive user attempted access: {user.email}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is inactive",
                )
            
            # Add user info to request state
            request.state.user_id = user.id
            request.state.user = user
            logger.info(f"Authenticated request: {method} {path} [User: {user.email}]")
        
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
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