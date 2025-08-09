from typing import Dict, Any, List
from datetime import datetime, date

def format_user_response(user: Dict[str, Any]) -> Dict[str, Any]:
    """Format user data for API response"""
    return {
        "id": str(user.get("_id", "")),
        "email": user.get("email", ""),
        "full_name": user.get("full_name", ""),
        "is_active": user.get("is_active", True),
        "is_admin": user.get("is_admin", False),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at")
    }

def format_expense_response(expense: Dict[str, Any]) -> Dict[str, Any]:
    """Format expense data for API response"""
    return {
        "id": str(expense.get("_id", "")),
        "description": expense.get("description", ""),
        "amount": float(expense.get("amount", 0)),
        "category": expense.get("category", "other"),
        "date": expense.get("date"),
        "notes": expense.get("notes"),
        "created_at": expense.get("created_at"),
        "updated_at": expense.get("updated_at")
    }

def format_chat_message(message: Dict[str, Any]) -> Dict[str, Any]:
    """Format chat message for API response"""
    return {
        "id": str(message.get("_id", "")),
        "content": message.get("content", ""),
        "is_user": message.get("is_user", False),
        "timestamp": message.get("timestamp"),
        "session_id": message.get("session_id", "")
    }

def format_expense_summary(expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Format expense summary for reports"""
    total_amount = sum(expense.get("amount", 0) for expense in expenses)
    
    # Group by category
    category_totals = {}
    for expense in expenses:
        category = expense.get("category", "other")
        if category not in category_totals:
            category_totals[category] = 0
        category_totals[category] += expense.get("amount", 0)
    
    # Group by month
    monthly_totals = {}
    for expense in expenses:
        expense_date = expense.get("date")
        if expense_date:
            month_key = expense_date.strftime("%Y-%m")
            if month_key not in monthly_totals:
                monthly_totals[month_key] = 0
            monthly_totals[month_key] += expense.get("amount", 0)
    
    return {
        "total_amount": round(total_amount, 2),
        "total_count": len(expenses),
        "category_breakdown": {k: round(v, 2) for k, v in category_totals.items()},
        "monthly_breakdown": {k: round(v, 2) for k, v in monthly_totals.items()},
        "average_amount": round(total_amount / len(expenses), 2) if expenses else 0
    }

def format_error_response(error: str, details: str = None) -> Dict[str, Any]:
    """Format error response"""
    response = {
        "error": True,
        "message": error,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if details:
        response["details"] = details
    
    return response

def format_success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """Format success response"""
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }

def format_pagination_response(
    items: List[Any], 
    page: int, 
    per_page: int, 
    total: int
) -> Dict[str, Any]:
    """Format paginated response"""
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

def format_category_name(category: str) -> str:
    """Format category for display"""
    return category.replace("_", " ").title()

def format_amount_display(amount: float) -> str:
    """Format amount for display with currency"""
    return f"${amount:,.2f}"