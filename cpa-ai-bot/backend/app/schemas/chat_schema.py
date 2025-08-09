from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    response: str
    type: str
    session_id: str
    data: Optional[dict] = None

class ChatSessionResponse(BaseModel):
    id: str
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime

class ChatHistoryResponse(BaseModel):
    session_id: str
    title: str
    messages: List[dict]