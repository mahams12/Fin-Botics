"""
CPA AI Bot Backend Test Suite

This package contains comprehensive tests for the CPA AI Bot backend application.

Test Structure:
- test_auth.py: Authentication and authorization tests
- test_expenses.py: Expense management functionality tests  
- test_chat.py: AI chat functionality tests
- test_reports.py: Financial reporting tests
- test_users.py: User management tests (if needed)
- conftest.py: Test configuration and fixtures

Test Categories:
- Unit Tests: Individual function/method testing
- Integration Tests: Component interaction testing
- API Tests: Endpoint functionality testing
- Database Tests: Data persistence and retrieval testing

Usage:
    # Run all tests
    pytest
    
    # Run specific test file
    pytest tests/test_auth.py
    
    # Run with coverage
    pytest --cov=app --cov-report=html
    
    # Run specific test category
    pytest -m auth
    pytest -m expense
    pytest -m chat
    pytest -m report

Test Database:
    Tests use a separate test database (cpa_ai_bot_test) to avoid
    interfering with development data. The test database is automatically
    created and cleaned up during test runs.

Environment Variables:
    Tests use environment variables from .env or override them for testing:
    - TESTING=1
    - MONGODB_URL=mongodb://localhost:27017/cpa_ai_bot_test
    - DATABASE_NAME=cpa_ai_bot_test

Fixtures Available:
    - client: AsyncClient for API testing
    - db: Test database instance
    - test_user: Sample user for testing
    - auth_headers: Authentication headers
    - test_expense: Sample expense data
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the app directory to Python path for imports
app_dir = Path(__file__).parent.parent / "app"
sys.path.insert(0, str(app_dir))

# Set testing environment variable
os.environ["TESTING"] = "1"

# Test configuration
TEST_DATABASE_NAME = "cpa_ai_bot_test"
TEST_MONGODB_URL = f"mongodb://localhost:27017/{TEST_DATABASE_NAME}"

# Override database settings for testing
os.environ["DATABASE_NAME"] = TEST_DATABASE_NAME
os.environ["MONGODB_URL"] = TEST_MONGODB_URL

# Test categories for pytest markers
TEST_CATEGORIES = {
    "auth": "Authentication and authorization tests",
    "expense": "Expense management tests", 
    "chat": "AI chat functionality tests",
    "report": "Financial reporting tests",
    "user": "User management tests",
    "integration": "Integration tests",
    "unit": "Unit tests",
    "slow": "Slow running tests"
}

# Common test data
SAMPLE_USER_DATA = {
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
}

SAMPLE_EXPENSE_DATA = {
    "description": "Test expense",
    "amount": 50.00,
    "category": "office_supplies",
    "notes": "Test expense for testing"
}

SAMPLE_CHAT_MESSAGE = {
    "message": "How much tax do I owe this year?"
}

# Test utilities
class TestConfig:
    """Test configuration class"""
    TESTING = True
    DATABASE_NAME = TEST_DATABASE_NAME
    MONGODB_URL = TEST_MONGODB_URL
    JWT_SECRET_KEY = "test-secret-key-for-testing-only"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    DEBUG = True

def get_test_config():
    """Get test configuration"""
    return TestConfig()

async def cleanup_test_database():
    """Clean up test database after tests"""
    try:
        from app.config.database import get_database, connect_to_mongo
        await connect_to_mongo()
        db = get_database()
        
        # Drop all collections in test database
        collections = await db.list_collection_names()
        for collection in collections:
            await db[collection].drop()
            
        print(f"✅ Cleaned up test database: {TEST_DATABASE_NAME}")
    except Exception as e:
        print(f"⚠️ Error cleaning up test database: {e}")

def pytest_configure(config):
    """Configure pytest with custom markers"""
    for marker, description in TEST_CATEGORIES.items():
        config.addinivalue_line("markers", f"{marker}: {description}")

# Export commonly used test utilities
__all__ = [
    "TEST_DATABASE_NAME",
    "TEST_MONGODB_URL", 
    "SAMPLE_USER_DATA",
    "SAMPLE_EXPENSE_DATA",
    "SAMPLE_CHAT_MESSAGE",
    "TestConfig",
    "get_test_config",
    "cleanup_test_database",
    "TEST_CATEGORIES"
]