from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
from calendar import monthrange
from app.database.expense_db import ExpenseDatabase
from app.database.user_db import UserDatabase
from app.models.expense import Expense
from app.models.user import User
from app.models.report import (
    Report, ReportCreate, ReportSummary, CategorySummary, MonthlyBreakdown,
    TaxEstimation, QuickStats, BusinessMetrics
)
from app.utils.helpers import get_month_name, format_currency
from app.utils.formatters import format_expense_summary
import logging

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        self.expense_db = ExpenseDatabase()
        self.user_db = UserDatabase()

    async def generate_monthly_report(
        self, 
        user_id: str, 
        year: int, 
        month: int,
        include_tax_estimation: bool = False
    ) -> Dict[str, Any]:
        """Generate monthly financial report"""
        try:
            # Calculate date range
            start_date = datetime(year, month, 1)
            _, last_day = monthrange(year, month)
            end_date = datetime(year, month, last_day, 23, 59, 59)
            
            # Get expenses for the month
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=1000
            )
            
            # Generate summary
            summary = await self._generate_report_summary(expenses, start_date.date(), end_date.date())
            
            # Add previous month comparison
            prev_month = month - 1 if month > 1 else 12
            prev_year = year if month > 1 else year - 1
            prev_start = datetime(prev_year, prev_month, 1)
            _, prev_last_day = monthrange(prev_year, prev_month)
            prev_end = datetime(prev_year, prev_month, prev_last_day, 23, 59, 59)
            
            prev_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=prev_start,
                end_date=prev_end,
                limit=1000
            )
            
            prev_total = sum(expense.amount for expense in prev_expenses)
            current_total = summary["total_expenses"]
            
            # Calculate change
            change_amount = current_total - prev_total
            change_percentage = (change_amount / prev_total * 100) if prev_total > 0 else 0
            
            # Tax estimation if requested
            tax_estimation = None
            if include_tax_estimation:
                tax_estimation = await self._calculate_tax_estimation(user_id, year)
            
            return {
                "period": {
                    "month": month,
                    "year": year,
                    "month_name": get_month_name(month),
                    "start_date": start_date.date().isoformat(),
                    "end_date": end_date.date().isoformat()
                },
                "summary": summary,
                "comparison": {
                    "previous_month": {
                        "total": prev_total,
                        "count": len(prev_expenses)
                    },
                    "change_amount": change_amount,
                    "change_percentage": round(change_percentage, 2),
                    "trend": "up" if change_amount > 0 else "down" if change_amount < 0 else "stable"
                },
                "tax_estimation": tax_estimation,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating monthly report: {e}")
            return {}

    async def generate_annual_report(
        self, 
        user_id: str, 
        year: int,
        include_tax_estimation: bool = True,
        include_monthly_breakdown: bool = True
    ) -> Dict[str, Any]:
        """Generate annual financial report"""
        try:
            # Calculate date range
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 12, 31, 23, 59, 59)
            
            # Get all expenses for the year
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=5000
            )
            
            # Generate summary
            summary = await self._generate_report_summary(expenses, start_date.date(), end_date.date())
            
            # Monthly breakdown
            monthly_breakdown = []
            if include_monthly_breakdown:
                for month in range(1, 13):
                    month_start = datetime(year, month, 1)
                    _, last_day = monthrange(year, month)
                    month_end = datetime(year, month, last_day, 23, 59, 59)
                    
                    month_expenses = [
                        expense for expense in expenses
                        if month_start <= expense.date <= month_end
                    ]
                    
                    month_total = sum(expense.amount for expense in month_expenses)
                    
                    monthly_breakdown.append({
                        "month": month,
                        "month_name": get_month_name(month),
                        "total_amount": month_total,
                        "expense_count": len(month_expenses)
                    })
            
            # Year-over-year comparison
            prev_year_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=datetime(year - 1, 1, 1),
                end_date=datetime(year - 1, 12, 31, 23, 59, 59),
                limit=5000
            )
            
            prev_year_total = sum(expense.amount for expense in prev_year_expenses)
            current_total = summary["total_expenses"]
            
            yoy_change = current_total - prev_year_total
            yoy_percentage = (yoy_change / prev_year_total * 100) if prev_year_total > 0 else 0
            
            # Tax estimation
            tax_estimation = None
            if include_tax_estimation:
                tax_estimation = await self._calculate_tax_estimation(user_id, year)
            
            return {
                "period": {
                    "year": year,
                    "start_date": start_date.date().isoformat(),
                    "end_date": end_date.date().isoformat()
                },
                "summary": summary,
                "monthly_breakdown": monthly_breakdown,
                "year_over_year": {
                    "previous_year_total": prev_year_total,
                    "current_year_total": current_total,
                    "change_amount": yoy_change,
                    "change_percentage": round(yoy_percentage, 2),
                    "trend": "up" if yoy_change > 0 else "down" if yoy_change < 0 else "stable"
                },
                "tax_estimation": tax_estimation,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating annual report: {e}")
            return {}

    async def generate_custom_report(
        self, 
        user_id: str,
        start_date: date,
        end_date: date,
        title: str = "Custom Report",
        include_tax_estimation: bool = False
    ) -> Dict[str, Any]:
        """Generate custom date range report"""
        try:
            # Convert dates to datetime
            start_datetime = datetime.combine(start_date, datetime.min.time())
            end_datetime = datetime.combine(end_date, datetime.max.time())
            
            # Get expenses for the period
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_datetime,
                end_date=end_datetime,
                limit=5000
            )
            
            # Generate summary
            summary = await self._generate_report_summary(expenses, start_date, end_date)
            
            # Calculate period length for insights
            period_days = (end_date - start_date).days + 1
            daily_average = summary["total_expenses"] / period_days if period_days > 0 else 0
            
            # Tax estimation if requested
            tax_estimation = None
            if include_tax_estimation:
                # For custom periods, estimate based on current year
                tax_estimation = await self._calculate_tax_estimation(user_id, end_date.year)
            
            return {
                "title": title,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "days": period_days
                },
                "summary": summary,
                "insights": {
                    "daily_average": round(daily_average, 2),
                    "weekly_average": round(daily_average * 7, 2),
                    "monthly_projection": round(daily_average * 30, 2)
                },
                "tax_estimation": tax_estimation,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating custom report: {e}")
            return {}

    async def get_quick_stats(self, user_id: str) -> Dict[str, Any]:
        """Get quick dashboard statistics"""
        try:
            now = datetime.utcnow()
            
            # Current month
            current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            current_month_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=current_month_start,
                end_date=now,
                limit=1000
            )
            
            # Last month
            if current_month_start.month == 1:
                last_month_start = current_month_start.replace(year=current_month_start.year - 1, month=12)
            else:
                last_month_start = current_month_start.replace(month=current_month_start.month - 1)
            
            last_month_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=last_month_start,
                end_date=current_month_start,
                limit=1000
            )
            
            # Calculate totals
            current_total = sum(expense.amount for expense in current_month_expenses)
            last_total = sum(expense.amount for expense in last_month_expenses)
            
            # Change percentage
            change_percentage = 0
            if last_total > 0:
                change_percentage = ((current_total - last_total) / last_total) * 100
            
            # Top category this month
            category_totals = {}
            for expense in current_month_expenses:
                category = expense.category
                category_totals[category] = category_totals.get(category, 0) + expense.amount
            
            top_category = max(category_totals.keys(), key=category_totals.get) if category_totals else None
            
            # Year to date
            year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            ytd_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=year_start,
                end_date=now,
                limit=5000
            )
            ytd_total = sum(expense.amount for expense in ytd_expenses)
            
            # Daily average this month
            days_in_month = now.day
            daily_average = current_total / days_in_month if days_in_month > 0 else 0
            
            return {
                "total_expenses_this_month": round(current_total, 2),
                "total_expenses_last_month": round(last_total, 2),
                "expense_count_this_month": len(current_month_expenses),
                "expense_count_last_month": len(last_month_expenses),
                "top_category_this_month": top_category.replace("_", " ").title() if top_category else None,
                "monthly_change_percentage": round(change_percentage, 2),
                "yearly_total": round(ytd_total, 2),
                "average_daily_expense": round(daily_average, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting quick stats: {e}")
            return {}

    async def get_business_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get business performance metrics"""
        try:
            now = datetime.utcnow()
            current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Current month expenses
            current_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=current_month_start,
                end_date=now,
                limit=1000
            )
            
            monthly_expenses = sum(expense.amount for expense in current_expenses)
            
            # Calculate burn rate (monthly expenses)
            burn_rate = monthly_expenses
            
            # Placeholder values (would be enhanced with actual revenue data)
            monthly_revenue = 0.0  # This would come from revenue tracking
            profit_margin = 0.0 if monthly_revenue == 0 else ((monthly_revenue - monthly_expenses) / monthly_revenue) * 100
            
            # Basic metrics
            return {
                "monthly_revenue": monthly_revenue,
                "monthly_expenses": round(monthly_expenses, 2),
                "profit_margin": round(profit_margin, 2),
                "burn_rate": round(burn_rate, 2),
                "runway_months": None,  # Would calculate with actual revenue/savings data
                "growth_rate": 0.0,  # Would calculate with historical data
                "key_metrics": {
                    "expense_count": len(current_expenses),
                    "average_expense": round(monthly_expenses / len(current_expenses), 2) if current_expenses else 0,
                    "largest_expense": max(expense.amount for expense in current_expenses) if current_expenses else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting business metrics: {e}")
            return {}

    async def _generate_report_summary(
        self, 
        expenses: List[Expense], 
        start_date: date, 
        end_date: date
    ) -> Dict[str, Any]:
        """Generate report summary from expenses"""
        try:
            total_expenses = sum(expense.amount for expense in expenses)
            expense_count = len(expenses)
            average_expense = total_expenses / expense_count if expense_count > 0 else 0
            
            # Category breakdown
            category_breakdown = []
            category_totals = {}
            
            for expense in expenses:
                category = expense.category
                category_totals[category] = category_totals.get(category, 0) + expense.amount
            
            # Calculate percentages and create breakdown
            for category, amount in category_totals.items():
                percentage = (amount / total_expenses * 100) if total_expenses > 0 else 0
                category_count = len([e for e in expenses if e.category == category])
                category_average = amount / category_count if category_count > 0 else 0
                
                category_breakdown.append({
                    "category": category.replace("_", " ").title(),
                    "total_amount": round(amount, 2),
                    "expense_count": category_count,
                    "percentage": round(percentage, 2),
                    "average_amount": round(category_average, 2)
                })
            
            # Sort by amount (highest first)
            category_breakdown.sort(key=lambda x: x["total_amount"], reverse=True)
            
            return {
                "total_expenses": round(total_expenses, 2),
                "total_income": 0.0,  # Placeholder for future income tracking
                "expense_count": expense_count,
                "income_count": 0,  # Placeholder
                "net_amount": round(-total_expenses, 2),  # Negative since only expenses
                "average_expense": round(average_expense, 2),
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "category_breakdown": category_breakdown
            }
            
        except Exception as e:
            logger.error(f"Error generating report summary: {e}")
            return {}

    async def _calculate_tax_estimation(self, user_id: str, tax_year: int) -> Optional[Dict[str, Any]]:
        """Calculate tax estimation for the year"""
        try:
            # Get all expenses for the tax year
            start_date = datetime(tax_year, 1, 1)
            end_date = datetime(tax_year, 12, 31, 23, 59, 59)
            
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=5000
            )
            
            # Calculate deductible expenses (simplified - all business expenses)
            deductible_expenses = sum(expense.amount for expense in expenses)
            
            # Placeholder tax calculations (would be more sophisticated in real implementation)
            # These would be based on actual tax tables and user's income
            taxable_income = 50000  # Placeholder - would come from user's income data
            effective_tax_rate = 0.22  # Simplified effective tax rate
            
            # Reduce taxable income by deductible expenses
            adjusted_taxable_income = max(0, taxable_income - deductible_expenses)
            
            # Calculate estimated taxes
            estimated_annual_tax = adjusted_taxable_income * effective_tax_rate
            estimated_quarterly_tax = estimated_annual_tax / 4
            
            return {
                "estimated_quarterly_tax": round(estimated_quarterly_tax, 2),
                "estimated_annual_tax": round(estimated_annual_tax, 2),
                "deductible_expenses": round(deductible_expenses, 2),
                "taxable_income": round(adjusted_taxable_income, 2),
                "tax_year": tax_year,
                "filing_status": "single",  # Would be user configurable
                "notes": "This is a simplified estimate. Consult a tax professional for accurate calculations."
            }
            
        except Exception as e:
            logger.error(f"Error calculating tax estimation: {e}")
            return None

    async def export_report_data(
        self, 
        user_id: str, 
        start_date: date, 
        end_date: date,
        format_type: str = "json"
    ) -> Dict[str, Any]:
        """Export report data in various formats"""
        try:
            # Get expenses for the period
            start_datetime = datetime.combine(start_date, datetime.min.time())
            end_datetime = datetime.combine(end_date, datetime.max.time())
            
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_datetime,
                end_date=end_datetime,
                limit=5000
            )
            
            if format_type.lower() == "csv":
                # Prepare CSV data
                csv_data = []
                csv_data.append(["Date", "Description", "Amount", "Category", "Notes"])
                
                for expense in expenses:
                    csv_data.append([
                        expense.date.strftime("%Y-%m-%d"),
                        expense.description,
                        expense.amount,
                        expense.category.replace("_", " ").title(),
                        expense.notes or ""
                    ])
                
                return {
                    "format": "csv",
                    "data": csv_data,
                    "filename": f"expenses_{start_date}_{end_date}.csv"
                }
            
            else:  # JSON format
                json_data = []
                for expense in expenses:
                    json_data.append({
                        "id": str(expense.id),
                        "date": expense.date.isoformat(),
                        "description": expense.description,
                        "amount": expense.amount,
                        "category": expense.category,
                        "notes": expense.notes,
                        "created_at": expense.created_at.isoformat()
                    })
                
                return {
                    "format": "json",
                    "data": json_data,
                    "summary": await self._generate_report_summary(expenses, start_date, end_date),
                    "filename": f"expenses_{start_date}_{end_date}.json"
                }
            
        except Exception as e:
            logger.error(f"Error exporting report data: {e}")
            return {}

    async def get_tax_year_summary(self, user_id: str, tax_year: int) -> Dict[str, Any]:
        """Get comprehensive tax year summary"""
        try:
            # Get all expenses for the tax year
            start_date = datetime(tax_year, 1, 1)
            end_date = datetime(tax_year, 12, 31, 23, 59, 59)
            
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=5000
            )
            
            # Generate basic summary
            summary = await self._generate_report_summary(expenses, start_date.date(), end_date.date())
            
            # Tax-specific calculations
            tax_estimation = await self._calculate_tax_estimation(user_id, tax_year)
            
            # Major expense categories for tax purposes
            major_categories = sorted(
                summary["category_breakdown"], 
                key=lambda x: x["total_amount"], 
                reverse=True
            )[:5]  # Top 5 categories
            
            # Tax tips based on expenses
            tax_tips = []
            total_expenses = summary["total_expenses"]
            
            if total_expenses > 5000:
                tax_tips.append("Consider quarterly tax payments to avoid penalties")
            
            if any(cat["category"] == "Meals" for cat in major_categories):
                tax_tips.append("Remember: business meals are typically 50% deductible")
            
            if any(cat["category"] == "Travel" for cat in major_categories):
                tax_tips.append("Keep detailed records of business travel purposes")
            
            if any(cat["category"] == "Office Supplies" for cat in major_categories):
                tax_tips.append("Office supplies are fully deductible business expenses")
            
            tax_tips.append("Consult a tax professional for personalized advice")
            
            return {
                "tax_year": tax_year,
                "total_deductible_expenses": summary["total_expenses"],
                "estimated_tax_owed": tax_estimation["estimated_annual_tax"] if tax_estimation else 0,
                "quarterly_payments_made": 0,  # Placeholder - would track actual payments
                "remaining_tax_liability": tax_estimation["estimated_annual_tax"] if tax_estimation else 0,
                "major_expense_categories": major_categories,
                "tax_tips": tax_tips,
                "summary": summary,
                "tax_estimation": tax_estimation
            }
            
        except Exception as e:
            logger.error(f"Error getting tax year summary: {e}")
            return {}

    async def compare_periods(
        self,
        user_id: str,
        current_start: date,
        current_end: date,
        comparison_start: date,
        comparison_end: date
    ) -> Dict[str, Any]:
        """Compare two time periods"""
        try:
            # Get expenses for both periods
            current_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=datetime.combine(current_start, datetime.min.time()),
                end_date=datetime.combine(current_end, datetime.max.time()),
                limit=5000
            )
            
            comparison_expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=datetime.combine(comparison_start, datetime.min.time()),
                end_date=datetime.combine(comparison_end, datetime.max.time()),
                limit=5000
            )
            
            # Generate summaries
            current_summary = await self._generate_report_summary(current_expenses, current_start, current_end)
            comparison_summary = await self._generate_report_summary(comparison_expenses, comparison_start, comparison_end)
            
            # Calculate differences
            total_diff = current_summary["total_expenses"] - comparison_summary["total_expenses"]
            count_diff = current_summary["expense_count"] - comparison_summary["expense_count"]
            avg_diff = current_summary["average_expense"] - comparison_summary["average_expense"]
            
            # Calculate percentage changes
            total_pct = (total_diff / comparison_summary["total_expenses"] * 100) if comparison_summary["total_expenses"] > 0 else 0
            count_pct = (count_diff / comparison_summary["expense_count"] * 100) if comparison_summary["expense_count"] > 0 else 0
            avg_pct = (avg_diff / comparison_summary["average_expense"] * 100) if comparison_summary["average_expense"] > 0 else 0
            
            # Generate insights
            insights = []
            
            if abs(total_pct) > 20:
                direction = "increased" if total_pct > 0 else "decreased"
                insights.append(f"Total expenses {direction} by {abs(total_pct):.1f}%")
            
            if abs(count_pct) > 10:
                direction = "increased" if count_pct > 0 else "decreased"
                insights.append(f"Number of expenses {direction} by {abs(count_pct):.1f}%")
            
            if abs(avg_pct) > 15:
                direction = "increased" if avg_pct > 0 else "decreased"
                insights.append(f"Average expense amount {direction} by {abs(avg_pct):.1f}%")
            
            return {
                "current_period": current_summary,
                "comparison_period": comparison_summary,
                "differences": {
                    "total_expenses": round(total_diff, 2),
                    "expense_count": count_diff,
                    "average_expense": round(avg_diff, 2)
                },
                "percentage_changes": {
                    "total_expenses": round(total_pct, 2),
                    "expense_count": round(count_pct, 2),
                    "average_expense": round(avg_pct, 2)
                },
                "insights": insights
            }
            
        except Exception as e:
            logger.error(f"Error comparing periods: {e}")
            return {}

    async def get_category_trends(self, user_id: str, months: int = 12) -> Dict[str, Any]:
        """Get category spending trends over time"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=months * 30)  # Approximate
            
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=5000
            )
            
            # Group by month and category
            monthly_data = {}
            
            for expense in expenses:
                month_key = expense.date.strftime("%Y-%m")
                if month_key not in monthly_data:
                    monthly_data[month_key] = {}
                
                category = expense.category
                if category not in monthly_data[month_key]:
                    monthly_data[month_key][category] = 0
                
                monthly_data[month_key][category] += expense.amount
            
            return {
                "period_months": months,
                "monthly_data": monthly_data,
                "trends": "Trends analysis would be implemented here"
            }
            
        except Exception as e:
            logger.error(f"Error getting category trends: {e}")
            return {}