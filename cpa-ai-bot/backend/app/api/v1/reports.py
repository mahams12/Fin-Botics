from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import logging
from datetime import datetime, timedelta
import io
import urllib.parse
from app.services.report_service import ReportService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize report service
report_service = ReportService()

@router.get("/test")
async def test_reports():
    """Test endpoint to verify reports router is loaded"""
    return {"message": "Reports router is working!", "status": "success"}

@router.get("/download/monthly")
async def download_monthly_report(
    month: Optional[int] = Query(None, description="Month (1-12)"),
    year: Optional[int] = Query(None, description="Year"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    format: str = Query("pdf", description="Export format (pdf, csv, xlsx)")
):
    """Download monthly report in specified format"""
    try:
        # Use demo user for now - you can add auth back later
        user_id = "demo_user_123"
        
        logger.info(f"Monthly report download requested by user {user_id} - Month: {month}, Year: {year}, Format: {format}")
        
        # Build date range from parameters
        if month and year:
            # Use month/year to build date range
            start_date = f"{year}-{month:02d}-01"
            # Get last day of month
            if month == 12:
                end_date = f"{year}-12-31"
            else:
                next_month = datetime(year, month + 1, 1)
                last_day = (next_month - timedelta(days=1)).day
                end_date = f"{year}-{month:02d}-{last_day:02d}"
        elif not start_date or not end_date:
            # Default to current month
            now = datetime.now()
            start_date = f"{now.year}-{now.month:02d}-01"
            if now.month == 12:
                end_date = f"{now.year}-12-31"
            else:
                next_month = datetime(now.year, now.month + 1, 1)
                last_day = (next_month - timedelta(days=1)).day
                end_date = f"{now.year}-{now.month:02d}-{last_day:02d}"

        # Generate the monthly report data
        date_range = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        logger.info(f"Generating monthly report with date range: {date_range}")
        
        # Generate report
        report_data = await report_service.generate_monthly_report(
            user_id, 
            date_range
        )
        
        # Export in requested format
        file_content, filename, content_type = await report_service.export_report(
            report_data, 
            format
        )
        
        # Return as streaming response
        logger.info(f"Monthly report generated successfully: {filename}")
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_content))
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to download monthly report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate monthly report: {str(e)}")

@router.get("/download/financial_summary")
async def download_financial_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("pdf")
):
    """Download financial summary report"""
    try:
        user_id = "demo_user_123"
        logger.info(f"Financial summary download requested by user {user_id}")
        
        date_range = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        # Generate report
        report_data = await report_service.generate_financial_summary(
            user_id,
            date_range
        )
        
        # Export in requested format
        file_content, filename, content_type = await report_service.export_report(
            report_data,
            format
        )
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_content))
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to download financial summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate financial summary: {str(e)}")

@router.get("/download/expense_analysis")
async def download_expense_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("pdf")
):
    """Download expense analysis report"""
    try:
        user_id = "demo_user_123"
        logger.info(f"Expense analysis download requested by user {user_id}")
        
        date_range = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        # Generate report
        report_data = await report_service.generate_expense_analysis(
            user_id,
            date_range
        )
        
        # Export in requested format
        file_content, filename, content_type = await report_service.export_report(
            report_data,
            format
        )
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_content))
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to download expense analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate expense analysis: {str(e)}")

@router.get("/download/{report_type}")
async def download_report_generic(
    report_type: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("pdf")
):
    """Generic download endpoint for any report type"""
    try:
        user_id = "demo_user_123"
        logger.info(f"Generic report download requested: {report_type} by user {user_id}")
        logger.info(f"Raw parameters - start_date: {start_date}, end_date: {end_date}, format: {format}")
        
        # URL decode the parameters if needed
        if start_date and '%' in start_date:
            decoded_start = urllib.parse.unquote(start_date)
            logger.info(f"URL decoded start_date: {start_date} -> {decoded_start}")
            start_date = decoded_start
            
        if end_date and '%' in end_date:
            decoded_end = urllib.parse.unquote(end_date)
            logger.info(f"URL decoded end_date: {end_date} -> {decoded_end}")
            end_date = decoded_end
        
        date_range = {
            "start_date": start_date,
            "end_date": end_date
        }
        logger.info(f"Date range object: {date_range}")
        
        # Route to appropriate report generation method
        try:
            if report_type == "financial_summary" or report_type == "financial-summary":
                logger.info("Generating financial summary...")
                report_data = await report_service.generate_financial_summary(user_id, date_range)
            elif report_type == "profit_loss" or report_type == "profit-loss":
                logger.info("Generating profit loss report...")
                report_data = await report_service.generate_profit_loss(user_id, date_range)
            elif report_type == "expense_analysis" or report_type == "expense-analysis":
                logger.info("Generating expense analysis...")
                report_data = await report_service.generate_expense_analysis(user_id, date_range)
            elif report_type == "cash_flow" or report_type == "cash-flow":
                logger.info("Generating cash flow report...")
                report_data = await report_service.generate_cash_flow(user_id, date_range)
            elif report_type == "monthly":
                logger.info("Generating monthly report...")
                report_data = await report_service.generate_monthly_report(user_id, date_range)
            else:
                logger.error(f"Unsupported report type: {report_type}")
                raise HTTPException(status_code=400, detail=f"Unsupported report type: {report_type}")
            
            logger.info(f"Report data generated successfully: {report_data.get('id', 'unknown')}")
            
        except Exception as e:
            logger.error(f"Error in report generation for {report_type}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to generate {report_type} report: {str(e)}")
        
        # Export in requested format
        try:
            logger.info(f"Exporting report as {format}...")
            file_content, filename, content_type = await report_service.export_report(
                report_data,
                format
            )
            logger.info(f"Export successful: {filename}")
            
        except Exception as e:
            logger.error(f"Error in report export: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to export {report_type} report: {str(e)}")
        
        # Return as streaming response
        try:
            logger.info(f"Creating streaming response...")
            return StreamingResponse(
                io.BytesIO(file_content),
                media_type=content_type,
                headers={
                    "Content-Disposition": f"attachment; filename={filename}",
                    "Content-Length": str(len(file_content))
                }
            )
        except Exception as e:
            logger.error(f"Error creating streaming response: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to create response: {str(e)}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in download_report_generic: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate {report_type} report: {str(e)}")

@router.get("/{report_id}/export")
async def export_existing_report(
    report_id: str,
    format: str = Query("pdf")
):
    """Export an existing report"""
    try:
        user_id = "demo_user_123"
        logger.info(f"Export existing report: {report_id} as {format}")
        
        # Get the existing report
        report_data = await report_service.get_report(report_id, user_id)
        
        if not report_data:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Export in requested format
        file_content, filename, content_type = await report_service.export_report(
            report_data,
            format
        )
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_content))
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to export report {report_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export report: {str(e)}")