from typing import Dict, Any, List, Optional
from datetime import datetime, date
from decimal import Decimal
from app.database.expense_db import ExpenseDatabase
from app.database.user_db import UserDatabase
from app.models.expense import Expense
import logging

logger = logging.getLogger(__name__)

class TaxService:
    def __init__(self):
        self.expense_db = ExpenseDatabase()
        self.user_db = UserDatabase()
        
        # 2024 Tax brackets for single filers (simplified)
        self.federal_tax_brackets = [
            {"min": 0, "max": 11000, "rate": 0.10},
            {"min": 11000, "max": 44725, "rate": 0.12},
            {"min": 44725, "max": 95375, "rate": 0.22},
            {"min": 95375, "max": 182050, "rate": 0.24},
            {"min": 182050, "max": 231250, "rate": 0.32},
            {"min": 231250, "max": 578125, "rate": 0.35},
            {"min": 578125, "max": float('inf'), "rate": 0.37}
        ]
        
        # Standard deductions (2024)
        self.standard_deductions = {
            "single": 13850,
            "married_joint": 27700,
            "married_separate": 13850,
            "head_household": 20800
        }
        
        # Self-employment tax rates
        self.se_tax_rate = 0.1413  # 14.13% (12.4% Social Security + 1.45% Medicare)
        self.se_deduction_rate = 0.9235  # 92.35% of SE income subject to SE tax

    async def calculate_quarterly_taxes(
        self, 
        user_id: str, 
        year: int, 
        quarter: int,
        estimated_income: float = 0,
        filing_status: str = "single"
    ) -> Dict[str, Any]:
        """Calculate quarterly estimated tax payments"""
        try:
            # Get quarter date range
            quarter_dates = self._get_quarter_dates(year, quarter)
            start_date = quarter_dates["start"]
            end_date = quarter_dates["end"]
            
            # Get expenses for the quarter
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=datetime.combine(start_date, datetime.min.time()),
                end_date=datetime.combine(end_date, datetime.max.time()),
                limit=1000
            )
            
            # Calculate deductible business expenses
            deductible_expenses = await self._calculate_deductible_expenses(expenses)
            
            # Project annual figures from quarterly data
            quarterly_expenses = sum(deductible_expenses.values())
            projected_annual_expenses = quarterly_expenses * 4
            projected_annual_income = estimated_income * 4 if estimated_income > 0 else 50000  # Default assumption
            
            # Calculate estimated taxes
            tax_calculation = await self._calculate_annual_tax(
                projected_annual_income,
                projected_annual_expenses,
                filing_status
            )
            
            # Calculate quarterly payment
            quarterly_payment = tax_calculation["total_tax"] / 4
            
            # Get quarter due date
            due_dates = {1: "April 15", 2: "June 15", 3: "September 15", 4: "January 15"}
            due_date = due_dates.get(quarter, "Check IRS website")
            
            return {
                "year": year,
                "quarter": quarter,
                "quarter_period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "due_date": due_date
                },
                "expenses": {
                    "quarterly_total": round(quarterly_expenses, 2),
                    "projected_annual": round(projected_annual_expenses, 2),
                    "category_breakdown": {k: round(v, 2) for k, v in deductible_expenses.items()},
                    "deductible_percentage": 100.0  # Assuming all business expenses are deductible
                },
                "income": {
                    "quarterly_estimate": estimated_income,
                    "projected_annual": projected_annual_income
                },
                "tax_calculation": {
                    "federal_income_tax": round(tax_calculation["federal_tax"], 2),
                    "self_employment_tax": round(tax_calculation["se_tax"], 2),
                    "total_annual_tax": round(tax_calculation["total_tax"], 2),
                    "quarterly_payment": round(quarterly_payment, 2)
                },
                "recommendations": await self._get_tax_recommendations(
                    quarterly_expenses, 
                    estimated_income,
                    quarter
                )
            }
            
        except Exception as e:
            logger.error(f"Error calculating quarterly taxes: {e}")
            return {}

    async def calculate_annual_tax_summary(
        self, 
        user_id: str, 
        tax_year: int,
        estimated_income: float = 0,
        filing_status: str = "single"
    ) -> Dict[str, Any]:
        """Calculate comprehensive annual tax summary"""
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
            
            # Calculate deductible expenses by category
            deductible_expenses = await self._calculate_deductible_expenses(expenses)
            total_deductible = sum(deductible_expenses.values())
            
            # Use estimated income or default
            annual_income = estimated_income if estimated_income > 0 else 50000
            
            # Calculate tax liability
            tax_calculation = await self._calculate_annual_tax(
                annual_income,
                total_deductible,
                filing_status
            )
            
            # Calculate potential refund/owed (assuming standard withholding)
            estimated_withholding = annual_income * 0.15  # Rough estimate
            refund_or_owed = estimated_withholding - tax_calculation["total_tax"]
            
            return {
                "tax_year": tax_year,
                "filing_status": filing_status,
                "income_summary": {
                    "gross_income": round(annual_income, 2),
                    "business_deductions": round(total_deductible, 2),
                    "adjusted_gross_income": round(annual_income - total_deductible, 2),
                    "standard_deduction": self.standard_deductions.get(filing_status, 13850),
                    "taxable_income": round(max(0, annual_income - total_deductible - self.standard_deductions.get(filing_status, 13850)), 2)
                },
                "deductible_expenses": {
                    "total": round(total_deductible, 2),
                    "by_category": {k: round(v, 2) for k, v in deductible_expenses.items()},
                    "potential_savings": round(total_deductible * 0.22, 2)  # Approximate tax savings
                },
                "tax_liability": {
                    "federal_income_tax": round(tax_calculation["federal_tax"], 2),
                    "self_employment_tax": round(tax_calculation["se_tax"], 2),
                    "total_tax": round(tax_calculation["total_tax"], 2),
                    "effective_tax_rate": round((tax_calculation["total_tax"] / annual_income * 100), 2)
                },
                "payment_summary": {
                    "estimated_withholding": round(estimated_withholding, 2),
                    "refund_or_owed": round(refund_or_owed, 2),
                    "quarterly_payments": round(tax_calculation["total_tax"] / 4, 2)
                },
                "recommendations": await self._get_annual_tax_recommendations(
                    total_deductible,
                    annual_income,
                    tax_calculation["total_tax"]
                )
            }
            
        except Exception as e:
            logger.error(f"Error calculating annual tax summary: {e}")
            return {}

    async def get_tax_deduction_analysis(self, user_id: str, year: int) -> Dict[str, Any]:
        """Analyze potential tax deductions"""
        try:
            # Get all expenses for the year
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 12, 31, 23, 59, 59)
            
            expenses = await self.expense_db.get_user_expenses(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=5000
            )
            
            # Analyze deductions by category
            analysis = {}
            
            for expense in expenses:
                category = expense.category
                if category not in analysis:
                    analysis[category] = {
                        "total": 0,
                        "count": 0,
                        "deductible_percentage": self._get_deductible_percentage(category),
                        "notes": self._get_deduction_notes(category)
                    }
                
                analysis[category]["total"] += expense.amount
                analysis[category]["count"] += 1
            
            # Calculate deductible amounts
            for category, data in analysis.items():
                data["deductible_amount"] = data["total"] * data["deductible_percentage"] / 100
                data["potential_savings"] = data["deductible_amount"] * 0.22  # Approximate tax bracket
            
            # Sort by potential savings
            sorted_analysis = dict(sorted(
                analysis.items(), 
                key=lambda x: x[1]["potential_savings"], 
                reverse=True
            ))
            
            return {
                "tax_year": year,
                "category_analysis": sorted_analysis,
                "summary": {
                    "total_expenses": sum(data["total"] for data in analysis.values()),
                    "total_deductible": sum(data["deductible_amount"] for data in analysis.values()),
                    "total_potential_savings": sum(data["potential_savings"] for data in analysis.values()),
                    "categories_analyzed": len(analysis)
                },
                "tips": [
                    "Keep detailed records of all business expenses",
                    "Consider tracking mileage for business travel",
                    "Home office expenses may be partially deductible",
                    "Professional development and education costs are often deductible",
                    "Consult a tax professional for personalized advice"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error analyzing tax deductions: {e}")
            return {}

    async def get_tax_calendar(self, year: int) -> List[Dict[str, Any]]:
        """Get important tax dates for the year"""
        tax_calendar = [
            {
                "date": f"January 15, {year}",
                "event": "Q4 Estimated Tax Payment Due (Previous Year)",
                "description": "Fourth quarter estimated tax payment for the previous year",
                "type": "payment"
            },
            {
                "date": f"January 31, {year}",
                "event": "1099s and W-2s Due",
                "description": "Deadline for employers to send tax documents",
                "type": "document"
            },
            {
                "date": f"March 15, {year}",
                "event": "S-Corp Tax Return Due",
                "description": "S-Corporation tax returns (Form 1120S) due",
                "type": "filing"
            },
            {
                "date": f"April 15, {year}",
                "event": "Tax Return & Q1 Estimated Payment Due",
                "description": "Individual tax returns and first quarter estimated payments",
                "type": "filing"
            },
            {
                "date": f"June 15, {year}",
                "event": "Q2 Estimated Tax Payment Due",
                "description": "Second quarter estimated tax payment",
                "type": "payment"
            },
            {
                "date": f"September 15, {year}",
                "event": "Q3 Estimated Tax Payment Due",
                "description": "Third quarter estimated tax payment",
                "type": "payment"
            },
            {
                "date": f"October 15, {year}",
                "event": "Extended Return Deadline",
                "description": "Deadline for filing tax returns with extension",
                "type": "filing"
            }
        ]
        
        return tax_calendar

    async def _calculate_deductible_expenses(self, expenses: List[Expense]) -> Dict[str, float]:
        """Calculate deductible amounts by category"""
        deductible = {}
        
        for expense in expenses:
            category = expense.category
            deductible_percentage = self._get_deductible_percentage(category)
            deductible_amount = expense.amount * (deductible_percentage / 100)
            
            if category not in deductible:
                deductible[category] = 0
            deductible[category] += deductible_amount
        
        return deductible

    def _get_deductible_percentage(self, category: str) -> float:
        """Get deductible percentage for expense category"""
        deductible_rates = {
            "office_supplies": 100.0,
            "software": 100.0,
            "professional_services": 100.0,
            "utilities": 30.0,  # Assuming partial home office use
            "marketing": 100.0,
            "travel": 100.0,
            "meals": 50.0,  # Business meals are 50% deductible
            "other": 80.0   # Conservative estimate
        }
        
        return deductible_rates.get(category, 80.0)

    def _get_deduction_notes(self, category: str) -> str:
        """Get notes about deductibility for each category"""
        notes = {
            "office_supplies": "Fully deductible business supplies",
            "software": "Business software and subscriptions are fully deductible",
            "professional_services": "Fully deductible when used for business",
            "utilities": "Only the business portion of home utilities is deductible",
            "marketing": "Advertising and marketing expenses are fully deductible",
            "travel": "Business travel expenses are fully deductible",
            "meals": "Business meals are 50% deductible (some exceptions apply)",
            "other": "Review individual expenses for business purpose"
        }
        
        return notes.get(category, "Consult tax professional for deductibility")

    async def _calculate_annual_tax(
        self, 
        gross_income: float, 
        business_deductions: float, 
        filing_status: str
    ) -> Dict[str, float]:
        """Calculate federal tax liability"""
        try:
            # Calculate adjusted gross income
            agi = max(0, gross_income - business_deductions)
            
            # Calculate self-employment tax
            se_income = gross_income * self.se_deduction_rate
            se_tax = se_income * self.se_tax_rate
            
            # SE tax deduction (half of SE tax is deductible)
            se_deduction = se_tax / 2
            
            # Calculate taxable income
            standard_deduction = self.standard_deductions.get(filing_status, 13850)
            taxable_income = max(0, agi - se_deduction - standard_deduction)
            
            # Calculate federal income tax using brackets
            federal_tax = 0
            remaining_income = taxable_income
            
            for bracket in self.federal_tax_brackets:
                if remaining_income <= 0:
                    break
                
                bracket_income = min(remaining_income, bracket["max"] - bracket["min"])
                bracket_tax = bracket_income * bracket["rate"]
                federal_tax += bracket_tax
                remaining_income -= bracket_income
            
            return {
                "federal_tax": federal_tax,
                "se_tax": se_tax,
                "total_tax": federal_tax + se_tax,
                "agi": agi,
                "taxable_income": taxable_income
            }
            
        except Exception as e:
            logger.error(f"Error calculating annual tax: {e}")
            return {"federal_tax": 0, "se_tax": 0, "total_tax": 0}

    def _get_quarter_dates(self, year: int, quarter: int) -> Dict[str, date]:
        """Get start and end dates for a quarter"""
        quarters = {
            1: {"start": date(year, 1, 1), "end": date(year, 3, 31)},
            2: {"start": date(year, 4, 1), "end": date(year, 6, 30)},
            3: {"start": date(year, 7, 1), "end": date(year, 9, 30)},
            4: {"start": date(year, 10, 1), "end": date(year, 12, 31)}
        }
        
        return quarters.get(quarter, quarters[1])

    async def _get_tax_recommendations(
        self, 
        quarterly_expenses: float, 
        quarterly_income: float, 
        quarter: int
    ) -> List[str]:
        """Get tax recommendations based on quarterly data"""
        recommendations = []
        
        if quarterly_expenses < quarterly_income * 0.1:
            recommendations.append("Consider tracking more business expenses to maximize deductions")
        
        if quarter == 4:
            recommendations.append("Review annual totals and consider year-end tax planning strategies")
        
        recommendations.extend([
            "Keep detailed records of all business expenses",
            "Consider making quarterly estimated tax payments to avoid penalties",
            "Track business mileage and home office expenses",
            "Save receipts for all business-related purchases"
        ])
        
        return recommendations

    async def _get_annual_tax_recommendations(
        self, 
        total_deductions: float, 
        annual_income: float, 
        tax_liability: float
    ) -> List[str]:
        """Get annual tax recommendations"""
        recommendations = []
        
        deduction_rate = total_deductions / annual_income if annual_income > 0 else 0
        
        if deduction_rate < 0.15:
            recommendations.append("Consider tracking more business expenses to increase deductions")
        
        if tax_liability > annual_income * 0.25:
            recommendations.append("Consider tax-advantaged retirement contributions to reduce tax liability")
        
        recommendations.extend([
            "Review quarterly estimated payments for next year",
            "Consider consulting a tax professional for advanced strategies",
            "Keep meticulous records for potential IRS inquiries",
            "Plan major business purchases for optimal tax timing"
        ])
        
        return recommendations