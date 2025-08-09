"""
CPA AI Bot API Module

This package contains all API routes and dependencies for the CPA AI Bot backend.

API Structure:
- deps.py: Common API dependencies (authentication, pagination, etc.)
- v1/: Version 1 API endpoints
  - auth.py: Authentication and authorization endpoints
  - users.py: User management endpoints
  - expenses.py: Expense tracking and management endpoints
  - chat.py: AI chat functionality endpoints
  - reports.py: Financial reporting endpoints
  - admin.py: Administrative endpoints

API Version: 1.0
Base URL: /api/v1

Authentication:
    The API uses JWT (JSON Web Tokens) for authentication along with
    Google OAuth integration. Most endpoints require authentication
    except for registration, login, and health checks.

    Authentication Methods:
    1. Email/Password → JWT Token
    2. Google OAuth → JWT Token
    3. JWT Token for subsequent requests

Rate Limiting:
    - 60 requests per minute per IP address
    - Higher limits for authenticated users
    - Admin endpoints have stricter limits

Response Format:
    All API responses follow a consistent format:
    - Success: HTTP 200-299 with data
    - Client Error: HTTP 400-499 with error details
    - Server Error: HTTP 500-599 with error message

Common HTTP Status Codes:
    - 200: Success
    - 201: Created
    - 400: Bad Request (validation error)
    - 401: Unauthorized (missing/invalid token)
    - 403: Forbidden (insufficient permissions)
    - 404: Not Found
    - 422: Unprocessable Entity (validation error)
    - 429: Too Many Requests (rate limited)
    - 500: Internal Server Error

API Documentation:
    - Swagger UI: /docs
    - ReDoc: /redoc
    - OpenAPI JSON: /openapi.json

CORS Configuration:
    The API is configured to accept requests from:
    - http://localhost:3000 (React development)
    - http://127.0.0.1:3000 (Alternative localhost)
    - Production frontend domains (configured via environment)

Security Features:
    - JWT token-based authentication
    - Password hashing with bcrypt
    - Request validation with Pydantic
    - CORS protection
    - Rate limiting
    - Input sanitization
    - SQL injection prevention (MongoDB)
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

# API metadata
API_VERSION = "1.0.0"
API_TITLE = "CPA AI Bot API"
API_DESCRIPTION = "AI-powered accounting assistant for small businesses and freelancers"

# API route prefixes
API_V1_PREFIX = "/api/v1"

# Common response formats
def success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """Standard success response format"""
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error_response(message: str, error_code: str = None, details: Any = None) -> Dict[str, Any]:
    """Standard error response format"""
    response = {
        "success": False,
        "message": message
    }
    
    if error_code:
        response["error_code"] = error_code
    
    if details:
        response["details"] = details
    
    return response

def paginated_response(
    items: list,
    total: int,
    page: int,
    per_page: int,
    message: str = "Success"
) -> Dict[str, Any]:
    """Standard paginated response format"""
    total_pages = (total + per_page - 1) // per_page if per_page > 0 else 1
    
    return {
        "success": True,
        "message": message,
        "data": items,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1
        }
    }

# Exception handlers
async def validation_exception_handler(request: Request, exc: Exception):
    """Handle validation exceptions"""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content=error_response(
            "Validation error",
            "VALIDATION_ERROR",
            str(exc)
        )
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            exc.detail,
            f"HTTP_{exc.status_code}"
        )
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=error_response(
            "Internal server error",
            "INTERNAL_ERROR"
        )
    )

# Common API dependencies and utilities
def get_api_metadata() -> Dict[str, Any]:
    """Get API metadata"""
    return {
        "title": API_TITLE,
        "version": API_VERSION,
        "description": API_DESCRIPTION,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Rate limiting configuration
RATE_LIMIT_CONFIG = {
    "default": "60/minute",
    "auth": "10/minute",
    "admin": "30/minute",
    "upload": "5/minute"
}

# API response headers
COMMON_HEADERS = {
    "X-API-Version": API_VERSION,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
}

# Export commonly used utilities
__all__ = [
    "API_VERSION",
    "API_TITLE", 
    "API_DESCRIPTION",
    "API_V1_PREFIX",
    "success_response",
    "error_response", 
    "paginated_response",
    "validation_exception_handler",
    "http_exception_handler",
    "general_exception_handler",
    "get_api_metadata",
    "RATE_LIMIT_CONFIG",
    "COMMON_HEADERS"
]