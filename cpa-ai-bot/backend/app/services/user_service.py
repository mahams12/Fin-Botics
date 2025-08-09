from typing import Optional, List, Dict, Any
from datetime import datetime, date
from app.database.user_db import UserDatabase
from app.database.expense_db import ExpenseDatabase
from app.database.chat_db import ChatDatabase
from app.models.user import User, UserCreate, UserUpdate
from app.utils.validators import ValidationError, validate_user_name
from app.utils.formatters import format_user_response
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self):
        self.user_db = UserDatabase()
        self.expense_db = ExpenseDatabase()
        self.chat_db = ChatDatabase()

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            return await self.user_db.get_user_by_id(user_id)
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {e}")
            return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            return await self.user_db.get_user_by_email(email)
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None

    async def update_user_profile(self, user_id: str, update_data: UserUpdate) -> Optional[User]:
        """Update user profile with validation"""
        try:
            # Validate input data
            update_dict = {}
            
            if update_data.full_name is not None:
                validated_name = validate_user_name(update_data.full_name)
                update_dict["full_name"] = validated_name
            
            if update_data.is_active is not None:
                update_dict["is_active"] = update_data.is_active
            
            if not update_dict:
                raise ValidationError("No valid data provided for update")
            
            # Update user
            updated_user = await self.user_db.update_user(user_id, update_dict)
            
            if updated_user:
                logger.info(f"User profile updated successfully: {user_id}")
            
            return updated_user
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error updating user profile {user_id}: {e}")
            return None

    async def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        try:
            user = await self.user_db.get_user_by_id(user_id)
            if not user:
                return {}

            # Get user's expenses
            all_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id, 
                limit=1000  # Get all expenses
            )
            
            # Calculate expense statistics
            total_expenses = len(all_expenses)
            total_amount = sum(expense.amount for expense in all_expenses)
            average_expense = total_amount / total_expenses if total_expenses > 0 else 0
            
            # Category breakdown
            category_stats = {}
            for expense in all_expenses:
                category = expense.category
                if category not in category_stats:
                    category_stats[category] = {"count": 0, "amount": 0}
                category_stats[category]["count"] += 1
                category_stats[category]["amount"] += expense.amount
            
            # Monthly breakdown (last 12 months)
            monthly_stats = {}
            for expense in all_expenses:
                month_key = expense.date.strftime("%Y-%m")
                if month_key not in monthly_stats:
                    monthly_stats[month_key] = {"count": 0, "amount": 0}
                monthly_stats[month_key]["count"] += 1
                monthly_stats[month_key]["amount"] += expense.amount
            
            # Get chat sessions
            chat_sessions = await self.chat_db.get_user_sessions(user_id)
            total_sessions = len(chat_sessions)
            
            # Recent activity (last 30 days)
            thirty_days_ago = datetime.utcnow().replace(day=1) - datetime.timedelta(days=30)
            recent_expenses = [
                expense for expense in all_expenses 
                if expense.created_at >= thirty_days_ago
            ]
            recent_amount = sum(expense.amount for expense in recent_expenses)
            
            return {
                "user_info": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "is_active": user.is_active,
                    "member_since": user.created_at,
                    "last_updated": user.updated_at
                },
                "expense_statistics": {
                    "total_expenses": total_expenses,
                    "total_amount": round(total_amount, 2),
                    "average_expense": round(average_expense, 2),
                    "category_breakdown": {
                        category: {
                            "count": stats["count"],
                            "amount": round(stats["amount"], 2),
                            "average": round(stats["amount"] / stats["count"], 2)
                        }
                        for category, stats in category_stats.items()
                    },
                    "monthly_breakdown": {
                        month: {
                            "count": stats["count"],
                            "amount": round(stats["amount"], 2)
                        }
                        for month, stats in monthly_stats.items()
                    }
                },
                "chat_statistics": {
                    "total_sessions": total_sessions,
                    "average_sessions_per_month": round(total_sessions / 12, 1) if total_sessions > 0 else 0
                },
                "recent_activity": {
                    "last_30_days": {
                        "expense_count": len(recent_expenses),
                        "total_amount": round(recent_amount, 2)
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting user statistics for {user_id}: {e}")
            return {}

    async def get_user_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard data for user"""
        try:
            # Get current month expenses
            now = datetime.utcnow()
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            current_month_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_of_month,
                end_date=now
            )
            
            # Get last month expenses for comparison
            if start_of_month.month == 1:
                last_month_start = start_of_month.replace(year=start_of_month.year - 1, month=12)
            else:
                last_month_start = start_of_month.replace(month=start_of_month.month - 1)
            
            last_month_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=last_month_start,
                end_date=start_of_month
            )
            
            # Calculate totals
            current_total = sum(expense.amount for expense in current_month_expenses)
            last_total = sum(expense.amount for expense in last_month_expenses)
            
            # Calculate change percentage
            change_percentage = 0
            if last_total > 0:
                change_percentage = ((current_total - last_total) / last_total) * 100
            
            # Get top category this month
            category_totals = {}
            for expense in current_month_expenses:
                category = expense.category
                category_totals[category] = category_totals.get(category, 0) + expense.amount
            
            top_category = max(category_totals.keys(), key=category_totals.get) if category_totals else None
            
            # Get recent chat sessions
            recent_sessions = await self.chat_db.get_user_sessions(user_id)
            recent_sessions = recent_sessions[:5]  # Last 5 sessions
            
            return {
                "summary": {
                    "current_month_total": round(current_total, 2),
                    "last_month_total": round(last_total, 2),
                    "change_percentage": round(change_percentage, 2),
                    "expense_count_this_month": len(current_month_expenses),
                    "top_category": top_category.replace("_", " ").title() if top_category else None
                },
                "recent_expenses": [
                    {
                        "id": str(expense.id),
                        "description": expense.description,
                        "amount": expense.amount,
                        "category": expense.category.replace("_", " ").title(),
                        "date": expense.date.isoformat()
                    }
                    for expense in current_month_expenses[-5:]  # Last 5 expenses
                ],
                "recent_chat_sessions": [
                    {
                        "id": str(session.id),
                        "session_id": session.session_id,
                        "title": session.title,
                        "created_at": session.created_at.isoformat()
                    }
                    for session in recent_sessions
                ],
                "category_summary": {
                    category.replace("_", " ").title(): round(amount, 2)
                    for category, amount in category_totals.items()
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard data for user {user_id}: {e}")
            return {}

    async def get_user_activity_log(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user activity log"""
        try:
            activities = []
            
            # Get recent expenses
            recent_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                limit=limit // 2
            )
            
            for expense in recent_expenses:
                activities.append({
                    "type": "expense_created",
                    "description": f"Created expense: {expense.description}",
                    "amount": expense.amount,
                    "category": expense.category,
                    "timestamp": expense.created_at,
                    "data": {
                        "expense_id": str(expense.id),
                        "amount": expense.amount,
                        "category": expense.category
                    }
                })
            
            # Get recent chat sessions
            recent_sessions = await self.chat_db.get_user_sessions(user_id)
            for session in recent_sessions[:limit // 2]:
                activities.append({
                    "type": "chat_session_created",
                    "description": f"Started chat session: {session.title}",
                    "timestamp": session.created_at,
                    "data": {
                        "session_id": session.session_id,
                        "title": session.title
                    }
                })
            
            # Sort by timestamp (most recent first)
            activities.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return activities[:limit]
            
        except Exception as e:
            logger.error(f"Error getting activity log for user {user_id}: {e}")
            return []

    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        try:
            result = await self.user_db.update_user(user_id, {"is_active": False})
            if result:
                logger.info(f"User {user_id} deactivated successfully")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deactivating user {user_id}: {e}")
            return False

    async def reactivate_user(self, user_id: str) -> bool:
        """Reactivate user account"""
        try:
            result = await self.user_db.update_user(user_id, {"is_active": True})
            if result:
                logger.info(f"User {user_id} reactivated successfully")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error reactivating user {user_id}: {e}")
            return False

    async def delete_user_data(self, user_id: str) -> bool:
        """Delete all user data (expenses, chats, etc.)"""
        try:
            # Delete user's expenses
            user_expenses = await self.expense_db.find({"user_id": ObjectId(user_id)})
            for expense in user_expenses:
                await self.expense_db.delete(str(expense["_id"]))
            
            # Delete user's chat sessions and messages
            user_sessions = await self.chat_db.find({"user_id": ObjectId(user_id)})
            for session in user_sessions:
                # Delete messages
                await self.chat_db.messages.delete_many({"session_id": session["session_id"]})
                # Delete session
                await self.chat_db.delete(str(session["_id"]))
            
            # Finally delete the user
            success = await self.user_db.delete_user(user_id)
            
            if success:
                logger.info(f"All data for user {user_id} deleted successfully")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting user data for {user_id}: {e}")
            return False

    async def search_users(self, query: str, limit: int = 20) -> List[User]:
        """Search users by email or name"""
        try:
            search_query = {
                "$or": [
                    {"email": {"$regex": query, "$options": "i"}},
                    {"full_name": {"$regex": query, "$options": "i"}}
                ]
            }
            
            users_data = await self.user_db.find(search_query, limit=limit)
            return [User(**user) for user in users_data]
            
        except Exception as e:
            logger.error(f"Error searching users with query '{query}': {e}")
            return []

    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences (placeholder for future implementation)"""
        try:
            # This would be extended to include actual user preferences
            # from a preferences collection or user document
            return {
                "theme": "light",
                "currency": "USD",
                "date_format": "MM/dd/yyyy",
                "notifications": {
                    "email": True,
                    "push": False,
                    "weekly_reports": True
                },
                "privacy": {
                    "data_sharing": False,
                    "analytics": True
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting preferences for user {user_id}: {e}")
            return {}

    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences (placeholder for future implementation)"""
        try:
            # This would be implemented when preferences are stored in database
            logger.info(f"Preferences updated for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating preferences for user {user_id}: {e}")
            return False