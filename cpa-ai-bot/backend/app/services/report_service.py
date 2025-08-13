from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
import uuid
import json
import csv
import io
import logging
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import openpyxl
from openpyxl.styles import Font, Alignment

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        # In a real app, you'd inject a database service here
        self.reports_storage = {}  # Temporary in-memory storage
    
    async def generate_monthly_report(self, user_id: str, date_range: Dict[str, Any]) -> Dict[str, Any]:
        """Generate monthly report - NEW METHOD"""
        try:
            logger.info(f"Generating monthly report for user {user_id}")
            
            # Parse date range
            start_date, end_date = self._parse_date_range(date_range)
            
            # In a real app, you'd query your expense database here
            # For now, we'll return mock data similar to your frontend
            report_data = {
                "id": str(uuid.uuid4()),
                "type": "monthly_report",
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "data": {
                    "total_expenses": 12450.50,
                    "total_income": 18750.00,
                    "net_profit": 6299.50,
                    "expense_growth": 0.12,
                    "income_growth": 0.08,
                    "profit_margin": 0.336,
                    "categories": [
                        {"name": "Office Supplies", "amount": 1250.00, "percentage": 0.10},
                        {"name": "Travel", "amount": 2100.00, "percentage": 0.17},
                        {"name": "Meals & Entertainment", "amount": 850.00, "percentage": 0.07},
                        {"name": "Equipment", "amount": 3200.00, "percentage": 0.26},
                        {"name": "Software", "amount": 1890.00, "percentage": 0.15},
                        {"name": "Marketing", "amount": 1560.00, "percentage": 0.13},
                        {"name": "Other", "amount": 1600.50, "percentage": 0.12}
                    ],
                    "daily_expenses": [
                        {"date": "2024-03-01", "amount": 450.00},
                        {"date": "2024-03-02", "amount": 120.00},
                        {"date": "2024-03-03", "amount": 0.00},
                        {"date": "2024-03-04", "amount": 890.00},
                        {"date": "2024-03-05", "amount": 234.50}
                    ],
                    "insights": {
                        "top_spending_category": "Equipment",
                        "avg_daily_expense": round(12450.50 / 31, 2),
                        "expense_ratio": round(12450.50 / 18750.00, 3),
                        "days_in_period": 31
                    }
                }
            }
            
            # Store the report
            self.reports_storage[report_data["id"]] = report_data
            
            logger.info(f"Generated monthly report: {report_data['id']}")
            return report_data
            
        except Exception as e:
            logger.error(f"Failed to generate monthly report: {e}")
            raise
    
    async def generate_financial_summary(self, user_id: str, date_range: Dict[str, Any]) -> Dict[str, Any]:
        """Generate financial summary report"""
        try:
            logger.info(f"Generating financial summary for user {user_id}")
            
            # Parse date range
            start_date, end_date = self._parse_date_range(date_range)
            
            # In a real app, you'd query your expense database here
            # For now, we'll return mock data
            report_data = {
                "id": str(uuid.uuid4()),
                "type": "financial_summary",
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "data": {
                    "total_income": 15000.00,
                    "total_expenses": 8500.00,
                    "net_profit": 6500.00,
                    "expense_categories": {
                        "Office Supplies": 1200.00,
                        "Travel": 2300.00,
                        "Marketing": 1800.00,
                        "Software": 800.00,
                        "Meals": 2400.00
                    },
                    "monthly_breakdown": [
                        {"month": "January", "income": 5000, "expenses": 2800},
                        {"month": "February", "income": 5500, "expenses": 2900},
                        {"month": "March", "income": 4500, "expenses": 2800}
                    ]
                }
            }
            
            # Store the report
            self.reports_storage[report_data["id"]] = report_data
            
            logger.info(f"Generated financial summary report: {report_data['id']}")
            return report_data
            
        except Exception as e:
            logger.error(f"Failed to generate financial summary: {e}")
            raise
    
    async def generate_profit_loss(self, user_id: str, date_range: Dict[str, Any]) -> Dict[str, Any]:
        """Generate profit & loss report"""
        try:
            logger.info(f"Generating P&L report for user {user_id}")
            
            start_date, end_date = self._parse_date_range(date_range)
            
            report_data = {
                "id": str(uuid.uuid4()),
                "type": "profit_loss",
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "data": {
                    "revenue": {
                        "service_income": 12000.00,
                        "product_sales": 3000.00,
                        "total_revenue": 15000.00
                    },
                    "expenses": {
                        "cost_of_goods_sold": 2000.00,
                        "operating_expenses": 4500.00,
                        "administrative_expenses": 2000.00,
                        "total_expenses": 8500.00
                    },
                    "gross_profit": 13000.00,
                    "operating_profit": 8500.00,
                    "net_profit": 6500.00,
                    "profit_margin": 43.33
                }
            }
            
            self.reports_storage[report_data["id"]] = report_data
            return report_data
            
        except Exception as e:
            logger.error(f"Failed to generate P&L report: {e}")
            raise
    
    async def generate_expense_analysis(self, user_id: str, date_range: Dict[str, Any], categories: List[str] = None) -> Dict[str, Any]:
        """Generate expense analysis report"""
        try:
            logger.info(f"Generating expense analysis for user {user_id}")
            
            start_date, end_date = self._parse_date_range(date_range)
            
            report_data = {
                "id": str(uuid.uuid4()),
                "type": "expense_analysis",
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "data": {
                    "total_expenses": 8500.00,
                    "categories": {
                        "Office Supplies": {"amount": 1200.00, "percentage": 14.12, "transactions": 15},
                        "Travel": {"amount": 2300.00, "percentage": 27.06, "transactions": 8},
                        "Marketing": {"amount": 1800.00, "percentage": 21.18, "transactions": 12},
                        "Software": {"amount": 800.00, "percentage": 9.41, "transactions": 4},
                        "Meals": {"amount": 2400.00, "percentage": 28.24, "transactions": 24}
                    },
                    "trends": {
                        "highest_spending_category": "Meals",
                        "lowest_spending_category": "Software",
                        "average_transaction": 354.17,
                        "total_transactions": 63
                    }
                }
            }
            
            self.reports_storage[report_data["id"]] = report_data
            return report_data
            
        except Exception as e:
            logger.error(f"Failed to generate expense analysis: {e}")
            raise
    
    async def generate_cash_flow(self, user_id: str, date_range: Dict[str, Any]) -> Dict[str, Any]:
        """Generate cash flow report"""
        try:
            logger.info(f"Generating cash flow report for user {user_id}")
            
            start_date, end_date = self._parse_date_range(date_range)
            
            report_data = {
                "id": str(uuid.uuid4()),
                "type": "cash_flow",
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "data": {
                    "opening_balance": 10000.00,
                    "cash_inflows": {
                        "revenue": 15000.00,
                        "other_income": 500.00,
                        "total_inflows": 15500.00
                    },
                    "cash_outflows": {
                        "operating_expenses": 8500.00,
                        "tax_payments": 1000.00,
                        "total_outflows": 9500.00
                    },
                    "net_cash_flow": 6000.00,
                    "closing_balance": 16000.00,
                    "monthly_flow": [
                        {"month": "January", "inflow": 5200, "outflow": 3100, "net": 2100},
                        {"month": "February", "inflow": 5600, "outflow": 3200, "net": 2400},
                        {"month": "March", "inflow": 4700, "outflow": 3200, "net": 1500}
                    ]
                }
            }
            
            self.reports_storage[report_data["id"]] = report_data
            return report_data
            
        except Exception as e:
            logger.error(f"Failed to generate cash flow report: {e}")
            raise
    
    async def get_report(self, report_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific report"""
        report = self.reports_storage.get(report_id)
        if report and report.get("user_id") == user_id:
            return report
        return None
    
    async def get_user_reports(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """Get user's reports"""
        user_reports = [
            report for report in self.reports_storage.values()
            if report.get("user_id") == user_id
        ]
        return user_reports[offset:offset + limit]
    
    async def export_report(self, report_data: Dict[str, Any], format: str) -> Tuple[bytes, str, str]:
        """Export report in specified format"""
        try:
            logger.info(f"Exporting report {report_data['id']} as {format}")
            
            if format.lower() == "pdf":
                return await self._export_pdf(report_data)
            elif format.lower() == "csv":
                return await self._export_csv(report_data)
            elif format.lower() in ["excel", "xlsx"]:
                return await self._export_excel(report_data)
            else:
                raise ValueError(f"Unsupported export format: {format}")
                
        except Exception as e:
            logger.error(f"Failed to export report: {e}")
            raise
    
    async def _export_pdf(self, report_data: Dict[str, Any]) -> Tuple[bytes, str, str]:
        """Export report as PDF - ENHANCED for monthly reports"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph(f"{report_data['type'].replace('_', ' ').title()}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Date range
        date_info = Paragraph(
            f"Period: {report_data['date_range']['start_date']} to {report_data['date_range']['end_date']}",
            styles['Normal']
        )
        story.append(date_info)
        story.append(Spacer(1, 20))
        
        # Report data based on type
        if report_data['type'] == 'monthly_report':
            data = report_data['data']
            
            # Summary table
            summary_data = [
                ['Metric', 'Amount'],
                ['Total Income', f"${data['total_income']:,.2f}"],
                ['Total Expenses', f"${data['total_expenses']:,.2f}"],
                ['Net Profit', f"${data['net_profit']:,.2f}"],
                ['Profit Margin', f"{data['profit_margin']:.1%}"],
                ['Avg Daily Expense', f"${data['insights']['avg_daily_expense']:,.2f}"]
            ]
            
            table = Table(summary_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 30))
            
            # Category breakdown
            story.append(Paragraph("Expense Categories", styles['Heading2']))
            story.append(Spacer(1, 10))
            
            category_data = [['Category', 'Amount', 'Percentage']]
            for category in data['categories']:
                category_data.append([
                    category['name'],
                    f"${category['amount']:,.2f}",
                    f"{category['percentage']:.1%}"
                ])
            
            category_table = Table(category_data)
            category_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(category_table)
            
        elif report_data['type'] == 'financial_summary':
            data = report_data['data']
            summary_data = [
                ['Metric', 'Amount'],
                ['Total Income', f"${data['total_income']:,.2f}"],
                ['Total Expenses', f"${data['total_expenses']:,.2f}"],
                ['Net Profit', f"${data['net_profit']:,.2f}"]
            ]
            
            table = Table(summary_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        filename = f"{report_data['type']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        return pdf_content, filename, "application/pdf"
    
    async def _export_csv(self, report_data: Dict[str, Any]) -> Tuple[bytes, str, str]:
        """Export report as CSV - ENHANCED for monthly reports"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([f"{report_data['type'].replace('_', ' ').title()}"])
        writer.writerow([f"Generated: {report_data['generated_at']}"])
        writer.writerow([f"Period: {report_data['date_range']['start_date']} to {report_data['date_range']['end_date']}"])
        writer.writerow([])  # Empty row
        
        # Write data based on report type
        if report_data['type'] == 'monthly_report':
            data = report_data['data']
            
            # Summary section
            writer.writerow(['Summary'])
            writer.writerow(['Metric', 'Amount'])
            writer.writerow(['Total Income', data['total_income']])
            writer.writerow(['Total Expenses', data['total_expenses']])
            writer.writerow(['Net Profit', data['net_profit']])
            writer.writerow(['Profit Margin', f"{data['profit_margin']:.1%}"])
            writer.writerow([])
            
            # Categories section
            writer.writerow(['Expense Categories'])
            writer.writerow(['Category', 'Amount', 'Percentage'])
            for category in data['categories']:
                writer.writerow([category['name'], category['amount'], f"{category['percentage']:.1%}"])
            writer.writerow([])
            
            # Daily expenses section
            writer.writerow(['Daily Expenses (Sample)'])
            writer.writerow(['Date', 'Amount'])
            for expense in data['daily_expenses']:
                writer.writerow([expense['date'], expense['amount']])
                
        elif report_data['type'] == 'financial_summary':
            data = report_data['data']
            writer.writerow(['Metric', 'Amount'])
            writer.writerow(['Total Income', data['total_income']])
            writer.writerow(['Total Expenses', data['total_expenses']])
            writer.writerow(['Net Profit', data['net_profit']])
            writer.writerow([])
            
            writer.writerow(['Expense Categories'])
            writer.writerow(['Category', 'Amount'])
            for category, amount in data['expense_categories'].items():
                writer.writerow([category, amount])
        
        csv_content = output.getvalue().encode('utf-8')
        output.close()
        
        filename = f"{report_data['type']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return csv_content, filename, "text/csv"
    
    async def _export_excel(self, report_data: Dict[str, Any]) -> Tuple[bytes, str, str]:
        """Export report as Excel - ENHANCED for monthly reports"""
        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = "Report"
        
        # Title
        sheet['A1'] = f"{report_data['type'].replace('_', ' ').title()}"
        sheet['A1'].font = Font(size=16, bold=True)
        
        # Date info
        sheet['A3'] = f"Generated: {report_data['generated_at']}"
        sheet['A4'] = f"Period: {report_data['date_range']['start_date']} to {report_data['date_range']['end_date']}"
        
        # Data based on report type
        if report_data['type'] == 'monthly_report':
            data = report_data['data']
            
            # Summary section
            sheet['A6'] = 'Summary'
            sheet['A6'].font = Font(bold=True)
            
            sheet['A7'] = 'Metric'
            sheet['B7'] = 'Amount'
            sheet['A7'].font = Font(bold=True)
            sheet['B7'].font = Font(bold=True)
            
            sheet['A8'] = 'Total Income'
            sheet['B8'] = data['total_income']
            sheet['A9'] = 'Total Expenses'
            sheet['B9'] = data['total_expenses']
            sheet['A10'] = 'Net Profit'
            sheet['B10'] = data['net_profit']
            sheet['A11'] = 'Profit Margin'
            sheet['B11'] = f"{data['profit_margin']:.1%}"
            
            # Categories section
            sheet['A13'] = 'Expense Categories'
            sheet['A13'].font = Font(bold=True)
            
            sheet['A14'] = 'Category'
            sheet['B14'] = 'Amount'
            sheet['C14'] = 'Percentage'
            sheet['A14'].font = Font(bold=True)
            sheet['B14'].font = Font(bold=True)
            sheet['C14'].font = Font(bold=True)
            
            row = 15
            for category in data['categories']:
                sheet[f'A{row}'] = category['name']
                sheet[f'B{row}'] = category['amount']
                sheet[f'C{row}'] = f"{category['percentage']:.1%}"
                row += 1
                
        elif report_data['type'] == 'financial_summary':
            data = report_data['data']
            
            sheet['A6'] = 'Metric'
            sheet['B6'] = 'Amount'
            sheet['A6'].font = Font(bold=True)
            sheet['B6'].font = Font(bold=True)
            
            sheet['A7'] = 'Total Income'
            sheet['B7'] = data['total_income']
            sheet['A8'] = 'Total Expenses'
            sheet['B8'] = data['total_expenses']
            sheet['A9'] = 'Net Profit'
            sheet['B9'] = data['net_profit']
        
        # Save to buffer
        buffer = io.BytesIO()
        workbook.save(buffer)
        excel_content = buffer.getvalue()
        buffer.close()
        
        filename = f"{report_data['type']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        return excel_content, filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    
    def _parse_date_range(self, date_range: Dict[str, Any]) -> Tuple[str, str]:
        """Parse date range from request"""
        start_date = date_range.get('start_date')
        end_date = date_range.get('end_date')
        
        if not start_date:
            # Default to current year
            current_year = datetime.now().year
            start_date = f"{current_year}-01-01"
        
        if not end_date:
            # Default to current date
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        return start_date, end_date