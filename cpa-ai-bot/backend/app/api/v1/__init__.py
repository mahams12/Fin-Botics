from .auth import router as auth_router
from .users import router as users_router
from .expenses import router as expenses_router
from .chat import router as chat_router
from .reports import router as reports_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router", 
    "expenses_router",
    "chat_router",
    "reports_router",
    "admin_router"
]