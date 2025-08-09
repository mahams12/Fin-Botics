from typing import Any, Dict, Optional
from datetime import datetime, date
import re
import uuid

def generate_unique_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())

def format_currency(amount: float) -> str:
    """Format amount as currency"""
    return f"${amount:,.2f}"

def clean_string(text: str) -> str:
    """Clean and normalize string input"""
    if not text:
        return ""
    return text.strip().lower()

def extract_amount_from_text(text: str) -> Optional[float]:
    """Extract monetary amount from text"""
    # Look for patterns like $50, $50.00, 50 dollars, etc.
    patterns = [
        r'\$(\d+(?:\.\d{2})?)',  # $50 or $50.00
        r'(\d+(?:\.\d{2})?)\s*(?:dollars?|usd|\$)',  # 50 dollars
        r'(\d+(?:\.\d{2})?)'  # Just numbers
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            try:
                return float(match.group(1))
            except (ValueError, IndexError):
                continue
    
    return None

def validate_email(email: str) -> bool:
    """Basic email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_date(date_obj: datetime) -> str:
    """Format date for display"""
    return date_obj.strftime("%Y-%m-%d")

def get_month_name(month: int) -> str:
    """Get month name from number"""
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    return months[month - 1] if 1 <= month <= 12 else "Unknown"

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace invalid characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    return sanitized.strip()

def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to specified length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."

def parse_date_string(date_string: str) -> Optional[datetime]:
    """Parse common date string formats"""
    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    
    return None