from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from bson import ObjectId
from .user import PyObjectId

class ExpenseCategory:
    OFFICE_SUPPLIES = "office_supplies"
    MARKETING = "marketing"
    TRAVEL = "travel"
    MEALS = "meals"
    UTILITIES = "utilities"
    SOFTWARE = "software"
    PROFESSIONAL_SERVICES = "professional_services"
    OTHER = "other"

EXPENSE_CATEGORIES = [
    ExpenseCategory.OFFICE_SUPPLIES,
    ExpenseCategory.MARKETING,
    ExpenseCategory.TRAVEL,
    ExpenseCategory.MEALS,
    ExpenseCategory.UTILITIES,
    ExpenseCategory.SOFTWARE,
    ExpenseCategory.PROFESSIONAL_SERVICES,
    ExpenseCategory.OTHER
]

class ExpenseBase(BaseModel):
    description: str
    amount: float
    category: str
    date: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseInDB(ExpenseBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Expense(ExpenseInDB):
    pass