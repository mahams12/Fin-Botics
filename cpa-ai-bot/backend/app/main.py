from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

# Import routers from the v1 package
from app.api.v1 import (
    auth_router,
    users_router,
    expenses_router,
    chat_router,
    reports_router,
    admin_router
)

# Import config
from app.config.settings import settings
from app.config.database import connect_to_mongo, close_mongo_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FinBotics API...")
    try:
        await connect_to_mongo()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
    
    # Create upload directories
    upload_dirs = [
        "uploads/profile_pictures",
        "uploads/receipts",
        "uploads/documents"
    ]
    
    for upload_dir in upload_dirs:
        os.makedirs(upload_dir, exist_ok=True)
        logger.info(f"Created upload directory: {upload_dir}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down FinBotics API...")
    try:
        await close_mongo_connection()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered CPA assistant for small businesses and freelancers",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Include routers with logging
logger.info("Including API routers...")

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
logger.info("✓ Auth router included")

app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
logger.info("✓ Users router included")

app.include_router(expenses_router, prefix="/api/v1/expenses", tags=["Expenses"])
logger.info("✓ Expenses router included")

app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
logger.info("✓ Chat router included")

app.include_router(reports_router, prefix="/api/v1/reports", tags=["Reports"])
logger.info("✓ Reports router included")

app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
logger.info("✓ Admin router included")

logger.info("All routers included successfully!")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to FinBotics API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "Documentation not available in production"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API is working"""
    return {"message": "API is working", "timestamp": "2025-01-01"}

# Add this for debugging - remove in production
if settings.DEBUG:
    @app.get("/debug/routes")
    async def debug_routes():
        """Debug endpoint to see all registered routes"""
        routes = []
        for route in app.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                routes.append({
                    "path": route.path,
                    "methods": list(route.methods)
                })
        return routes