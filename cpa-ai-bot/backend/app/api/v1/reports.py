from fastapi import APIRouter, Depends, Query, HTTPException, status
from datetime import date, datetime
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.expense_service import ExpenseService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
expense_service = ExpenseService()

@router.get("/monthly")
async def get_monthly_report(
    year: int = Query(...),
    month: int = Query(...),
    current_user: User = Depends(get_current_active_user)
):
    """Get monthly financial report"""
    try:
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
        
        summary = await expense_service.get_expense_summary(
            str(current_user.id), 
            start_date, 
            end_date
        )
        
        return {
            "month": month,
            "year": year,
            "summary": summary,
            "report_generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating monthly report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate monthly report"
        )

@router.get("/annual")
async def get_annual_report(
    year: int = Query(...),
    current_user: User = Depends(get_current_active_user)
):
    """Get annual financial report"""
    try:
        start_date = date(year, 1, 1)
        end_date = date(year + 1, 1, 1)
        
        summary = await expense_service.get_expense_summary(
            str(current_user.id), 
            start_date, 
            end_date
        )
        
        # Get monthly breakdown
        monthly_data = []
        for month in range(1, 13):
            month_start = date(year, month, 1)
            if month == 12:
                month_end = date(year + 1, 1, 1)
            else:
                month_end = date(year, month + 1, 1)
            
            month_summary = await expense_service.get_expense_summary(
                str(current_user.id),
                month_start,
                month_end
            )
            
            monthly_data.append({
                "month": month,
                "total_expenses": month_summary["total_expenses"],
                "expense_count": month_summary["expense_count"]
            })
        
        return {
            "year": year,
            "summary": summary,
            "monthly_breakdown": monthly_data,
            "report_generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating annual report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate annual report"
        )

@router.get("/summary")
async def get_expense_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_active_user)
):
    """Get expense summary for a custom period"""
    try:
        summary = await expense_service.get_expense_summary(
            str(current_user.id), 
            start_date, 
            end_date
        )
        return summary
        
    except Exception as e:
        logger.error(f"Error getting expense summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get expense summary"
        )