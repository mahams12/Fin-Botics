from typing import List, Optional, Dict, Any
from datetime import datetime, date
from app.database.expense_db import ExpenseDatabase
from app.models.expense import Expense, ExpenseCreate, EXPENSE_CATEGORIES
from app.services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class ExpenseService:
    def __init__(self):
        self.expense_db = ExpenseDatabase()
        self.ai_service = AIService()

    async def create_expense(self, user_id: str, expense_data: ExpenseCreate) -> Expense:
        """Create a new expense"""
        # Validate category
        if expense_data.category not in EXPENSE_CATEGORIES:
            expense_data.category = "other"

        expense_dict = expense_data.dict()
        return await self.expense_db.create_expense(user_id, expense_dict)

    async def create_expense_from_text(self, user_id: str, text: str) -> Dict[str, Any]:
        """Create expense from natural language text"""
        try:
            logger.info(f"Creating expense from text for user {user_id}: {text}")
            
            # Parse expense from text
            parsed_data = await self.ai_service.parse_expense_from_text(text)
            
            if not parsed_data or 'amount' not in parsed_data or 'description' not in parsed_data:
                return {
                    "success": False,
                    "error": "Could not extract expense information from text",
                    "suggestion": "Please provide amount and description clearly. Example: 'I spent $50 on office supplies'"
                }

            # Categorize the expense
            categorization = await self.ai_service.categorize_expense(
                parsed_data['description'], 
                parsed_data['amount']
            )

            # Create expense
            expense_data = ExpenseCreate(
                description=parsed_data['description'],
                amount=parsed_data['amount'],
                category=categorization['category'],
                date=datetime.utcnow(),
                notes=f"Created from text: {text}"
            )

            expense = await self.create_expense(user_id, expense_data)

            logger.info(f"Expense created successfully from text for user {user_id}")
            
            return {
                "success": True,
                "expense": expense,
                "categorization": categorization
            }

        except Exception as e:
            logger.error(f"Error creating expense from text: {e}")
            return {
                "success": False,
                "error": "Failed to process expense",
                "details": str(e),
                "suggestion": "Please try with a clearer format like 'I paid $25 for lunch'"
            }

    async def get_user_expenses(
        self, 
        user_id: str, 
        limit: int = 50, 
        skip: int = 0,
        category: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Expense]:
        """Get user's expenses with filters"""
        start_datetime = datetime.combine(start_date, datetime.min.time()) if start_date else None
        end_datetime = datetime.combine(end_date, datetime.max.time()) if end_date else None
        
        return await self.expense_db.get_user_expenses(
            user_id=user_id,
            limit=limit,
            skip=skip,
            category=category,
            start_date=start_datetime,
            end_date=end_datetime
        )

    async def get_expense_by_id(self, expense_id: str, user_id: str) -> Optional[Expense]:
        """Get expense by ID (with user verification)"""
        expense = await self.expense_db.get_expense_by_id(expense_id)
        if expense and str(expense.user_id) == user_id:
            return expense
        return None

    async def update_expense(self, expense_id: str, user_id: str, update_data: dict) -> Optional[Expense]:
        """Update expense (with user verification)"""
        # Verify ownership
        expense = await self.get_expense_by_id(expense_id, user_id)
        if not expense:
            return None

        # Validate category if being updated
        if 'category' in update_data and update_data['category'] not in EXPENSE_CATEGORIES:
            update_data['category'] = "other"

        return await self.expense_db.update_expense(expense_id, update_data)

    async def delete_expense(self, expense_id: str, user_id: str) -> bool:
        """Delete expense (with user verification)"""
        # Verify ownership
        expense = await self.get_expense_by_id(expense_id, user_id)
        if not expense:
            return False

        return await self.expense_db.delete_expense(expense_id)

    async def get_expense_stats(self, user_id: str, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get comprehensive expense statistics for date range"""
        try:
            logger.info(f"Getting expense stats for user {user_id} from {start_date} to {end_date}")
            
            expenses = await self.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=1000  # Get all expenses for the period
            )

            # Calculate totals by category
            category_totals = {}
            total_amount = 0
            monthly_totals = {}

            for expense in expenses:
                category = expense.category
                amount = float(expense.amount)
                expense_date = expense.date
                
                # Category totals
                if category not in category_totals:
                    category_totals[category] = 0
                category_totals[category] += amount
                total_amount += amount
                
                # Monthly totals
                month_key = expense_date.strftime('%Y-%m')
                if month_key not in monthly_totals:
                    monthly_totals[month_key] = 0
                monthly_totals[month_key] += amount

            # Calculate averages
            days_in_period = (end_date - start_date).days + 1
            avg_daily = total_amount / days_in_period if days_in_period > 0 else 0
            avg_expense = total_amount / len(expenses) if expenses else 0

            # Find top categories
            sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
            top_categories = sorted_categories[:5]

            stats = {
                "summary": {
                    "total_expenses": round(total_amount, 2),
                    "expense_count": len(expenses),
                    "average_daily": round(avg_daily, 2),
                    "average_expense": round(avg_expense, 2)
                },
                "category_breakdown": {
                    category: round(amount, 2) 
                    for category, amount in category_totals.items()
                },
                "top_categories": [
                    {"category": cat, "amount": round(amount, 2)} 
                    for cat, amount in top_categories
                ],
                "monthly_totals": {
                    month: round(amount, 2) 
                    for month, amount in monthly_totals.items()
                },
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                    "days": days_in_period
                }
            }

            logger.info(f"Expense stats calculated for user {user_id}: {stats['summary']}")
            return stats

        except Exception as e:
            logger.error(f"Error calculating expense stats: {e}")
            # Return empty stats instead of raising error
            return {
                "summary": {
                    "total_expenses": 0,
                    "expense_count": 0,
                    "average_daily": 0,
                    "average_expense": 0
                },
                "category_breakdown": {},
                "top_categories": [],
                "monthly_totals": {},
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                    "days": (end_date - start_date).days + 1
                }
            }

    async def get_expense_summary(self, user_id: str, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get expense summary for date range (backward compatibility)"""
        return await self.get_expense_stats(user_id, start_date, end_date)