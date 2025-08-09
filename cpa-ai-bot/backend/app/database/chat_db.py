from typing import Optional, List
from datetime import datetime
from app.database.base import BaseDatabase
from app.models.chat import Message, ChatSession
from bson import ObjectId

class ChatDatabase(BaseDatabase):
    def __init__(self):
        super().__init__("chat_sessions")
        self.messages_collection = None

    @property
    def messages(self):
        if self.messages_collection is None:
            from app.config.database import get_database
            db = get_database()
            self.messages_collection = db["messages"]
        return self.messages_collection

    async def create_session(self, user_id: str, title: str = "New Chat") -> ChatSession:
        """Create a new chat session"""
        session_data = {
            "user_id": ObjectId(user_id),
            "title": title,
            "session_id": str(ObjectId())
        }
        session_dict = await self.create(session_data)
        return ChatSession(**session_dict)

    async def get_session_by_id(self, session_id: str) -> Optional[ChatSession]:
        """Get chat session by ID"""
        session_dict = await self.collection.find_one({"session_id": session_id})
        if session_dict:
            # Get messages for this session
            messages = await self.get_session_messages(session_id)
            session_dict["messages"] = messages
            return ChatSession(**session_dict)
        return None

    async def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """Get all sessions for a user"""
        query = {"user_id": ObjectId(user_id)}
        sessions = await self.find(query)
        return [ChatSession(**session) for session in sessions]

    async def add_message(self, session_id: str, user_id: str, content: str, is_user: bool) -> Message:
        """Add message to chat session"""
        message_data = {
            "session_id": session_id,
            "user_id": ObjectId(user_id),
            "content": content,
            "is_user": is_user,
            "timestamp": datetime.utcnow()
        }
        result = await self.messages.insert_one(message_data)
        message_data["_id"] = result.inserted_id
        return Message(**message_data)

    async def get_session_messages(self, session_id: str, limit: int = 50) -> List[Message]:
        """Get messages for a session"""
        query = {"session_id": session_id}
        cursor = self.messages.find(query).sort("timestamp", 1).limit(limit)
        messages = await cursor.to_list(length=None)
        return [Message(**message) for message in messages]

    async def update_session_title(self, session_id: str, title: str) -> Optional[ChatSession]:
        """Update session title"""
        result = await self.collection.update_one(
            {"session_id": session_id},
            {"$set": {"title": title, "updated_at": datetime.utcnow()}}
        )
        if result.modified_count > 0:
            return await self.get_session_by_id(session_id)
        return None