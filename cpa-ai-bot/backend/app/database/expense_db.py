from typing import Optional, List
from datetime import datetime, date
from app.database.base import BaseDatabase
from app.models.expense import Expense, ExpenseInDB
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class ExpenseDatabase(BaseDatabase):
    def __init__(self):
        super().__init__("expenses") 

    async def create_expense(self, user_id: str, expense_data: dict) -> Expense:
        """Create a new expense"""
        expense_data["user_id"] = ObjectId(user_id)
        expense_data["created_at"] = datetime.utcnow()
        expense_data["updated_at"] = datetime.utcnow()
        
        expense_dict = await self.create(expense_data)
        return Expense(**expense_dict) 

    async def get_expense_by_id(self, expense_id: str) -> Optional[Expense]:
        """Get expense by ID"""
        expense_dict = await self.get_by_id(expense_id)
        if expense_dict:
            return Expense(**expense_dict)
        return None 

    async def get_user_expenses(
        self, 
        user_id: str,
        limit: int = 50,
        skip: int = 0,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[str] = None
    ) -> List[Expense]:
        """Get user's expenses with optional filters"""
        query = {"user_id": ObjectId(user_id)}
        
        logger.info(f"Building query for user {user_id}")
        
        # Date range filter
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
                logger.info(f"Start date filter: {start_date}")
            if end_date:
                date_filter["$lte"] = end_date
                logger.info(f"End date filter: {end_date}")
            query["date"] = date_filter
        
        # Category filter
        if category:
            query["category"] = category
            logger.info(f"Category filter: {category}")
        
        logger.info(f"Final query: {query}")
        
        # Sort by date descending (newest first)
        sort_order = [("date", -1), ("created_at", -1)]
        
        expenses = await self.find(query, limit=limit, skip=skip, sort=sort_order)
        logger.info(f"Found {len(expenses)} expenses in database")
        
        return [Expense(**expense) for expense in expenses] 

    async def update_expense(self, expense_id: str, update_data: dict) -> Optional[Expense]:
        """Update expense"""
        update_data["updated_at"] = datetime.utcnow()
        expense_dict = await self.update(expense_id, update_data)
        if expense_dict:
            return Expense(**expense_dict)
        return None 

    async def delete_expense(self, expense_id: str) -> bool:
        """Delete expense"""
        return await self.delete(expense_id) 

    async def get_expenses_by_category(self, user_id: str, category: str) -> List[Expense]:
        """Get expenses by category"""
        return await self.get_user_expenses(user_id, category=category) 

    async def get_monthly_expenses(self, user_id: str, year: int, month: int) -> List[Expense]:
        """Get expenses for a specific month"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        return await self.get_user_expenses(
            user_id, 
            start_date=start_date,
            end_date=end_date
        )