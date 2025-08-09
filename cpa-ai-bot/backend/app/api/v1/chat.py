from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.services.chat_service import ChatService
from app.schemas.chat_schema import (
    ChatMessageRequest, ChatMessageResponse, 
    ChatSessionResponse, ChatHistoryResponse
)
from app.api.deps import get_current_active_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
chat_service = ChatService()

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Send a message to the AI bot"""
    try:
        user_id = str(current_user.id)
        
        # Create new session if none provided
        if not request.session_id:
            session = await chat_service.create_session(user_id)
            session_id = session.session_id
        else:
            session_id = request.session_id
            # Verify session belongs to user
            session = await chat_service.get_session(session_id, user_id)
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chat session not found"
                )
        
        # Process the message
        result = await chat_service.process_message(
            session_id, 
            user_id, 
            request.message
        )
        
        return ChatMessageResponse(
            response=result["response"],
            type=result["type"],
            session_id=session_id,
            data=result.get("data")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's chat sessions"""
    try:
        sessions = await chat_service.get_user_sessions(str(current_user.id))
        
        return [
            ChatSessionResponse(
                id=str(session.id),
                session_id=session.session_id,
                title=session.title,
                created_at=session.created_at,
                updated_at=session.updated_at
            )
            for session in sessions
        ]
        
    except Exception as e:
        logger.error(f"Error getting chat sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat sessions"
        )

@router.get("/sessions/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get chat history for a session"""
    try:
        session = await chat_service.get_session(session_id, str(current_user.id))
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        messages = [
            {
                "id": str(msg.id),
                "content": msg.content,
                "is_user": msg.is_user,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in session.messages
        ]
        
        return ChatHistoryResponse(
            session_id=session.session_id,
            title=session.title,
            messages=messages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat history"
        )

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    title: str = "New Chat",
    current_user: User = Depends(get_current_active_user)
):
    """Create a new chat session"""
    try:
        session = await chat_service.create_session(str(current_user.id), title)
        
        return ChatSessionResponse(
            id=str(session.id),
            session_id=session.session_id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat session"
        )