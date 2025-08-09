from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class MessageBase(BaseModel):
    content: str
    is_user: bool  # True if user message, False if bot response

class MessageCreate(MessageBase):
    pass

class MessageInDB(MessageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    user_id: PyObjectId
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Message(MessageInDB):
    pass

class ChatSessionBase(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionInDB(ChatSessionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ChatSession(ChatSessionInDB):
    messages: List[Message] = []