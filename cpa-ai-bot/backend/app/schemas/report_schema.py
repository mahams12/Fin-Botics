from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class ReportTypeEnum(str, Enum):
    MONTHLY = "monthly"
    ANNUAL = "annual"
    QUARTERLY = "quarterly"
    CUSTOM = "custom"

class ExportFormatEnum(str, Enum):
    PDF = "pdf"
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"

class CategorySummaryResponse(BaseModel):
    category: str
    total_amount: float
    expense_count: int
    percentage: float
    average_amount: float

class MonthlyBreakdownResponse(BaseModel):
    month: int
    year: int
    total_amount: float
    expense_count: int
    month_name: str

class TaxEstimationResponse(BaseModel):
    estimated_quarterly_tax: float
    estimated_annual_tax: float
    deductible_expenses: float
    taxable_income: float
    tax_year: int
    filing_status: str
    notes: Optional[str] = None

class ReportSummaryResponse(BaseModel):
    total_expenses: float
    total_income: Optional[float] = 0.0
    expense_count: int
    income_count: Optional[int] = 0
    net_amount: Optional[float] = 0.0
    average_expense: float
    date_range: Dict[str, str]
    category_breakdown: List[CategorySummaryResponse] = []
    monthly_breakdown: Optional[List[MonthlyBreakdownResponse]] = []

class QuickStatsResponse(BaseModel):
    total_expenses_this_month: float
    total_expenses_last_month: float
    expense_count_this_month: int
    expense_count_last_month: int
    top_category_this_month: Optional[str] = None
    monthly_change_percentage: float
    yearly_total: float
    average_daily_expense: float

class BusinessMetricsResponse(BaseModel):
    monthly_revenue: Optional[float] = 0.0
    monthly_expenses: float
    profit_margin: Optional[float] = 0.0
    burn_rate: float
    runway_months: Optional[float] = None
    growth_rate: Optional[float] = 0.0
    key_metrics: Dict[str, float] = {}

class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    start_date: date
    end_date: date
    summary: ReportSummaryResponse
    tax_estimation: Optional[TaxEstimationResponse] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    generated_by: str

class MonthlyReportRequest(BaseModel):
    year: int = Field(..., ge=2020, le=2030)
    month: int = Field(..., ge=1, le=12)
    include_tax_estimation: bool = False
    include_previous_month_comparison: bool = True

class AnnualReportRequest(BaseModel):
    year: int = Field(..., ge=2020, le=2030)
    include_tax_estimation: bool = True
    include_monthly_breakdown: bool = True
    include_quarterly_breakdown: bool = False

class QuarterlyReportRequest(BaseModel):
    year: int = Field(..., ge=2020, le=2030)
    quarter: int = Field(..., ge=1, le=4)
    include_tax_estimation: bool = True

class CustomReportRequest(BaseModel):
    title: str
    start_date: date
    end_date: date
    include_tax_estimation: bool = False
    include_category_breakdown: bool = True
    include_monthly_breakdown: bool = False
    categories: Optional[List[str]] = None
    notes: Optional[str] = None

class ReportExportRequest(BaseModel):
    report_id: str
    format: ExportFormatEnum
    include_charts: bool = True
    include_raw_data: bool = False
    custom_logo: Optional[str] = None
    company_info: Optional[Dict[str, str]] = {}

class ScheduledReportRequest(BaseModel):
    name: str
    report_type: ReportTypeEnum
    frequency: str = Field(..., pattern="^(daily|weekly|monthly|quarterly|annually)$")
    email_recipients: List[str] = []
    include_tax_estimation: bool = False
    include_category_breakdown: bool = True
    custom_config: Optional[Dict[str, Any]] = {}

class ScheduledReportResponse(BaseModel):
    id: str
    name: str
    report_type: str
    frequency: str
    email_recipients: List[str]
    is_active: bool
    next_run_date: datetime
    last_run_date: Optional[datetime] = None
    run_count: int
    created_at: datetime
    updated_at: datetime

class ScheduledReportUpdateRequest(BaseModel):
    name: Optional[str] = None
    frequency: Optional[str] = Field(None, pattern="^(daily|weekly|monthly|quarterly|annually)$")
    email_recipients: Optional[List[str]] = None
    is_active: Optional[bool] = None
    custom_config: Optional[Dict[str, Any]] = None

class DashboardStatsResponse(BaseModel):
    quick_stats: QuickStatsResponse
    business_metrics: BusinessMetricsResponse
    recent_reports: List[ReportResponse] = []
    upcoming_tax_dates: List[Dict[str, Any]] = []

class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_previous: bool

class TaxYearSummaryResponse(BaseModel):
    tax_year: int
    total_deductible_expenses: float
    estimated_tax_owed: float
    quarterly_payments_made: float
    remaining_tax_liability: float
    major_expense_categories: List[CategorySummaryResponse]
    tax_tips: List[str] = []

class ComparisonReportRequest(BaseModel):
    current_start_date: date
    current_end_date: date
    comparison_start_date: date
    comparison_end_date: date
    comparison_type: str = Field(..., pattern="^(period|year_over_year|month_over_month)$")

class ComparisonReportResponse(BaseModel):
    current_period: ReportSummaryResponse
    comparison_period: ReportSummaryResponse
    differences: Dict[str, float]
    percentage_changes: Dict[str, float]
    insights: List[str] = []

class BudgetVsActualRequest(BaseModel):
    start_date: date
    end_date: date
    budget_amounts: Dict[str, float]  # category -> budgeted amount

class BudgetVsActualResponse(BaseModel):
    period_summary: ReportSummaryResponse
    budget_comparison: List[Dict[str, Any]]
    total_budget: float
    total_actual: float
    variance: float
    variance_percentage: float
    over_budget_categories: List[str]
    under_budget_categories: List[str]

class ReportTemplateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    report_type: ReportTypeEnum
    include_tax_estimation: bool = False
    include_category_breakdown: bool = True
    include_monthly_breakdown: bool = False
    custom_fields: Optional[Dict[str, Any]] = {}
    is_public: bool = False

class ReportTemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    report_type: str
    include_tax_estimation: bool
    include_category_breakdown: bool
    include_monthly_breakdown: bool
    custom_fields: Dict[str, Any]
    is_public: bool
    created_by: str
    created_at: datetime
    usage_count: int = 0

class ReportError(BaseModel):
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ReportGenerationStatus(BaseModel):
    report_id: str
    status: str = Field(..., pattern="^(pending|processing|completed|failed)$")
    progress_percentage: int = Field(..., ge=0, le=100)
    estimated_completion: Optional[datetime] = None
    error: Optional[ReportError] = None