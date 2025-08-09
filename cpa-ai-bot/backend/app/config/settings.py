from decouple import config
from typing import List

class Settings:
    # Database
    MONGODB_URL: str = config("MONGODB_URL", default="mongodb://localhost:27017/cpa_ai_bot")
    DATABASE_NAME: str = config("DATABASE_NAME", default="cpa_ai_bot")
    
    # JWT
    JWT_SECRET_KEY: str = config("JWT_SECRET_KEY", default="your-secret-key")
    JWT_ALGORITHM: str = config("JWT_ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = config("GOOGLE_CLIENT_ID", default="")
    GOOGLE_CLIENT_SECRET: str = config("GOOGLE_CLIENT_SECRET", default="")
    
    # OpenAI
    OPENAI_API_KEY: str = config("OPENAI_API_KEY", default="")
    
    # App
    APP_NAME: str = config("APP_NAME", default="CPA AI Bot")
    DEBUG: bool = config("DEBUG", default=True, cast=bool)
    CORS_ORIGINS: List[str] = config("CORS_ORIGINS", default="http://localhost:3000").split(",")

settings = Settings()