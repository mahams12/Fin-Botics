from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.models.expense import EXPENSE_CATEGORIES

class ExpenseCreateRequest(BaseModel):
    description: str
    amount: float
    category: str
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseFromTextRequest(BaseModel):
    text: str

class ExpenseUpdateRequest(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    description: str
    amount: float
    category: str
    date: datetime
    notes: Optional[str]
    created_at: datetime

class ExpenseListResponse(BaseModel):
    expenses: List[ExpenseResponse]
    total: int
    page: int
    per_page: int