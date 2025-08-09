"""
CPA AI Bot Backend Application

A FastAPI-based backend for an AI-powered CPA assistant that helps with
expense tracking, tax preparation, and financial reporting.
"""

__version__ = "1.0.0"
__author__ = "CPA AI Bot Team"
__description__ = "AI-powered CPA assistant backend"

# Package metadata
__all__ = [
    "__version__",
    "__author__", 
    "__description__"
]

# Application constants
APP_NAME = "CPA AI Bot"
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# Supported file types for uploads
SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
SUPPORTED_DOCUMENT_TYPES = {"application/pdf", "text/plain"}
SUPPORTED_SPREADSHEET_TYPES = {
    "text/csv", 
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

# All supported file types
SUPPORTED_FILE_TYPES = (
    SUPPORTED_IMAGE_TYPES | 
    SUPPORTED_DOCUMENT_TYPES | 
    SUPPORTED_SPREADSHEET_TYPES
)

# Default pagination settings
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Cache expiration times (in seconds)
CACHE_EXPIRATION = {
    "user_profile": 300,      # 5 minutes
    "expense_stats": 180,     # 3 minutes
    "chat_history": 600,      # 10 minutes
    "reports": 1800,          # 30 minutes
}

# Rate limiting settings
RATE_LIMITS = {
    "auth": "5/minute",       # 5 auth attempts per minute
    "chat": "30/minute",      # 30 chat messages per minute
    "api": "100/minute",      # 100 API calls per minute
    "upload": "10/minute",    # 10 file uploads per minute
}