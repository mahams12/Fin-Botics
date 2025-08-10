import { apiMethods, buildUrl } from './api';

export const reportService = {
  // Get all reports
  getReports: async (filters = {}) => {
    const url = buildUrl('/reports', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get single report
  getReport: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}`);
    return response;
  },

  // Generate financial summary report
  generateFinancialSummary: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/financial-summary', dateRange);
    return response;
  },

  // Generate tax preparation report
  generateTaxReport: async (taxYear, options = {}) => {
    const response = await apiMethods.post('/reports/tax-preparation', {
      tax_year: taxYear,
      ...options,
    });
    return response;
  },

  // Generate profit & loss report
  generateProfitLoss: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/profit-loss', dateRange);
    return response;
  },

  // Generate expense analysis report
  generateExpenseAnalysis: async (dateRange = {}, categories = []) => {
    const response = await apiMethods.post('/reports/expense-analysis', {
      ...dateRange,
      categories,
    });
    return response;
  },

  // Generate cash flow report
  generateCashFlow: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/cash-flow', dateRange);
    return response;
  },

  // Generate budget vs actual report
  generateBudgetVsActual: async (budgetId, dateRange = {}) => {
    const response = await apiMethods.post('/reports/budget-vs-actual', {
      budget_id: budgetId,
      ...dateRange,
    });
    return response;
  },

  // Generate quarterly report
  generateQuarterlyReport: async (year, quarter) => {
    const response = await apiMethods.post('/reports/quarterly', {
      year,
      quarter,
    });
    return response;
  },

  // Generate annual report
  generateAnnualReport: async (year) => {
    const response = await apiMethods.post('/reports/annual', {
      year,
    });
    return response;
  },

  // Generate custom report
  generateCustomReport: async (reportConfig) => {
    const response = await apiMethods.post('/reports/custom', reportConfig);
    return response;
  },

  // Save custom report template
  saveReportTemplate: async (templateData) => {
    const response = await apiMethods.post('/reports/templates', templateData);
    return response;
  },

  // Get report templates
  getReportTemplates: async () => {
    const response = await apiMethods.get('/reports/templates');
    return response;
  },

  // Update report template
  updateReportTemplate: async (templateId, templateData) => {
    const response = await apiMethods.put(`/reports/templates/${templateId}`, templateData);
    return response;
  },

  // Delete report template
  deleteReportTemplate: async (templateId) => {
    const response = await apiMethods.delete(`/reports/templates/${templateId}`);
    return response;
  },

  // Export report
  exportReport: async (reportId, format = 'pdf') => {
    const response = await apiMethods.download(`/reports/${reportId}/export`, {
      params: { format }
    });
    return response;
  },

  // Email report
  emailReport: async (reportId, recipients, options = {}) => {
    const response = await apiMethods.post(`/reports/${reportId}/email`, {
      recipients,
      ...options,
    });
    return response;
  },

  // Schedule report
  scheduleReport: async (reportConfig) => {
    const response = await apiMethods.post('/reports/schedule', reportConfig);
    return response;
  },

  // Get scheduled reports
  getScheduledReports: async () => {
    const response = await apiMethods.get('/reports/scheduled');
    return response;
  },

  // Update scheduled report
  updateScheduledReport: async (scheduleId, reportConfig) => {
    const response = await apiMethods.put(`/reports/scheduled/${scheduleId}`, reportConfig);
    return response;
  },

  // Delete scheduled report
  deleteScheduledReport: async (scheduleId) => {
    const response = await apiMethods.delete(`/reports/scheduled/${scheduleId}`);
    return response;
  },

  // Get report history
  getReportHistory: async (filters = {}) => {
    const url = buildUrl('/reports/history', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  // Delete report
  deleteReport: async (reportId) => {
    const response = await apiMethods.delete(`/reports/${reportId}`);
    return response;
  },

  // Share report
  shareReport: async (reportId, shareConfig) => {
    const response = await apiMethods.post(`/reports/${reportId}/share`, shareConfig);
    return response;
  },

  // Get shared report
  getSharedReport: async (shareToken) => {
    const response = await apiMethods.get(`/reports/shared/${shareToken}`);
    return response;
  },

  // Get report insights
  getReportInsights: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}/insights`);
    return response;
  },

  // Generate tax estimation
  generateTaxEstimation: async (taxYear, options = {}) => {
    const response = await apiMethods.post('/reports/tax-estimation', {
      tax_year: taxYear,
      ...options,
    });
    return response;
  },

  // Generate expense forecast
  generateExpenseForecast: async (months = 12, options = {}) => {
    const response = await apiMethods.post('/reports/expense-forecast', {
      months,
      ...options,
    });
    return response;
  },

  // Get tax deduction summary
  getTaxDeductionSummary: async (taxYear) => {
    const response = await apiMethods.get(`/reports/tax-deductions/${taxYear}`);
    return response;
  },

  // Generate mileage report
  generateMileageReport: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/mileage', dateRange);
    return response;
  },

  // Generate vendor analysis
  generateVendorAnalysis: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/vendor-analysis', dateRange);
    return response;
  },

  // Generate budget performance report
  generateBudgetPerformance: async (budgetId) => {
    const response = await apiMethods.post(`/reports/budget-performance/${budgetId}`);
    return response;
  },

  // Get report metrics
  getReportMetrics: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}/metrics`);
    return response;
  },

  // Compare reports
  compareReports: async (reportIds) => {
    const response = await apiMethods.post('/reports/compare', {
      report_ids: reportIds,
    });
    return response;
  },

  // Get dashboard data
  getDashboardData: async (dateRange = {}) => {
    const url = buildUrl('/reports/dashboard', dateRange);
    const response = await apiMethods.get(url);
    return response;
  },

  // Generate executive summary
  generateExecutiveSummary: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/executive-summary', dateRange);
    return response;
  },

  // Get KPI data
  getKPIData: async (kpis = [], dateRange = {}) => {
    const response = await apiMethods.post('/reports/kpi', {
      kpis,
      ...dateRange,
    });
    return response;
  },

  // Create report bookmark
  bookmarkReport: async (reportId) => {
    const response = await apiMethods.post(`/reports/${reportId}/bookmark`);
    return response;
  },

  // Remove report bookmark
  removeBookmark: async (reportId) => {
    const response = await apiMethods.delete(`/reports/${reportId}/bookmark`);
    return response;
  },

  // Get bookmarked reports
  getBookmarkedReports: async () => {
    const response = await apiMethods.get('/reports/bookmarks');
    return response;
  },

  // Generate compliance report
  generateComplianceReport: async (complianceType, dateRange = {}) => {
    const response = await apiMethods.post('/reports/compliance', {
      compliance_type: complianceType,
      ...dateRange,
    });
    return response;
  },

  // Get report comments
  getReportComments: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}/comments`);
    return response;
  },

  // Add report comment
  addReportComment: async (reportId, comment) => {
    const response = await apiMethods.post(`/reports/${reportId}/comments`, {
      comment,
    });
    return response;
  },

  // Update report comment
  updateReportComment: async (commentId, comment) => {
    const response = await apiMethods.put(`/reports/comments/${commentId}`, {
      comment,
    });
    return response;
  },

  // Delete report comment
  deleteReportComment: async (commentId) => {
    const response = await apiMethods.delete(`/reports/comments/${commentId}`);
    return response;
  },
};