from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/test")
async def test_reports():
    """Test endpoint to verify reports router is loaded"""
    return {"message": "Reports router is working!", "status": "success"}

@router.get("/download/financial_summary")
async def download_financial_summary():
    """Simple test download endpoint"""
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("This is a test CSV file", media_type="text/csv")