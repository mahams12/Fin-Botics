import pytest
from httpx import AsyncClient
from datetime import date

class TestReports:
    """Test report endpoints"""
    
    async def test_get_monthly_report(self, client: AsyncClient, auth_headers):
        """Test getting monthly report"""
        params = {
            "year": 2024,
            "month": 1
        }
        
        response = await client.get(
            "/api/v1/reports/monthly", 
            params=params, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "month" in data
        assert "year" in data
        assert "summary" in data
        assert "report_generated_at" in data
        assert data["month"] == 1
        assert data["year"] == 2024
    
    async def test_get_annual_report(self, client: AsyncClient, auth_headers):
        """Test getting annual report"""
        params = {
            "year": 2024
        }
        
        response = await client.get(
            "/api/v1/reports/annual", 
            params=params, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "year" in data
        assert "summary" in data
        assert "monthly_breakdown" in data
        assert "report_generated_at" in data
        assert data["year"] == 2024
        assert len(data["monthly_breakdown"]) == 12
    
    async def test_get_custom_summary(self, client: AsyncClient, auth_headers):
        """Test getting custom period summary"""
        params = {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        
        response = await client.get(
            "/api/v1/reports/summary", 
            params=params, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_expenses" in data
        assert "expense_count" in data
        assert "category_breakdown" in data
        assert "date_range" in data
    
    async def test_monthly_report_invalid_month(self, client: AsyncClient, auth_headers):
        """Test monthly report with invalid month"""
        params = {
            "year": 2024,
            "month": 13  # Invalid month
        }
        
        response = await client.get(
            "/api/v1/reports/monthly", 
            params=params, 
            headers=auth_headers
        )
        
        # Should return validation error
        assert response.status_code == 422
    
    async def test_annual_report_future_year(self, client: AsyncClient, auth_headers):
        """Test annual report for future year"""
        params = {
            "year": 2030  # Future year
        }
        
        response = await client.get(
            "/api/v1/reports/annual", 
            params=params, 
            headers=auth_headers
        )
        
        # Should work but return empty data
        assert response.status_code == 200
        data = response.json()
        assert data["summary"]["total_expenses"] == 0
    
    async def test_summary_invalid_date_range(self, client: AsyncClient, auth_headers):
        """Test summary with invalid date range"""
        params = {
            "start_date": "2024-01-31",
            "end_date": "2024-01-01"  # End before start
        }
        
        response = await client.get(
            "/api/v1/reports/summary", 
            params=params, 
            headers=auth_headers
        )
        
        # Should return validation error
        assert response.status_code in [400, 422]
    
    async def test_unauthorized_report_access(self, client: AsyncClient):
        """Test accessing reports without authentication"""
        params = {
            "year": 2024,
            "month": 1
        }
        
        response = await client.get("/api/v1/reports/monthly", params=params)
        
        assert response.status_code == 401
    
    async def test_reports_with_expenses(self, client: AsyncClient, auth_headers, test_expense):
        """Test reports when user has expenses"""
        params = {
            "year": test_expense.date.year,
            "month": test_expense.date.month
        }
        
        response = await client.get(
            "/api/v1/reports/monthly", 
            params=params, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["summary"]["expense_count"] > 0
        assert data["summary"]["total_expenses"] > 0