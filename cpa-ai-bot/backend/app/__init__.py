"""
CPA AI Bot Backend Application

An AI-powered virtual assistant for small businesses and freelancers to manage 
accounting tasks, expense tracking, and financial queries.

Version: 1.0.0
Author: CPA AI Bot Team
License: MIT

Main Features:
- 🔐 Google OAuth + JWT Authentication
- 🤖 OpenAI GPT Integration for AI Chat
- 💰 Smart Expense Tracking with AI Categorization
- 📊 Financial Reports (Monthly, Annual, Custom)
- 🧮 Tax Estimation and Quarterly Calculations
- 📧 Email Notifications and Reports
- 👥 User Management and Admin Dashboard
- 🗄️ MongoDB Database with Async Operations

Application Structure:
- config/: Database, settings, and authentication configuration
- models/: Pydantic data models for validation
- schemas/: API request/response schemas
- database/: MongoDB CRUD operations
- services/: Business logic and external integrations
- api/: FastAPI route handlers
- utils/: Helper functions and utilities
- middleware/: Custom middleware for security and logging

Technology Stack:
- FastAPI: Modern, fast web framework for building APIs
- MongoDB: NoSQL database with Motor async driver
- OpenAI: GPT integration for AI chat functionality
- Google OAuth: Secure authentication
- JWT: Token-based authorization
- Pydantic: Data validation and serialization
- Docker: Containerization for deployment

Environment Variables Required:
- MONGODB_URL: MongoDB connection string
- OPENAI_API_KEY: OpenAI API key for GPT integration
- GOOGLE_CLIENT_ID: Google OAuth client ID
- GOOGLE_CLIENT_SECRET: Google OAuth client secret
- JWT_SECRET_KEY: Secret key for JWT token signing

Usage:
    To run the application:
    
    1. Install dependencies:
       pip install -r requirements.txt
    
    2. Set up environment variables:
       cp .env.example .env
       # Edit .env with your API keys
    
    3. Start MongoDB:
       docker run -d -p 27017:27017 mongo:7.0
    
    4. Run the application:
       python run.py
       # OR
       uvicorn app.main:app --reload
    
    5. Access the API:
       - Swagger UI: http://localhost:8000/docs
       - Health Check: http://localhost:8000/health

API Endpoints:
    Authentication:
    - POST /api/v1/auth/register - Register new user
    - POST /api/v1/auth/login - Login with email/password
    - POST /api/v1/auth/google - Google OAuth login
    - GET /api/v1/auth/me - Get current user
    
    Users:
    - GET /api/v1/users/profile - Get user profile
    - PUT /api/v1/users/profile - Update user profile
    
    Expenses:
    - POST /api/v1/expenses/ - Create expense
    - POST /api/v1/expenses/from-text - Create from natural language
    - GET /api/v1/expenses/ - List expenses with filters
    - PUT /api/v1/expenses/{id} - Update expense
    - DELETE /api/v1/expenses/{id} - Delete expense
    
    AI Chat:
    - POST /api/v1/chat/message - Send message to AI
    - GET /api/v1/chat/sessions - Get chat sessions
    - GET /api/v1/chat/sessions/{id} - Get chat history
    
    Reports:
    - GET /api/v1/reports/monthly - Monthly financial report
    - GET /api/v1/reports/annual - Annual financial report
    - GET /api/v1/reports/summary - Custom period report
    
    Admin (Admin Only):
    - GET /api/v1/admin/dashboard - Admin dashboard
    - GET /api/v1/admin/users - Manage users
    - GET /api/v1/admin/analytics - System analytics

Database Collections:
    - users: User accounts and authentication
    - expenses: Expense records with AI categorization
    - chat_sessions: AI chat conversation sessions
    - messages: Individual chat messages
    - reports: Generated financial reports
    - scheduled_reports: Automated report schedules
    - report_templates: Reusable report configurations

Security Features:
    - JWT token-based authentication
    - Google OAuth integration
    - Password hashing with bcrypt
    - Request validation with Pydantic
    - CORS protection
    - Rate limiting
    - Input sanitization
    - MongoDB injection prevention

Performance Features:
    - Async/await throughout the application
    - Database connection pooling
    - Optimized MongoDB queries with indexing
    - Response caching where appropriate
    - Efficient pagination
    - Background task processing

Development Features:
    - Auto-reload in development mode
    - Comprehensive test suite with pytest
    - Docker support for easy deployment
    - Environment-based configuration
    - Structured logging
    - API documentation with Swagger UI
    - Code formatting and linting support

Deployment:
    The application is ready for deployment with:
    - Docker containerization
    - Environment variable configuration
    - Production-ready security settings
    - Health check endpoints
    - Graceful shutdown handling
    - Error monitoring and logging
"""

import logging
from typing import Dict, Any

# Application metadata
__version__ = "1.0.0"
__title__ = "CPA AI Bot Backend"
__description__ = "AI-powered accounting assistant for small businesses and freelancers"
__author__ = "CPA AI Bot Team"
__license__ = "MIT"

# Configure logging for the application
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Create application logger
logger = logging.getLogger(__name__)

def get_application_info() -> Dict[str, Any]:
    """Get application information"""
    return {
        "name": __title__,
        "version": __version__,
        "description": __description__,
        "author": __author__,
        "license": __license__
    }

def get_health_info() -> Dict[str, Any]:
    """Get application health information"""
    return {
        "status": "healthy",
        "service": __title__,
        "version": __version__,
        "description": __description__
    }

# Application startup banner
def print_startup_banner():
    """Print application startup banner"""
    banner = f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║                    🤖 CPA AI Bot Backend                     ║
    ║                                                              ║
    ║                    Version: {__version__}                            ║
    ║                                                              ║
    ║    AI-powered accounting assistant for small businesses      ║
    ║                                                              ║
    ║    Features:                                                 ║
    ║    • 🔐 Google OAuth + JWT Authentication                    ║
    ║    • 🤖 OpenAI GPT Integration                               ║
    ║    • 💰 Smart Expense Tracking                               ║
    ║    • 📊 Financial Reports & Analytics                        ║
    ║    • 🧮 Tax Estimation & Planning                            ║
    ║    • 📧 Email Notifications                                  ║
    ║    • 👥 User & Admin Management                              ║
    ║                                                              ║
    ║    Ready for production deployment! 🚀                       ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

# Log application startup
logger.info(f"Initializing {__title__} v{__version__}")

# Export commonly used items
__all__ = [
    "__version__",
    "__title__", 
    "__description__",
    "__author__",
    "__license__",
    "get_application_info",
    "get_health_info",
    "print_startup_banner",
    "logger"
]