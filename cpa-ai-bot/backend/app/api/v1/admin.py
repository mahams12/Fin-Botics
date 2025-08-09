from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from app.api.deps import get_current_active_user, get_admin_user
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.expense_service import ExpenseService
from app.services.chat_service import ChatService
from app.database.user_db import UserDatabase
from app.database.expense_db import ExpenseDatabase
from app.database.chat_db import ChatDatabase
from app.utils.formatters import format_pagination_response
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
auth_service = AuthService()
expense_service = ExpenseService()
chat_service = ChatService()
user_db = UserDatabase()
expense_db = ExpenseDatabase()
chat_db = ChatDatabase()

@router.get("/dashboard")
async def get_admin_dashboard(admin_user: User = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    try:
        # Get current date ranges
        today = date.today()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User statistics
        total_users = len(await user_db.find({}))
        active_users = len(await user_db.find({"is_active": True}))
        new_users_this_week = len(await user_db.find({
            "created_at": {"$gte": datetime.combine(week_ago, datetime.min.time())}
        }))
        new_users_this_month = len(await user_db.find({
            "created_at": {"$gte": datetime.combine(month_ago, datetime.min.time())}
        }))
        
        # Expense statistics
        total_expenses = len(await expense_db.find({}))
        expenses_this_month = await expense_db.find({
            "created_at": {"$gte": datetime.combine(month_ago, datetime.min.time())}
        })
        
        total_expense_amount = sum(expense.get("amount", 0) for expense in expenses_this_month)
        
        # Chat statistics
        total_sessions = len(await chat_db.find({}))
        sessions_this_week = len(await chat_db.find({
            "created_at": {"$gte": datetime.combine(week_ago, datetime.min.time())}
        }))
        
        # System health metrics
        dashboard_stats = {
            "users": {
                "total": total_users,
                "active": active_users,
                "inactive": total_users - active_users,
                "new_this_week": new_users_this_week,
                "new_this_month": new_users_this_month
            },
            "expenses": {
                "total_count": total_expenses,
                "this_month_count": len(expenses_this_month),
                "this_month_amount": total_expense_amount,
                "average_per_user": total_expense_amount / active_users if active_users > 0 else 0
            },
            "chat": {
                "total_sessions": total_sessions,
                "sessions_this_week": sessions_this_week,
                "average_per_user": total_sessions / active_users if active_users > 0 else 0
            },
            "system": {
                "uptime": "System running normally",
                "last_updated": datetime.utcnow(),
                "version": "1.0.0"
            }
        }
        
        return dashboard_stats
        
    except Exception as e:
        logger.error(f"Error getting admin dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard statistics"
        )

@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    admin_user: User = Depends(get_admin_user)
):
    """Get all users with filtering and pagination"""
    try:
        skip = (page - 1) * per_page
        query = {}
        
        # Apply filters
        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"full_name": {"$regex": search, "$options": "i"}}
            ]
        
        if is_active is not None:
            query["is_active"] = is_active
        
        # Get users
        users = await user_db.find(query, limit=per_page, skip=skip)
        total = len(await user_db.find(query))
        
        # Format users for response
        formatted_users = []
        for user in users:
            formatted_users.append({
                "id": str(user["_id"]),
                "email": user.get("email"),
                "full_name": user.get("full_name"),
                "is_active": user.get("is_active", True),
                "is_admin": user.get("is_admin", False),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at"),
                "google_id": user.get("google_id") is not None
            })
        
        return format_pagination_response(formatted_users, page, per_page, total)
        
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Get detailed information about a specific user"""
    try:
        user = await user_db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's expenses
        user_expenses = await expense_db.get_user_expenses(user_id, limit=10)
        total_expenses = len(await expense_db.find({"user_id": user.id}))
        total_amount = sum(expense.amount for expense in user_expenses)
        
        # Get user's chat sessions
        chat_sessions = await chat_db.get_user_sessions(user_id)
        
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "google_id": user.google_id is not None
            },
            "statistics": {
                "total_expenses": total_expenses,
                "total_expense_amount": total_amount,
                "chat_sessions": len(chat_sessions),
                "average_expense": total_amount / total_expenses if total_expenses > 0 else 0
            },
            "recent_expenses": [
                {
                    "id": str(expense.id),
                    "description": expense.description,
                    "amount": expense.amount,
                    "category": expense.category,
                    "date": expense.date
                }
                for expense in user_expenses[:5]
            ],
            "recent_sessions": [
                {
                    "id": str(session.id),
                    "title": session.title,
                    "created_at": session.created_at
                }
                for session in chat_sessions[:5]
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user details"
        )

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    admin_user: User = Depends(get_admin_user)
):
    """Activate or deactivate a user"""
    try:
        user = await user_db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent deactivating admin users
        if user.is_admin and not is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate admin users"
            )
        
        updated_user = await user_db.update_user(user_id, {"is_active": is_active})
        
        action = "activated" if is_active else "deactivated"
        logger.info(f"Admin {admin_user.email} {action} user {user.email}")
        
        return {
            "message": f"User {action} successfully",
            "user": {
                "id": str(updated_user.id),
                "email": updated_user.email,
                "is_active": updated_user.is_active
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )

@router.put("/users/{user_id}/admin")
async def toggle_admin_status(
    user_id: str,
    is_admin: bool,
    admin_user: User = Depends(get_admin_user)
):
    """Grant or revoke admin privileges"""
    try:
        user = await user_db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent removing admin from self
        if str(user.id) == str(admin_user.id) and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove admin privileges from yourself"
            )
        
        updated_user = await user_db.update_user(user_id, {"is_admin": is_admin})
        
        action = "granted" if is_admin else "revoked"
        logger.info(f"Admin {admin_user.email} {action} admin privileges for user {user.email}")
        
        return {
            "message": f"Admin privileges {action} successfully",
            "user": {
                "id": str(updated_user.id),
                "email": updated_user.email,
                "is_admin": updated_user.is_admin
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating admin status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update admin status"
        )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Delete a user and all associated data"""
    try:
        user = await user_db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent deleting admin users
        if user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete admin users"
            )
        
        # Prevent self-deletion
        if str(user.id) == str(admin_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Delete associated data
        # Delete user's expenses
        user_expenses = await expense_db.find({"user_id": user.id})
        for expense in user_expenses:
            await expense_db.delete(str(expense["_id"]))
        
        # Delete user's chat sessions and messages
        user_sessions = await chat_db.find({"user_id": user.id})
        for session in user_sessions:
            # Delete messages
            await chat_db.messages.delete_many({"session_id": session["session_id"]})
            # Delete session
            await chat_db.delete(str(session["_id"]))
        
        # Finally delete the user
        success = await user_db.delete_user(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user"
            )
        
        logger.info(f"Admin {admin_user.email} deleted user {user.email}")
        
        return {"message": "User and all associated data deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

@router.get("/expenses")
async def get_all_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    admin_user: User = Depends(get_admin_user)
):
    """Get all expenses across all users"""
    try:
        skip = (page - 1) * per_page
        query = {}
        
        # Apply filters
        if category:
            query["category"] = category
        
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = datetime.combine(start_date, datetime.min.time())
            if end_date:
                date_filter["$lte"] = datetime.combine(end_date, datetime.max.time())
            query["date"] = date_filter
        
        expenses = await expense_db.find(query, limit=per_page, skip=skip)
        total = len(await expense_db.find(query))
        
        # Format expenses with user information
        formatted_expenses = []
        for expense in expenses:
            user = await user_db.get_user_by_id(str(expense["user_id"]))
            formatted_expenses.append({
                "id": str(expense["_id"]),
                "description": expense.get("description"),
                "amount": expense.get("amount"),
                "category": expense.get("category"),
                "date": expense.get("date"),
                "created_at": expense.get("created_at"),
                "user": {
                    "id": str(user.id) if user else None,
                    "email": user.email if user else "Unknown",
                    "full_name": user.full_name if user else "Unknown"
                }
            })
        
        return format_pagination_response(formatted_expenses, page, per_page, total)
        
    except Exception as e:
        logger.error(f"Error getting all expenses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expenses"
        )

@router.get("/analytics")
async def get_system_analytics(
    days: int = Query(30, ge=1, le=365),
    admin_user: User = Depends(get_admin_user)
):
    """Get system-wide analytics"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # User analytics
        total_users = len(await user_db.find({}))
        new_users = await user_db.find({
            "created_at": {"$gte": start_date}
        })
        
        # Expense analytics
        expenses = await expense_db.find({
            "created_at": {"$gte": start_date}
        })
        
        total_amount = sum(expense.get("amount", 0) for expense in expenses)
        
        # Category breakdown
        category_stats = {}
        for expense in expenses:
            category = expense.get("category", "other")
            if category not in category_stats:
                category_stats[category] = {"count": 0, "amount": 0}
            category_stats[category]["count"] += 1
            category_stats[category]["amount"] += expense.get("amount", 0)
        
        # Chat analytics
        sessions = await chat_db.find({
            "created_at": {"$gte": start_date}
        })
        
        return {
            "period_days": days,
            "users": {
                "total": total_users,
                "new_in_period": len(new_users),
                "growth_rate": (len(new_users) / total_users * 100) if total_users > 0 else 0
            },
            "expenses": {
                "total_count": len(expenses),
                "total_amount": total_amount,
                "average_amount": total_amount / len(expenses) if expenses else 0,
                "category_breakdown": category_stats
            },
            "chat": {
                "total_sessions": len(sessions),
                "average_per_user": len(sessions) / total_users if total_users > 0 else 0
            },
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        )

@router.get("/system/health")
async def get_system_health(admin_user: User = Depends(get_admin_user)):
    """Get system health status"""
    try:
        # Test database connections
        db_status = "healthy"
        try:
            await user_db.collection.find_one({})
        except Exception:
            db_status = "unhealthy"
        
        # Check API status (basic)
        api_status = "healthy"  # If this endpoint is running, API is healthy
        
        return {
            "status": "healthy" if db_status == "healthy" else "degraded",
            "timestamp": datetime.utcnow(),
            "services": {
                "database": db_status,
                "api": api_status,
                "ai_service": "unknown"  # Would need actual OpenAI API test
            },
            "uptime": "Unknown",  # Would implement actual uptime tracking
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow(),
            "error": str(e)
        }