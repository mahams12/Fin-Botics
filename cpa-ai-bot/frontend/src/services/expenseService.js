import { apiMethods, buildUrl } from './api';

export const expenseService = {
  // Get expenses with filters
  getExpenses: async (filters = {}) => {
    const url = buildUrl('/expenses', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get single expense
  getExpense: async (expenseId) => {
    const response = await apiMethods.get(`/expenses/${expenseId}`);
    return response;
  },

  // Create new expense
  createExpense: async (expenseData) => {
    const response = await apiMethods.post('/expenses', expenseData);
    return response;
  },

  // Update expense
  updateExpense: async (expenseId, expenseData) => {
    const response = await apiMethods.put(`/expenses/${expenseId}`, expenseData);
    return response;
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    const response = await apiMethods.delete(`/expenses/${expenseId}`);
    return response;
  },

  // Bulk delete expenses
  bulkDeleteExpenses: async (expenseIds) => {
    const response = await apiMethods.post('/expenses/bulk-delete', {
      expense_ids: expenseIds,
    });
    return response;
  },

  // Bulk update expenses
  bulkUpdateExpenses: async (data) => {
    const response = await apiMethods.post('/expenses/bulk-update', data);
    return response;
  },

  // Upload receipt
  uploadReceipt: async (expenseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiMethods.upload(`/expenses/${expenseId}/receipt`, formData);
    return response;
  },

  // Delete receipt
  deleteReceipt: async (expenseId, receiptId) => {
    const response = await apiMethods.delete(`/expenses/${expenseId}/receipt/${receiptId}`);
    return response;
  },

  // OCR receipt processing
  processReceipt: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiMethods.upload('/expenses/process-receipt', formData);
    return response;
  },

  // Get expense categories
  getCategories: async () => {
    const response = await apiMethods.get('/expenses/categories');
    return response;
  },

  // Create custom category
  createCategory: async (categoryData) => {
    const response = await apiMethods.post('/expenses/categories', categoryData);
    return response;
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await apiMethods.put(`/expenses/categories/${categoryId}`, categoryData);
    return response;
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    const response = await apiMethods.delete(`/expenses/categories/${categoryId}`);
    return response;
  },

  // Get expense statistics
  getExpenseStats: async (dateRange = {}) => {
    const url = buildUrl('/expenses/stats', dateRange);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get spending trends
  getSpendingTrends: async (period = 'monthly', dateRange = {}) => {
    const params = { period, ...dateRange };
    const url = buildUrl('/expenses/trends', params);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get category breakdown
  getCategoryBreakdown: async (dateRange = {}) => {
    const url = buildUrl('/expenses/category-breakdown', dateRange);
    const response = await apiMethods.get(url);
    return response;
  },

  // Export expenses
  exportExpenses: async (filters = {}, format = 'csv') => {
    const params = { ...filters, format };
    const response = await apiMethods.download('/expenses/export', {
      params
    });
    return response;
  },

  // Import expenses
  importExpenses: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const response = await apiMethods.upload('/expenses/import', formData);
    return response;
  },

  // Get import template
  getImportTemplate: async (format = 'csv') => {
    const response = await apiMethods.download('/expenses/import-template', {
      params: { format }
    });
    return response;
  },

  // Duplicate expense
  duplicateExpense: async (expenseId) => {
    const response = await apiMethods.post(`/expenses/${expenseId}/duplicate`);
    return response;
  },

  // Split expense
  splitExpense: async (expenseId, splitData) => {
    const response = await apiMethods.post(`/expenses/${expenseId}/split`, splitData);
    return response;
  },

  // Merge expenses
  mergeExpenses: async (expenseIds, mergeData) => {
    const response = await apiMethods.post('/expenses/merge', {
      expense_ids: expenseIds,
      ...mergeData,
    });
    return response;
  },

  // Get recurring expenses
  getRecurringExpenses: async () => {
    const response = await apiMethods.get('/expenses/recurring');
    return response;
  },

  // Create recurring expense
  createRecurringExpense: async (recurringData) => {
    const response = await apiMethods.post('/expenses/recurring', recurringData);
    return response;
  },

  // Update recurring expense
  updateRecurringExpense: async (recurringId, recurringData) => {
    const response = await apiMethods.put(`/expenses/recurring/${recurringId}`, recurringData);
    return response;
  },

  // Delete recurring expense
  deleteRecurringExpense: async (recurringId) => {
    const response = await apiMethods.delete(`/expenses/recurring/${recurringId}`);
    return response;
  },

  // Get tax deductions
  getTaxDeductions: async (taxYear) => {
    const response = await apiMethods.get(`/expenses/tax-deductions/${taxYear}`);
    return response;
  },

  // Mark expense as tax deductible
  markTaxDeductible: async (expenseId, deductionData) => {
    const response = await apiMethods.post(`/expenses/${expenseId}/tax-deduction`, deductionData);
    return response;
  },

  // Remove tax deduction
  removeTaxDeduction: async (expenseId) => {
    const response = await apiMethods.delete(`/expenses/${expenseId}/tax-deduction`);
    return response;
  },

  // Get mileage expenses
  getMileageExpenses: async (filters = {}) => {
    const url = buildUrl('/expenses/mileage', filters);
    const response = await apiMethods.get(url);
    return response;
  },

  // Create mileage expense
  createMileageExpense: async (mileageData) => {
    const response = await apiMethods.post('/expenses/mileage', mileageData);
    return response;
  },

  // Calculate mileage expense
  calculateMileage: async (distance, purpose, date) => {
    const response = await apiMethods.post('/expenses/calculate-mileage', {
      distance,
      purpose,
      date,
    });
    return response;
  },

  // Search expenses
  searchExpenses: async (query, filters = {}) => {
    const params = { query, ...filters };
    const url = buildUrl('/expenses/search', params);
    const response = await apiMethods.get(url);
    return response;
  },

  // Get expense tags
  getTags: async () => {
    const response = await apiMethods.get('/expenses/tags');
    return response;
  },

  // Create tag
  createTag: async (tagData) => {
    const response = await apiMethods.post('/expenses/tags', tagData);
    return response;
  },

  // Update tag
  updateTag: async (tagId, tagData) => {
    const response = await apiMethods.put(`/expenses/tags/${tagId}`, tagData);
    return response;
  },

  // Delete tag
  deleteTag: async (tagId) => {
    const response = await apiMethods.delete(`/expenses/tags/${tagId}`);
    return response;
  },
};