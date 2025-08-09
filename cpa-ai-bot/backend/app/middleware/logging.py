from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import json
from app.utils.logger import get_logger

logger = get_logger("request")

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses"""
    
    def __init__(self, app):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        await self._log_request(request)
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        self._log_response(request, response, process_time)
        
        # Add processing time to headers
        response.headers["X-Process-Time"] = str(round(process_time, 4))
        
        return response
    
    async def _log_request(self, request: Request):
        """Log incoming request"""
        method = request.method
        url = str(request.url)
        headers = dict(request.headers)
        
        # Remove sensitive headers for logging
        safe_headers = {
            k: v for k, v in headers.items() 
            if k.lower() not in ["authorization", "cookie", "x-api-key"]
        }
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Log request info
        logger.info(f"Request: {method} {url} from {client_ip}")
        
        # Log headers in debug mode
        if logger.isEnabledFor(10):  # DEBUG level
            logger.debug(f"Request headers: {safe_headers}")
    
    def _log_response(self, request: Request, response: Response, process_time: float):
        """Log response"""
        method = request.method
        url = str(request.url)
        status_code = response.status_code
        
        # Determine log level based on status code
        if status_code >= 500:
            log_func = logger.error
        elif status_code >= 400:
            log_func = logger.warning
        else:
            log_func = logger.info
        
        log_func(
            f"Response: {method} {url} - "
            f"Status: {status_code} - "
            f"Time: {process_time:.4f}s"
        )
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers first
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response