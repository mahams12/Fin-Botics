import pytest
from httpx import AsyncClient

class TestChat:
    """Test chat endpoints"""
    
    async def test_send_message(self, client: AsyncClient, auth_headers):
        """Test sending a message to the AI bot"""
        message_data = {
            "message": "Hello, how can you help me?"
        }
        
        response = await client.post(
            "/api/v1/chat/message", 
            json=message_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "type" in data
        assert "session_id" in data
        assert data["type"] in ["chat", "expense", "error"]
    
    async def test_send_expense_message(self, client: AsyncClient, auth_headers):
        """Test sending an expense-related message"""
        message_data = {
            "message": "I spent $30 on lunch today"
        }
        
        response = await client.post(
            "/api/v1/chat/message", 
            json=message_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        # Could be either expense type if AI processes it, or chat type
        assert data["type"] in ["expense", "chat"]
    
    async def test_create_chat_session(self, client: AsyncClient, auth_headers):
        """Test creating a new chat session"""
        response = await client.post(
            "/api/v1/chat/sessions", 
            params={"title": "Test Session"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "session_id" in data
        assert "title" in data
        assert data["title"] == "Test Session"
    
    async def test_get_chat_sessions(self, client: AsyncClient, auth_headers):
        """Test getting user's chat sessions"""
        # First create a session
        await client.post("/api/v1/chat/sessions", headers=auth_headers)
        
        response = await client.get("/api/v1/chat/sessions", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_chat_history(self, client: AsyncClient, auth_headers):
        """Test getting chat history for a session"""
        # First create a session and send a message
        message_response = await client.post(
            "/api/v1/chat/message", 
            json={"message": "Test message"}, 
            headers=auth_headers
        )
        session_id = message_response.json()["session_id"]
        
        response = await client.get(
            f"/api/v1/chat/sessions/{session_id}", 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "title" in data
        assert "messages" in data
        assert len(data["messages"]) > 0
    
    async def test_send_message_with_session_id(self, client: AsyncClient, auth_headers):
        """Test sending message to specific session"""
        # Create a session first
        session_response = await client.post("/api/v1/chat/sessions", headers=auth_headers)
        session_id = session_response.json()["session_id"]
        
        message_data = {
            "message": "This is a test message",
            "session_id": session_id
        }
        
        response = await client.post(
            "/api/v1/chat/message", 
            json=message_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
    
    async def test_unauthorized_chat_access(self, client: AsyncClient):
        """Test accessing chat without authentication"""
        response = await client.post(
            "/api/v1/chat/message", 
            json={"message": "Test"}
        )
        
        assert response.status_code == 401
    
    async def test_empty_message(self, client: AsyncClient, auth_headers):
        """Test sending empty message"""
        message_data = {
            "message": ""
        }
        
        response = await client.post(
            "/api/v1/chat/message", 
            json=message_data, 
            headers=auth_headers
        )
        
        # Should either handle gracefully or return validation error
        assert response.status_code in [200, 400, 422]
    
    async def test_get_nonexistent_session(self, client: AsyncClient, auth_headers):
        """Test getting history for non-existent session"""
        fake_session_id = "nonexistent-session-id"
        
        response = await client.get(
            f"/api/v1/chat/sessions/{fake_session_id}", 
            headers=auth_headers
        )
        
        assert response.status_code == 404