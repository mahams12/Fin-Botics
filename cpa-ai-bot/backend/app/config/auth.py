from typing import Optional, Dict, Any
import httpx
from app.config.settings import settings

async def verify_google_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Google OAuth token and return user info
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}"
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
    except Exception:
        return None

async def verify_google_id_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Google ID token and return user info
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            
            if response.status_code == 200:
                token_info = response.json()
                # Verify the token is for your app
                if token_info.get("aud") == settings.GOOGLE_CLIENT_ID:
                    return token_info
                    
            return None
            
    except Exception:
        return None

def extract_user_info(google_user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract and standardize user information from Google OAuth response
    """
    return {
        "google_id": google_user_data.get("id"),
        "email": google_user_data.get("email"),
        "name": google_user_data.get("name"),
        "picture": google_user_data.get("picture"),
        "verified_email": google_user_data.get("verified_email", False)
    }