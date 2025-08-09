import pytest
from httpx import AsyncClient

class TestAuth:
    """Test authentication endpoints"""
    
    async def test_register_user(self, client: AsyncClient):
        """Test user registration"""
        user_data = {
            "email": "newuser@example.com",
            "password": "newpassword123",
            "full_name": "New User"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == user_data["email"]
        assert data["user"]["full_name"] == user_data["full_name"]
    
    async def test_register_duplicate_email(self, client: AsyncClient, test_user):
        """Test registration with duplicate email"""
        user_data = {
            "email": test_user.email,
            "password": "password123",
            "full_name": "Duplicate User"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    async def test_login_valid_credentials(self, client: AsyncClient, test_user):
        """Test login with valid credentials"""
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_user.email
    
    async def test_login_invalid_credentials(self, client: AsyncClient, test_user):
        """Test login with invalid credentials"""
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    async def test_get_current_user(self, client: AsyncClient, auth_headers):
        """Test getting current user info"""
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "full_name" in data
        assert "is_active" in data
    
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email"""
        user_data = {
            "email": "invalid-email",
            "password": "password123",
            "full_name": "Test User"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422  # Validation error
    
    async def test_register_weak_password(self, client: AsyncClient):
        """Test registration with weak password"""
        user_data = {
            "email": "test@example.com",
            "password": "123",  # Too short
            "full_name": "Test User"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        # This might be handled by validation or business logic
        assert response.status_code in [400, 422]