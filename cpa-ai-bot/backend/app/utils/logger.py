import logging
import sys
from datetime import datetime
from typing import Optional
from app.config.settings import settings

# Custom formatter
class CustomFormatter(logging.Formatter):
    """Custom log formatter with colors"""
    
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    
    FORMATS = {
        logging.DEBUG: grey + "[%(asctime)s] [%(name)s] [DEBUG] %(message)s" + reset,
        logging.INFO: grey + "[%(asctime)s] [%(name)s] [INFO] %(message)s" + reset,
        logging.WARNING: yellow + "[%(asctime)s] [%(name)s] [WARNING] %(message)s" + reset,
        logging.ERROR: red + "[%(asctime)s] [%(name)s] [ERROR] %(message)s" + reset,
        logging.CRITICAL: bold_red + "[%(asctime)s] [%(name)s] [CRITICAL] %(message)s" + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)

def setup_logging():
    """Setup application logging"""
    # Create logger
    logger = logging.getLogger("cpa_ai_bot")
    
    # Set level based on debug mode
    if settings.DEBUG:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(CustomFormatter())
    logger.addHandler(console_handler)
    
    # File handler (optional)
    try:
        file_handler = logging.FileHandler("app.log")
        file_formatter = logging.Formatter(
            "[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    except Exception:
        # If can't create file handler, continue without it
        pass
    
    return logger

def get_logger(name: str) -> logging.Logger:
    """Get logger for specific module"""
    return logging.getLogger(f"cpa_ai_bot.{name}")

def log_request(method: str, path: str, user_id: Optional[str] = None):
    """Log API request"""
    logger = get_logger("api")
    user_info = f" [User: {user_id}]" if user_id else ""
    logger.info(f"{method} {path}{user_info}")

def log_error(error: Exception, context: str = ""):
    """Log error with context"""
    logger = get_logger("error")
    context_info = f" [Context: {context}]" if context else ""
    logger.error(f"{str(error)}{context_info}", exc_info=True)

def log_auth_event(event: str, user_email: str, success: bool = True):
    """Log authentication events"""
    logger = get_logger("auth")
    status = "SUCCESS" if success else "FAILED"
    logger.info(f"Auth {event} - {user_email} - {status}")

def log_ai_interaction(user_id: str, prompt: str, response_length: int):
    """Log AI interactions"""
    logger = get_logger("ai")
    logger.info(f"AI Chat - User: {user_id} - Prompt length: {len(prompt)} - Response length: {response_length}")

# Initialize logging when module is imported
setup_logging()