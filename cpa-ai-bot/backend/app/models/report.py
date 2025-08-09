from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime, date
from decimal import Decimal
from bson import ObjectId
from .user import PyObjectId

class ReportType:
    MONTHLY = "monthly"
    ANNUAL = "annual"
    QUARTERLY = "quarterly"
    CUSTOM = "custom"

REPORT_TYPES = [
    ReportType.MONTHLY,
    ReportType.ANNUAL,
    ReportType.QUARTERLY,
    ReportType.CUSTOM
]

class CategorySummary(BaseModel):
    category: str
    total_amount: float
    expense_count: int
    percentage: float
    average_amount: float

class MonthlyBreakdown(BaseModel):
    month: int
    year: int
    total_amount: float
    expense_count: int
    month_name: str

class ReportSummary(BaseModel):
    total_expenses: float
    total_income: Optional[float] = 0.0
    expense_count: int
    income_count: Optional[int] = 0
    net_amount: Optional[float] = 0.0
    average_expense: float
    date_range: Dict[str, str]
    category_breakdown: List[CategorySummary] = []
    monthly_breakdown: Optional[List[MonthlyBreakdown]] = []

class TaxEstimation(BaseModel):
    estimated_quarterly_tax: float
    estimated_annual_tax: float
    deductible_expenses: float
    taxable_income: float
    tax_year: int
    filing_status: str = "single"
    notes: Optional[str] = None

class ReportBase(BaseModel):
    title: str
    report_type: str
    user_id: str
    start_date: date
    end_date: date
    summary: ReportSummary
    tax_estimation: Optional[TaxEstimation] = None
    notes: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    tax_estimation: Optional[TaxEstimation] = None

class ReportInDB(ReportBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_by: str = "system"  # system, user, or scheduled

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Report(ReportInDB):
    pass

class ReportTemplate(BaseModel):
    """Template for generating reports"""
    name: str
    report_type: str
    description: Optional[str] = None
    include_tax_estimation: bool = False
    include_category_breakdown: bool = True
    include_monthly_breakdown: bool = False
    custom_fields: Optional[Dict[str, Any]] = {}

class QuickStats(BaseModel):
    """Quick statistics for dashboard"""
    total_expenses_this_month: float
    total_expenses_last_month: float
    expense_count_this_month: int
    expense_count_last_month: int
    top_category_this_month: Optional[str] = None
    monthly_change_percentage: float
    yearly_total: float
    average_daily_expense: float

class BusinessMetrics(BaseModel):
    """Business performance metrics"""
    monthly_revenue: Optional[float] = 0.0
    monthly_expenses: float
    profit_margin: Optional[float] = 0.0
    burn_rate: float
    runway_months: Optional[float] = None
    growth_rate: Optional[float] = 0.0
    key_metrics: Dict[str, float] = {}

class ExportFormat:
    PDF = "pdf"
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"

EXPORT_FORMATS = [
    ExportFormat.PDF,
    ExportFormat.CSV,
    ExportFormat.EXCEL,
    ExportFormat.JSON
]

class ReportExport(BaseModel):
    """Report export configuration"""
    report_id: str
    format: str
    include_charts: bool = True
    include_raw_data: bool = False
    custom_logo: Optional[str] = None
    company_info: Optional[Dict[str, str]] = {}
    
class ScheduledReport(BaseModel):
    """Scheduled report configuration"""
    name: str
    report_type: str
    frequency: str  # daily, weekly, monthly, quarterly, annually
    email_recipients: List[str] = []
    is_active: bool = True
    next_run_date: datetime
    template_config: ReportTemplate
    
class ScheduledReportInDB(ScheduledReport):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_run_date: Optional[datetime] = None
    run_count: int = 0

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}