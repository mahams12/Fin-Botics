from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from app.services.report_service import ReportService
from app.api.deps import get_current_active_user_by_session
from app.models.user import User
from typing import Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()
report_service = ReportService()

@router.post("/financial-summary")
async def generate_financial_summary(
    date_range: Dict[str, Any],
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Generate financial summary report"""
    try:
        logger.info(f"Generating financial summary for user: {current_user.email}")
        
        result = await report_service.generate_financial_summary(
            user_id=str(current_user.id),
            date_range=date_range
        )
        
        return result
    except Exception as e:
        logger.error(f"Financial summary generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate financial summary: {str(e)}"
        )

@router.post("/profit-loss")
async def generate_profit_loss(
    date_range: Dict[str, Any],
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Generate profit & loss report"""
    try:
        logger.info(f"Generating P&L report for user: {current_user.email}")
        
        result = await report_service.generate_profit_loss(
            user_id=str(current_user.id),
            date_range=date_range
        )
        
        return result
    except Exception as e:
        logger.error(f"P&L generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate profit & loss report: {str(e)}"
        )

@router.post("/expense-analysis")
async def generate_expense_analysis(
    request_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Generate expense analysis report"""
    try:
        logger.info(f"Generating expense analysis for user: {current_user.email}")
        
        date_range = {k: v for k, v in request_data.items() if k in ['start_date', 'end_date']}
        categories = request_data.get('categories', [])
        
        result = await report_service.generate_expense_analysis(
            user_id=str(current_user.id),
            date_range=date_range,
            categories=categories
        )
        
        return result
    except Exception as e:
        logger.error(f"Expense analysis generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate expense analysis: {str(e)}"
        )

@router.post("/cash-flow")
async def generate_cash_flow(
    date_range: Dict[str, Any],
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Generate cash flow report"""
    try:
        logger.info(f"Generating cash flow report for user: {current_user.email}")
        
        result = await report_service.generate_cash_flow(
            user_id=str(current_user.id),
            date_range=date_range
        )
        
        return result
    except Exception as e:
        logger.error(f"Cash flow generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cash flow report: {str(e)}"
        )

@router.get("/{report_id}/export")
async def export_report(
    report_id: str,
    format: str = Query("pdf", description="Export format: pdf, csv, excel"),
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Export report in specified format"""
    try:
        logger.info(f"Exporting report {report_id} as {format} for user: {current_user.email}")
        
        # Get the report data
        report_data = await report_service.get_report(report_id, str(current_user.id))
        if not report_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Generate the export file
        file_content, filename, media_type = await report_service.export_report(
            report_data, format
        )
        
        # Return file response
        response = Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report export failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export report: {str(e)}"
        )

@router.get("/download/{report_type}")
async def download_report_direct(
    report_type: str,
    format: str = Query("pdf", description="Download format: pdf, csv, excel"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Generate and download report directly without saving"""
    try:
        logger.info(f"Direct download {report_type} as {format} for user: {current_user.email}")
        
        # Prepare date range
        date_range = {}
        if start_date:
            date_range['start_date'] = start_date
        if end_date:
            date_range['end_date'] = end_date
        
        # Generate report based on type
        if report_type == "financial-summary":
            report_data = await report_service.generate_financial_summary(
                str(current_user.id), date_range
            )
        elif report_type == "profit-loss":
            report_data = await report_service.generate_profit_loss(
                str(current_user.id), date_range
            )
        elif report_type == "expense-analysis":
            report_data = await report_service.generate_expense_analysis(
                str(current_user.id), date_range
            )
        elif report_type == "cash-flow":
            report_data = await report_service.generate_cash_flow(
                str(current_user.id), date_range
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown report type: {report_type}"
            )
        
        # Export the report
        file_content, filename, media_type = await report_service.export_report(
            report_data, format
        )
        
        # Return file response
        response = Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Direct report download failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download report: {str(e)}"
        )

@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Get a specific report"""
    try:
        logger.info(f"Getting report {report_id} for user: {current_user.email}")
        
        report = await report_service.get_report(report_id, str(current_user.id))
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get report failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get report: {str(e)}"
        )

@router.get("/")
async def get_reports(
    limit: int = Query(10, description="Number of reports to return"),
    offset: int = Query(0, description="Number of reports to skip"),
    current_user: User = Depends(get_current_active_user_by_session)
):
    """Get user's reports"""
    try:
        logger.info(f"Getting reports for user: {current_user.email}")
        
        reports = await report_service.get_user_reports(
            str(current_user.id), limit=limit, offset=offset
        )
        
        return {
            "reports": reports,
            "total": len(reports),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Get reports failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get reports: {str(e)}"
        )