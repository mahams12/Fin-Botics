from typing import Optional
from datetime import datetime, date
import re

class ValidationError(Exception):
    """Custom validation error"""
    pass

def validate_expense_amount(amount: float) -> float:
    """Validate expense amount"""
    if amount <= 0:
        raise ValidationError("Amount must be greater than 0")
    if amount > 1000000:  # $1M limit
        raise ValidationError("Amount cannot exceed $1,000,000")
    return round(amount, 2)

def validate_expense_description(description: str) -> str:
    """Validate expense description"""
    if not description or not description.strip():
        raise ValidationError("Description is required")
    
    cleaned = description.strip()
    if len(cleaned) < 3:
        raise ValidationError("Description must be at least 3 characters")
    if len(cleaned) > 500:
        raise ValidationError("Description cannot exceed 500 characters")
    
    return cleaned

def validate_date_range(start_date: Optional[date], end_date: Optional[date]) -> tuple:
    """Validate date range"""
    if start_date and end_date:
        if start_date > end_date:
            raise ValidationError("Start date cannot be after end date")
        
        # Check if range is not too large (e.g., max 2 years)
        diff = end_date - start_date
        if diff.days > 730:  # 2 years
            raise ValidationError("Date range cannot exceed 2 years")
    
    return start_date, end_date

def validate_password(password: str) -> str:
    """Validate password strength"""
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Za-z]', password):
        raise ValidationError("Password must contain at least one letter")
    
    if not re.search(r'\d', password):
        raise ValidationError("Password must contain at least one number")
    
    return password

def validate_category(category: str) -> str:
    """Validate expense category"""
    from app.models.expense import EXPENSE_CATEGORIES
    
    if category not in EXPENSE_CATEGORIES:
        raise ValidationError(f"Invalid category. Must be one of: {', '.join(EXPENSE_CATEGORIES)}")
    
    return category

def validate_pagination(page: int, per_page: int) -> tuple:
    """Validate pagination parameters"""
    if page < 1:
        raise ValidationError("Page number must be greater than 0")
    
    if per_page < 1:
        raise ValidationError("Per page must be greater than 0")
    
    if per_page > 100:
        raise ValidationError("Per page cannot exceed 100")
    
    return page, per_page

def validate_user_name(name: str) -> str:
    """Validate user full name"""
    if not name or not name.strip():
        raise ValidationError("Name is required")
    
    cleaned = name.strip()
    if len(cleaned) < 2:
        raise ValidationError("Name must be at least 2 characters")
    
    if len(cleaned) > 100:
        raise ValidationError("Name cannot exceed 100 characters")
    
    # Check for invalid characters
    if not re.match(r'^[a-zA-Z\s\-\.\']+$', cleaned):
        raise ValidationError("Name contains invalid characters")
    
    return cleaned