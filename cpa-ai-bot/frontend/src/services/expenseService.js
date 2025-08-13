import axios from 'axios';

// Create axios instance with FIXED base URL (no /api/v1)
const api = axios.create({
  baseURL: 'http://localhost:8080', // Hardcoded without /api/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session ID
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('session_id');
    const token = localStorage.getItem('token');
    
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
      config.headers['Authorization'] = `Bearer ${sessionId}`;
      if (!config.params) {
        config.params = {};
      }
      config.params.session_id = sessionId;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // LOG THE EXACT URL BEING CALLED
    const queryString = config.params ? new URLSearchParams(config.params).toString() : '';
    const fullUrl = `${config.baseURL}${config.url}${queryString ? `?${queryString}` : ''}`;
    console.log('🔥 EXPENSES API CALL:', fullUrl);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Expenses API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export const expenseService = {
  // Get expenses with filters
  getExpenses: async (filters = {}) => {
    console.log('🎯 Input filters:', filters);
    
    try {
      // Pass filters as params to axios, let it handle query string
      const response = await api.get('/api/v1/expenses', {
        params: filters
      });
      return response;
    } catch (error) {
      console.error('getExpenses failed:', error);
      throw error;
    }
  },

  // All other methods remain the same...
  getExpense: async (expenseId) => {
    try {
      const response = await api.get(`/api/v1/expenses/${expenseId}`);
      return response;
    } catch (error) {
      console.error('getExpense failed:', error);
      throw error;
    }
  },

  createExpense: async (expenseData) => {
    try {
      const response = await api.post('/api/v1/expenses', expenseData);
      return response;
    } catch (error) {
      console.error('createExpense failed:', error);
      throw error;
    }
  },

  updateExpense: async (expenseId, expenseData) => {
    try {
      const response = await api.put(`/api/v1/expenses/${expenseId}`, expenseData);
      return response;
    } catch (error) {
      console.error('updateExpense failed:', error);
      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      const response = await api.delete(`/api/v1/expenses/${expenseId}`);
      return response;
    } catch (error) {
      console.error('deleteExpense failed:', error);
      throw error;
    }
  },

  bulkDeleteExpenses: async (expenseIds) => {
    try {
      const response = await api.post('/api/v1/expenses/bulk-delete', {
        expense_ids: expenseIds,
      });
      return response;
    } catch (error) {
      console.error('bulkDeleteExpenses failed:', error);
      throw error;
    }
  },

  bulkUpdateExpenses: async (data) => {
    try {
      const response = await api.post('/api/v1/expenses/bulk-update', data);
      return response;
    } catch (error) {
      console.error('bulkUpdateExpenses failed:', error);
      throw error;
    }
  },

  uploadReceipt: async (expenseId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/api/v1/expenses/${expenseId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      console.error('uploadReceipt failed:', error);
      throw error;
    }
  },

  deleteReceipt: async (expenseId, receiptId) => {
    try {
      const response = await api.delete(`/api/v1/expenses/${expenseId}/receipt/${receiptId}`);
      return response;
    } catch (error) {
      console.error('deleteReceipt failed:', error);
      throw error;
    }
  },

  processReceipt: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/v1/expenses/process-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      console.error('processReceipt failed:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/api/v1/expenses/categories');
      return response;
    } catch (error) {
      console.error('getCategories failed:', error);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/api/v1/expenses/categories', categoryData);
      return response;
    } catch (error) {
      console.error('createCategory failed:', error);
      throw error;
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/api/v1/expenses/categories/${categoryId}`, categoryData);
      return response;
    } catch (error) {
      console.error('updateCategory failed:', error);
      throw error;
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/api/v1/expenses/categories/${categoryId}`);
      return response;
    } catch (error) {
      console.error('deleteCategory failed:', error);
      throw error;
    }
  },

  getExpenseStats: async (dateRange = {}) => {
    try {
      const response = await api.get('/api/v1/expenses/stats', {
        params: dateRange
      });
      return response;
    } catch (error) {
      console.error('getExpenseStats failed:', error);
      throw error;
    }
  },

  getSpendingTrends: async (period = 'monthly', dateRange = {}) => {
    try {
      const params = { period, ...dateRange };
      const response = await api.get('/api/v1/expenses/trends', { params });
      return response;
    } catch (error) {
      console.error('getSpendingTrends failed:', error);
      throw error;
    }
  },

  getCategoryBreakdown: async (dateRange = {}) => {
    try {
      const response = await api.get('/api/v1/expenses/category-breakdown', { 
        params: dateRange 
      });
      return response;
    } catch (error) {
      console.error('getCategoryBreakdown failed:', error);
      throw error;
    }
  },

  exportExpenses: async (filters = {}, format = 'csv') => {
    try {
      const params = { ...filters, format };
      const response = await api.get('/api/v1/expenses/export', { 
        params,
        responseType: 'blob' 
      });
      return response;
    } catch (error) {
      console.error('exportExpenses failed:', error);
      throw error;
    }
  },

  importExpenses: async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const response = await api.post('/api/v1/expenses/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      console.error('importExpenses failed:', error);
      throw error;
    }
  },

  getImportTemplate: async (format = 'csv') => {
    try {
      const response = await api.get('/api/v1/expenses/import-template', { 
        params: { format },
        responseType: 'blob' 
      });
      return response;
    } catch (error) {
      console.error('getImportTemplate failed:', error);
      throw error;
    }
  },

  duplicateExpense: async (expenseId) => {
    try {
      const response = await api.post(`/api/v1/expenses/${expenseId}/duplicate`);
      return response;
    } catch (error) {
      console.error('duplicateExpense failed:', error);
      throw error;
    }
  },

  splitExpense: async (expenseId, splitData) => {
    try {
      const response = await api.post(`/api/v1/expenses/${expenseId}/split`, splitData);
      return response;
    } catch (error) {
      console.error('splitExpense failed:', error);
      throw error;
    }
  },

  mergeExpenses: async (expenseIds, mergeData) => {
    try {
      const response = await api.post('/api/v1/expenses/merge', {
        expense_ids: expenseIds,
        ...mergeData,
      });
      return response;
    } catch (error) {
      console.error('mergeExpenses failed:', error);
      throw error;
    }
  },

  getRecurringExpenses: async () => {
    try {
      const response = await api.get('/api/v1/expenses/recurring');
      return response;
    } catch (error) {
      console.error('getRecurringExpenses failed:', error);
      throw error;
    }
  },

  createRecurringExpense: async (recurringData) => {
    try {
      const response = await api.post('/api/v1/expenses/recurring', recurringData);
      return response;
    } catch (error) {
      console.error('createRecurringExpense failed:', error);
      throw error;
    }
  },

  updateRecurringExpense: async (recurringId, recurringData) => {
    try {
      const response = await api.put(`/api/v1/expenses/recurring/${recurringId}`, recurringData);
      return response;
    } catch (error) {
      console.error('updateRecurringExpense failed:', error);
      throw error;
    }
  },

  deleteRecurringExpense: async (recurringId) => {
    try {
      const response = await api.delete(`/api/v1/expenses/recurring/${recurringId}`);
      return response;
    } catch (error) {
      console.error('deleteRecurringExpense failed:', error);
      throw error;
    }
  },

  getTaxDeductions: async (taxYear) => {
    try {
      const response = await api.get(`/api/v1/expenses/tax-deductions/${taxYear}`);
      return response;
    } catch (error) {
      console.error('getTaxDeductions failed:', error);
      throw error;
    }
  },

  markTaxDeductible: async (expenseId, deductionData) => {
    try {
      const response = await api.post(`/api/v1/expenses/${expenseId}/tax-deduction`, deductionData);
      return response;
    } catch (error) {
      console.error('markTaxDeductible failed:', error);
      throw error;
    }
  },

  removeTaxDeduction: async (expenseId) => {
    try {
      const response = await api.delete(`/api/v1/expenses/${expenseId}/tax-deduction`);
      return response;
    } catch (error) {
      console.error('removeTaxDeduction failed:', error);
      throw error;
    }
  },

  getMileageExpenses: async (filters = {}) => {
    try {
      const response = await api.get('/api/v1/expenses/mileage', { params: filters });
      return response;
    } catch (error) {
      console.error('getMileageExpenses failed:', error);
      throw error;
    }
  },

  createMileageExpense: async (mileageData) => {
    try {
      const response = await api.post('/api/v1/expenses/mileage', mileageData);
      return response;
    } catch (error) {
      console.error('createMileageExpense failed:', error);
      throw error;
    }
  },

  calculateMileage: async (distance, purpose, date) => {
    try {
      const response = await api.post('/api/v1/expenses/calculate-mileage', {
        distance, purpose, date,
      });
      return response;
    } catch (error) {
      console.error('calculateMileage failed:', error);
      throw error;
    }
  },

  searchExpenses: async (query, filters = {}) => {
    try {
      const params = { query, ...filters };
      const response = await api.get('/api/v1/expenses/search', { params });
      return response;
    } catch (error) {
      console.error('searchExpenses failed:', error);
      throw error;
    }
  },

  getTags: async () => {
    try {
      const response = await api.get('/api/v1/expenses/tags');
      return response;
    } catch (error) {
      console.error('getTags failed:', error);
      throw error;
    }
  },

  createTag: async (tagData) => {
    try {
      const response = await api.post('/api/v1/expenses/tags', tagData);
      return response;
    } catch (error) {
      console.error('createTag failed:', error);
      throw error;
    }
  },

  updateTag: async (tagId, tagData) => {
    try {
      const response = await api.put(`/api/v1/expenses/tags/${tagId}`, tagData);
      return response;
    } catch (error) {
      console.error('updateTag failed:', error);
      throw error;
    }
  },

  deleteTag: async (tagId) => {
    try {
      const response = await api.delete(`/api/v1/expenses/tags/${tagId}`);
      return response;
    } catch (error) {
      console.error('deleteTag failed:', error);
      throw error;
    }
  },
};