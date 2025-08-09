import pytest
from httpx import AsyncClient
from datetime import datetime

class TestExpenses:
    """Test expense endpoints"""
    
    async def test_create_expense(self, client: AsyncClient, auth_headers):
        """Test creating a new expense"""
        expense_data = {
            "description": "Test expense",
            "amount": 50.00,
            "category": "office_supplies",
            "notes": "Test notes"
        }
        
        response = await client.post(
            "/api/v1/expenses/", 
            json=expense_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == expense_data["description"]
        assert data["amount"] == expense_data["amount"]
        assert data["category"] == expense_data["category"]
        assert "id" in data
    
    async def test_create_expense_from_text(self, client: AsyncClient, auth_headers):
        """Test creating expense from natural language"""
        text_data = {
            "text": "I spent $25 on office supplies"
        }
        
        response = await client.post(
            "/api/v1/expenses/from-text", 
            json=text_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "expense" in data
        assert "categorization" in data
    
    async def test_get_expenses(self, client: AsyncClient, auth_headers, test_expense):
        """Test getting user expenses"""
        response = await client.get("/api/v1/expenses/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "expenses" in data
        assert "total" in data
        assert "page" in data
        assert len(data["expenses"]) > 0
    
    async def test_get_expense_by_id(self, client: AsyncClient, auth_headers, test_expense):
        """Test getting specific expense"""
        expense_id = str(test_expense.id)
        response = await client.get(f"/api/v1/expenses/{expense_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == expense_id
        assert data["description"] == test_expense.description
    
    async def test_update_expense(self, client: AsyncClient, auth_headers, test_expense):
        """Test updating an expense"""
        expense_id = str(test_expense.id)
        update_data = {
            "description": "Updated expense",
            "amount": 75.00
        }
        
        response = await client.put(
            f"/api/v1/expenses/{expense_id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == update_data["description"]
        assert data["amount"] == update_data["amount"]
    
    async def test_delete_expense(self, client: AsyncClient, auth_headers, test_expense):
        """Test deleting an expense"""
        expense_id = str(test_expense.id)
        response = await client.delete(f"/api/v1/expenses/{expense_id}", headers=auth_headers)
        
        assert response.status_code == 200
        assert "message" in response.json()
    
    async def test_get_expenses_with_filters(self, client: AsyncClient, auth_headers):
        """Test getting expenses with category filter"""
        params = {
            "category": "office_supplies",
            "page": 1,
            "per_page": 10
        }
        
        response = await client.get("/api/v1/expenses/", params=params, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "expenses" in data
    
    async def test_create_expense_invalid_amount(self, client: AsyncClient, auth_headers):
        """Test creating expense with invalid amount"""
        expense_data = {
            "description": "Test expense",
            "amount": -50.00,  # Negative amount
            "category": "office_supplies"
        }
        
        response = await client.post(
            "/api/v1/expenses/", 
            json=expense_data, 
            headers=auth_headers
        )
        
        # Should be handled by validation
        assert response.status_code in [400, 422]
    
    async def test_create_expense_invalid_category(self, client: AsyncClient, auth_headers):
        """Test creating expense with invalid category"""
        expense_data = {
            "description": "Test expense",
            "amount": 50.00,
            "category": "invalid_category"
        }
        
        response = await client.post(
            "/api/v1/expenses/", 
            json=expense_data, 
            headers=auth_headers
        )
        
        # Should either reject or default to "other"
        assert response.status_code in [200, 400, 422]
    
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test accessing expenses without authentication"""
        response = await client.get("/api/v1/expenses/")
        
        assert response.status_code == 401