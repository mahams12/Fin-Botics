// API Constants
export const API_ENDPOINTS = {
    AUTH: '/auth',
    CHAT: '/chat',
    EXPENSES: '/expenses',
    REPORTS: '/reports',
    USERS: '/users',
  };
  
  // Expense Categories
  export const EXPENSE_CATEGORIES = [
    { value: 'office_supplies', label: 'Office Supplies', icon: '📝' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'meals', label: 'Meals & Entertainment', icon: '🍽️' },
    { value: 'equipment', label: 'Equipment', icon: '💻' },
    { value: 'software', label: 'Software & Subscriptions', icon: '📱' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'marketing', label: 'Marketing & Advertising', icon: '📢' },
    { value: 'legal', label: 'Legal & Professional', icon: '⚖️' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'rent', label: 'Rent & Lease', icon: '🏢' },
    { value: 'automotive', label: 'Automotive', icon: '🚗' },
    { value: 'education', label: 'Education & Training', icon: '🎓' },
    { value: 'health', label: 'Health & Medical', icon: '🏥' },
    { value: 'taxes', label: 'Taxes & Licenses', icon: '📋' },
    { value: 'other', label: 'Other', icon: '📊' },
  ];
  
  // Tax Categories
  export const TAX_CATEGORIES = [
    { value: 'deductible', label: 'Tax Deductible', color: 'green' },
    { value: 'non_deductible', label: 'Non-Deductible', color: 'red' },
    { value: 'partially_deductible', label: 'Partially Deductible', color: 'yellow' },
    { value: 'unknown', label: 'Unknown', color: 'gray' },
  ];
  
  // Expense Types
  export const EXPENSE_TYPES = [
    { value: 'business', label: 'Business Expense' },
    { value: 'personal', label: 'Personal Expense' },
    { value: 'mixed', label: 'Mixed Use' },
  ];
  
  // Payment Methods
  export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'debit_card', label: 'Debit Card', icon: '💳' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'check', label: 'Check', icon: '📝' },
    { value: 'paypal', label: 'PayPal', icon: '💙' },
    { value: 'venmo', label: 'Venmo', icon: '💜' },
    { value: 'other', label: 'Other', icon: '💰' },
  ];
  
  // Report Types
  export const REPORT_TYPES = [
    { value: 'financial_summary', label: 'Financial Summary' },
    { value: 'tax_preparation', label: 'Tax Preparation' },
    { value: 'profit_loss', label: 'Profit & Loss' },
    { value: 'expense_analysis', label: 'Expense Analysis' },
    { value: 'cash_flow', label: 'Cash Flow' },
    { value: 'budget_vs_actual', label: 'Budget vs Actual' },
    { value: 'quarterly', label: 'Quarterly Report' },
    { value: 'annual', label: 'Annual Report' },
    { value: 'custom', label: 'Custom Report' },
  ];
  
  // Date Ranges
  export const DATE_RANGES = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];
  
  // Status Options
  export const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'archived', label: 'Archived', color: 'blue' },
  ];
  
  // File Types
  export const SUPPORTED_FILE_TYPES = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    documents: ['.pdf', '.doc', '.docx', '.txt'],
    spreadsheets: ['.csv', '.xlsx', '.xls'],
    receipts: ['.jpg', '.jpeg', '.png', '.pdf'],
  };
  
  // Currency Options
  export const CURRENCIES = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  ];
  
  // Theme Options
  export const THEME_OPTIONS = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto (System)' },
  ];
  
  // Language Options
  export const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
  ];
  
  // Frequency Options
  export const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];
  
  // Chart Colors
  export const CHART_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#EC4899', // pink
    '#6B7280', // gray
  ];
  
  // Validation Rules
  export const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
    PASSWORD_MIN_LENGTH: 8,
    AMOUNT_MAX_DIGITS: 10,
    DESCRIPTION_MAX_LENGTH: 500,
    TITLE_MAX_LENGTH: 100,
  };
  
  // Local Storage Keys
  export const STORAGE_KEYS = {
    AUTH_TOKEN: 'token',
    USER_PREFERENCES: 'userPreferences',
    THEME: 'theme',
    LANGUAGE: 'language',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed',
    RECENT_SEARCHES: 'recentSearches',
    DRAFT_EXPENSES: 'draftExpenses',
  };
  
  // API Response Status
  export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    LOADING: 'loading',
    IDLE: 'idle',
  };
  
  // Notification Types
  export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  };
  
  // User Roles
  export const USER_ROLES = [
    { value: 'user', label: 'User' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'admin', label: 'Administrator' },
  ];
  
  // Business Types
  export const BUSINESS_TYPES = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'nonprofit', label: 'Nonprofit' },
    { value: 'other', label: 'Other' },
  ];
  
  // Tax Years
  export const TAX_YEARS = (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push({ value: i, label: i.toString() });
    }
    return years;
  })();
  
  // Quarters
  export const QUARTERS = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' },
  ];
  
  // Export Formats
  export const EXPORT_FORMATS = [
    { value: 'csv', label: 'CSV', icon: '📊' },
    { value: 'xlsx', label: 'Excel', icon: '📗' },
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'json', label: 'JSON', icon: '📋' },
  ];
  
  // Time Zones
  export const TIME_ZONES = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ];
  
  // Default Values
  export const DEFAULTS = {
    PAGE_SIZE: 20,
    CURRENCY: 'USD',
    LANGUAGE: 'en',
    THEME: 'light',
    DATE_FORMAT: 'MM/DD/YYYY',
    TIME_FORMAT: '12',
    TIMEZONE: 'America/New_York',
  };