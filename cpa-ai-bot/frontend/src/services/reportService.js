import { apiMethods, buildUrl } from './api';

export const reportService = {
  // Enhanced downloadMonthlyReport with better debugging
  downloadMonthlyReport: async (params = {}) => {
    try {
      const { month, year, start_date, end_date, format = 'pdf' } = params;
      
      console.log(`🔧 Requesting monthly report download:`, { month, year, format });
      console.log(`🔧 Full params:`, params);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        format,
        month: month?.toString() || '',
        year: year?.toString() || '',
        start_date: start_date || '',
        end_date: end_date || ''
      });

      const url = `/api/v1/reports/download/monthly?${queryParams}`;
      console.log(`🔧 Final URL:`, url);
      
      // Check session_id
      const sessionId = localStorage.getItem('session_id');
      console.log(`🔧 Session ID:`, sessionId ? 'Present' : 'Missing');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      console.log(`🔧 Response status:`, response.status);
      console.log(`🔧 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}`);
        console.error(`❌ Error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Check if response is actually a blob/file
      const contentType = response.headers.get('content-type');
      console.log(`🔧 Content-Type:`, contentType);

      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.error(`❌ Received JSON instead of file:`, jsonResponse);
        throw new Error('Server returned JSON instead of file');
      }

      // Get the blob data
      const blob = await response.blob();
      console.log(`🔧 Blob size:`, blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Received empty file');
      }

      // Create download link
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url_blob;
      
      // Set filename
      const timestamp = new Date().toISOString().split('T')[0];
      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
      link.download = `monthly_report_${monthName}_${year}_${timestamp}.${format}`;
      
      console.log(`🔧 Download filename:`, link.download);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
      
      console.log(`✅ Monthly report downloaded successfully`);
      return { success: true, message: 'Monthly report downloaded successfully' };
      
    } catch (error) {
      console.error('❌ Monthly report download failed:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  },

  // Simple test method to check if backend is responding
  testBackend: async () => {
    try {
      console.log('🔧 Testing backend connection...');
      const response = await fetch('/api/v1/reports/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_id')}`,
        },
      });
      
      console.log('🔧 Test response status:', response.status);
      const data = await response.json();
      console.log('🔧 Test response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Backend test failed:', error);
      throw error;
    }
  },

  // Rest of your existing methods...
  getReports: async (filters = {}) => {
    const url = buildUrl('/reports', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  getReport: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}`);
    return response;
  },

  generateFinancialSummary: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/financial-summary', dateRange);
    return response;
  },

  generateTaxReport: async (taxYear, options = {}) => {
    const response = await apiMethods.post('/reports/tax-preparation', {
      tax_year: taxYear,
      ...options,
    });
    return response;
  },

  generateProfitLoss: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/profit-loss', dateRange);
    return response;
  },

  generateExpenseAnalysis: async (dateRange = {}, categories = []) => {
    const response = await apiMethods.post('/reports/expense-analysis', {
      ...dateRange,
      categories,
    });
    return response;
  },

  generateCashFlow: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/cash-flow', dateRange);
    return response;
  },

  generateBudgetVsActual: async (budgetId, dateRange = {}) => {
    const response = await apiMethods.post('/reports/budget-vs-actual', {
      budget_id: budgetId,
      ...dateRange,
    });
    return response;
  },

  generateQuarterlyReport: async (year, quarter) => {
    const response = await apiMethods.post('/reports/quarterly', {
      year,
      quarter,
    });
    return response;
  },

  generateAnnualReport: async (year) => {
    const response = await apiMethods.post('/reports/annual', {
      year,
    });
    return response;
  },

  generateCustomReport: async (reportConfig) => {
    const response = await apiMethods.post('/reports/custom', reportConfig);
    return response;
  },

  saveReportTemplate: async (templateData) => {
    const response = await apiMethods.post('/reports/templates', templateData);
    return response;
  },

  getReportTemplates: async () => {
    const response = await apiMethods.get('/reports/templates');
    return response;
  },

  updateReportTemplate: async (templateId, templateData) => {
    const response = await apiMethods.put(`/reports/templates/${templateId}`, templateData);
    return response;
  },

  deleteReportTemplate: async (templateId) => {
    const response = await apiMethods.delete(`/reports/templates/${templateId}`);
    return response;
  },

  exportReport: async (reportId, format = 'pdf') => {
    try {
      const response = await fetch(`/api/v1/reports/${reportId}/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_id')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `report_${reportId}_${timestamp}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  downloadReport: async (reportType, format = 'pdf', params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        format,
        start_date: params.start_date || '',
        end_date: params.end_date || ''
      }).toString();

      console.log(`🔧 Downloading ${reportType} as ${format}`);
      
      const response = await fetch(
        `/api/v1/reports/download/${reportType}?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_id')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${reportType}_${timestamp}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Download completed: ${reportType}_${timestamp}.${format}`);
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // ... rest of methods remain the same
  emailReport: async (reportId, recipients, options = {}) => {
    const response = await apiMethods.post(`/reports/${reportId}/email`, {
      recipients,
      ...options,
    });
    return response;
  },

  scheduleReport: async (reportConfig) => {
    const response = await apiMethods.post('/reports/schedule', reportConfig);
    return response;
  },

  getScheduledReports: async () => {
    const response = await apiMethods.get('/reports/scheduled');
    return response;
  },

  updateScheduledReport: async (scheduleId, reportConfig) => {
    const response = await apiMethods.put(`/reports/scheduled/${scheduleId}`, reportConfig);
    return response;
  },

  deleteScheduledReport: async (scheduleId) => {
    const response = await apiMethods.delete(`/reports/scheduled/${scheduleId}`);
    return response;
  },

  getReportHistory: async (filters = {}) => {
    const url = buildUrl('/reports/history', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  deleteReport: async (reportId) => {
    const response = await apiMethods.delete(`/reports/${reportId}`);
    return response;
  },

  shareReport: async (reportId, shareConfig) => {
    const response = await apiMethods.post(`/reports/${reportId}/share`, shareConfig);
    return response;
  },

  getSharedReport: async (shareToken) => {
    const response = await apiMethods.get(`/reports/shared/${shareToken}`);
    return response;
  },

  getReportInsights: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}/insights`);
    return response;
  },

  generateTaxEstimation: async (taxYear, options = {}) => {
    const response = await apiMethods.post('/reports/tax-estimation', {
      tax_year: taxYear,
      ...options,
    });
    return response;
  },

  generateExpenseForecast: async (months = 12, options = {}) => {
    const response = await apiMethods.post('/reports/expense-forecast', {
      months,
      ...options,
    });
    return response;
  },

  getTaxDeductionSummary: async (taxYear) => {
    const response = await apiMethods.get(`/reports/tax-deductions/${taxYear}`);
    return response;
  },

  generateMileageReport: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/mileage', dateRange);
    return response;
  },

  generateVendorAnalysis: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/vendor-analysis', dateRange);
    return response;
  },

  generateBudgetPerformance: async (budgetId) => {
    const response = await apiMethods.post(`/reports/budget-performance/${budgetId}`);
    return response;
  },

  getReportMetrics: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}/metrics`);
    return response;
  },

  compareReports: async (reportIds) => {
    const response = await apiMethods.post('/reports/compare', {
      report_ids: reportIds,
    });
    return response;
  },

  getDashboardData: async (dateRange = {}) => {
    const url = buildUrl('/reports/dashboard', dateRange);
    const response = await apiMethods.get(url);
    return response;
  },

  generateExecutiveSummary: async (dateRange = {}) => {
    const response = await apiMethods.post('/reports/executive-summary', dateRange);
    return response;
  },

  getKPIData: async (kpis = [], dateRange = {}) => {
    const response = await apiMethods.post('/reports/kpi', {
      kpis,
      ...dateRange,
    });
    return response;
  },

  bookmarkReport: async (reportId) => {
    const response = await apiMethods.post(`/reports/${reportId}/bookmark`);
    return response;
  },

  removeBookmark: async (reportId) => {
    const response = await apiMethods.delete(`/reports/${reportId}/bookmark`);
    return response;
  },

  getBookmarkedReports: async () => {
    const response = await apiMethods.get('/reports/bookmarks');
    return response;
  },

  generateComplianceReport: async (complianceType, dateRange = {}) => {
    const response = await apiMethods.post('/reports/compliance', {
      compliance_type: complianceType,
      ...dateRange,
    });
    return response;
  },

  getReportComments: async (reportId) => {
    const response = await apiMethods.get(`/reports/${reportId}/comments`);
    return response;
  },

  addReportComment: async (reportId, comment) => {
    const response = await apiMethods.post(`/reports/${reportId}/comments`, {
      comment,
    });
    return response;
  },

  updateReportComment: async (commentId, comment) => {
    const response = await apiMethods.put(`/reports/comments/${commentId}`, {
      comment,
    });
    return response;
  },

  deleteReportComment: async (commentId) => {
    const response = await apiMethods.delete(`/reports/comments/${commentId}`);
    return response;
  },
};