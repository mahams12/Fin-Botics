# Import all schema classes from their respective modules
from .auth_schema import LoginRequest, GoogleAuthRequest, RegisterRequest, TokenResponse
from .user_schema import (
    UserCreateRequest, UserUpdateRequest, UserResponse, UserProfileResponse,
    UserStatisticsResponse, UserDashboardResponse, UserActivityResponse,
    UserListResponse, UserPreferencesRequest, UserPreferencesResponse
)
from .expense_schema import (
    ExpenseCreateRequest, ExpenseFromTextRequest, ExpenseUpdateRequest,
    ExpenseResponse, ExpenseListResponse
)
from .chat_schema import (
    ChatMessageRequest, ChatMessageResponse, 
    ChatSessionResponse, ChatHistoryResponse
)
from .report_schema import (
    ReportResponse, MonthlyReportRequest, AnnualReportRequest, QuarterlyReportRequest,
    CustomReportRequest, ReportExportRequest, ScheduledReportRequest, ScheduledReportResponse,
    DashboardStatsResponse, ReportListResponse, TaxYearSummaryResponse,
    ComparisonReportRequest, ComparisonReportResponse, BudgetVsActualRequest, BudgetVsActualResponse,
    ReportTemplateRequest, ReportTemplateResponse, ReportGenerationStatus
)

# Define all exported schema classes
__all__ = [
    # Auth schemas
    "LoginRequest", 
    "GoogleAuthRequest", 
    "RegisterRequest", 
    "TokenResponse",
    
    # User schemas
    "UserCreateRequest", 
    "UserUpdateRequest", 
    "UserResponse", 
    "UserProfileResponse",
    "UserStatisticsResponse", 
    "UserDashboardResponse", 
    "UserActivityResponse",
    "UserListResponse", 
    "UserPreferencesRequest", 
    "UserPreferencesResponse",
    
    # Expense schemas
    "ExpenseCreateRequest", 
    "ExpenseFromTextRequest", 
    "ExpenseUpdateRequest",
    "ExpenseResponse", 
    "ExpenseListResponse",
    
    # Chat schemas
    "ChatMessageRequest", 
    "ChatMessageResponse", 
    "ChatSessionResponse", 
    "ChatHistoryResponse",
    
    # Report schemas
    "ReportResponse", 
    "MonthlyReportRequest", 
    "AnnualReportRequest", 
    "QuarterlyReportRequest",
    "CustomReportRequest", 
    "ReportExportRequest", 
    "ScheduledReportRequest", 
    "ScheduledReportResponse",
    "DashboardStatsResponse", 
    "ReportListResponse", 
    "TaxYearSummaryResponse",
    "ComparisonReportRequest", 
    "ComparisonReportResponse", 
    "BudgetVsActualRequest", 
    "BudgetVsActualResponse",
    "ReportTemplateRequest", 
    "ReportTemplateResponse", 
    "ReportGenerationStatus"
]