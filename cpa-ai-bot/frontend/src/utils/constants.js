// Date range filters
export const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'travel', label: 'Travel' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'training', label: 'Training & Education' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'taxes', label: 'Taxes & Fees' },
  { value: 'other', label: 'Other' },
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'other', label: 'Other' },
];

// Expense statuses
export const EXPENSE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'amount-desc', label: 'Highest Amount' },
  { value: 'amount-asc', label: 'Lowest Amount' },
  { value: 'vendor-asc', label: 'Vendor A-Z' },
  { value: 'vendor-desc', label: 'Vendor Z-A' },
];

// Tax categories - MISSING EXPORT ADDED
export const TAX_CATEGORIES = [
  { value: 'deductible', label: 'Tax Deductible' },
  { value: 'non_deductible', label: 'Non-Deductible' },
  { value: 'partial', label: 'Partially Deductible' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
];

// Tax years - MISSING EXPORT ADDED
export const TAX_YEARS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
})();

// Business types - MISSING EXPORT ADDED
export const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'c_corp', label: 'C Corporation' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' },
];

// Chart colors - MISSING EXPORT ADDED
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  light: '#E5E7EB',
  dark: '#374151',
  
  // Color palette for charts
  palette: [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ],
  
  // Expense category colors
  categories: {
    office_supplies: '#3B82F6',
    travel: '#8B5CF6',
    meals: '#10B981',
    marketing: '#F59E0B',
    software: '#EF4444',
    equipment: '#06B6D4',
    utilities: '#EC4899',
    professional_services: '#84CC16',
    training: '#F97316',
    insurance: '#6366F1',
    taxes: '#64748B',
    other: '#9CA3AF',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  USERS: '/api/v1/users',
  EXPENSES: '/api/v1/expenses',
  CHAT: '/api/v1/chat',
  REPORTS: '/api/v1/reports',
};

// App configuration
export const APP_CONFIG = {
  name: 'CPA AI Bot',
  version: '1.0.0',
  description: 'AI-powered CPA assistant for small businesses',
};

// File upload settings
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
};

// Pagination settings
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  maxPageSize: 100,
};

// Currency settings
export const CURRENCY = {
  default: 'USD',
  symbol: '$',
  locale: 'en-US',
};

// Date formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  full: 'MMMM dd, yyyy',
  short: 'MM/dd/yyyy',
};

// Notification settings
export const NOTIFICATIONS = {
  duration: 4000, // 4 seconds
  position: 'top-right',
};

// Theme settings
export const THEME = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};