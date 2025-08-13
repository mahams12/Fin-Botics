import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { expenseService } from '../services/expenseService';
import toast from 'react-hot-toast';

// Helper function to extract error message from various error formats
const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    if (error.response?.data) {
      const responseData = error.response.data;
      
      if (responseData.detail && Array.isArray(responseData.detail)) {
        const firstError = responseData.detail[0];
        if (firstError && firstError.msg) {
          return firstError.msg;
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
      
      if (typeof responseData.detail === 'string') {
        return responseData.detail;
      }
      
      if (responseData.message) return responseData.message;
      if (responseData.error) return responseData.error;
    }
    
    if (error.message) return error.message;
    if (error.msg) return error.msg;
    if (error.detail) return error.detail;
    
    return JSON.stringify(error);
  }
  
  return 'An unknown error occurred';
};

// LocalStorage functions - MAIN DATA SOURCE
const getExpensesFromStorage = () => {
  try {
    const saved = localStorage.getItem('expenses_main');
    const expenses = saved ? JSON.parse(saved) : [];
    console.log('📦 Retrieved from localStorage:', expenses.length, 'expenses', expenses.map(e => e.id));
    return expenses;
  } catch (error) {
    console.error('Error reading expenses from localStorage:', error);
    return [];
  }
};

const saveExpensesToStorage = (expenses) => {
  try {
    localStorage.setItem('expenses_main', JSON.stringify(expenses));
    console.log('💾 Saved to localStorage:', expenses.length, 'expenses', expenses.map(e => e.id));
  } catch (error) {
    console.error('Error saving expenses to localStorage:', error);
  }
};

// Helper function to get date range based on filter
const getDateRange = (dateRangeFilter) => {
  const now = new Date();
  let startDate, endDate;

  switch (dateRangeFilter) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'this_week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startDate = new Date(startOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'last_week':
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7); // Last Sunday
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // Last Saturday
      startDate = new Date(lastWeekStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(lastWeekEnd);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    
    case 'last_year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
    
    default:
      return { startDate: null, endDate: null };
  }

  return { startDate, endDate };
};

const filterExpenses = (expenses, filters) => {
  let filtered = [...expenses];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(expense => 
      expense.description?.toLowerCase().includes(searchLower) ||
      expense.vendor?.toLowerCase().includes(searchLower) ||
      expense.notes?.toLowerCase().includes(searchLower) ||
      expense.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(expense => expense.category === filters.category);
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const { startDate, endDate } = getDateRange(filters.dateRange);
    
    if (startDate && endDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }
  }

  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (filters.sortBy === 'amount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }

  return filtered;
};

export const useExpenses = (filters = {}) => {
  const queryClient = useQueryClient();
  // FORCE localStorage mode initially
  const [useLocalStorage, setUseLocalStorage] = useState(true);
  const [rawExpenses, setRawExpenses] = useState([]); // Store raw unfiltered data
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render trigger
  const [apiTested, setApiTested] = useState(false);

  // Convert frontend filters to API parameters
  const apiParams = useMemo(() => {
    const params = {};
    
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      const { startDate, endDate } = getDateRange(filters.dateRange);
      
      if (startDate && endDate) {
        params.start_date = startDate.toISOString().split('T')[0];
        params.end_date = endDate.toISOString().split('T')[0];
      }
    }
    
    params.page = 1;
    params.per_page = 100;
    
    return params;
  }, [filters.category, filters.dateRange]);

  // Test API connection once on mount
  const {
    data: apiResponse,
    isLoading: apiLoading,
    error: apiError,
    refetch: apiRefetch
  } = useQuery(
    ['expenses', apiParams],
    () => expenseService.getExpenses(apiParams),
    {
      enabled: false, // Disable API for now
      retry: 1,
      staleTime: 0,
      cacheTime: 0,
      onSuccess: (data) => {
        console.log('✅ API is working! Received:', data?.expenses?.length || 0, 'expenses');
        setApiTested(true);
        setUseLocalStorage(false); // Switch to API mode
        
        // Optionally sync API data to localStorage as backup
        if (data?.expenses?.length > 0) {
          saveExpensesToStorage(data.expenses);
          setRawExpenses(data.expenses);
        }
      },
      onError: (error) => {
        console.warn('❌ API is not working:', error.message);
        setApiTested(true);
        setUseLocalStorage(true); // Stay in localStorage mode
        toast.info('Working offline - your data is saved locally');
      },
    }
  );

  // Load localStorage data whenever refreshTrigger changes
  useEffect(() => {
    console.log('🔄 Loading data from localStorage (trigger:', refreshTrigger, ')');
    const allExpenses = getExpensesFromStorage();
    setRawExpenses(allExpenses);
  }, [refreshTrigger]);

  // Apply filters to raw expenses
  const expenses = useMemo(() => {
    console.log('🔍 Filtering', rawExpenses.length, 'raw expenses with filters:', filters);
    
    if (useLocalStorage) {
      const filtered = filterExpenses(rawExpenses, filters);
      console.log('📦 Final filtered expenses:', filtered.length);
      return filtered;
    } else {
      const apiExpenses = apiResponse?.expenses || [];
      let processed = [...apiExpenses];
      
      // Apply client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        processed = processed.filter(expense => 
          expense.description?.toLowerCase().includes(searchLower) ||
          expense.vendor?.toLowerCase().includes(searchLower) ||
          expense.notes?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply client-side sorting
      if (filters.sortBy) {
        processed.sort((a, b) => {
          let aValue = a[filters.sortBy];
          let bValue = b[filters.sortBy];

          if (filters.sortBy === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          } else if (filters.sortBy === 'amount') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          } else if (filters.sortBy === 'vendor') {
            aValue = (aValue || '').toLowerCase();
            bValue = (bValue || '').toLowerCase();
          } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue?.toLowerCase() || '';
          }

          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }
      
      console.log('🌐 Using API data:', processed.length, 'expenses');
      return processed;
    }
  }, [useLocalStorage, rawExpenses, apiResponse, filters.search, filters.sortBy, filters.sortOrder, filters.category, filters.dateRange]);

  const isLoading = useLocalStorage ? false : apiLoading;
  const error = useLocalStorage ? null : apiError;

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setRefreshTrigger(prev => prev + 1); // Force reload from localStorage
  }, []);

  // Create expense mutation
  const createExpenseMutation = useMutation(
    async (expenseData) => {
      console.log('🆕 Creating expense in localStorage:', expenseData);
      
      const allExpenses = getExpensesFromStorage();
      const newExpense = {
        ...expenseData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedExpenses = [newExpense, ...allExpenses];
      saveExpensesToStorage(updatedExpenses);
      
      return newExpense;
    },
    {
      onSuccess: (newExpense) => {
        console.log('✅ Expense created successfully:', newExpense.id);
        refetch(); // Trigger refresh
        toast.success('Expense created successfully!');
      },
      onError: (error) => {
        console.error('❌ Create expense failed:', error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      },
    }
  );

  // Update expense mutation
  const updateExpenseMutation = useMutation(
    async ({ id, data }) => {
      console.log('📝 Updating expense in localStorage:', id, data);
      
      const allExpenses = getExpensesFromStorage();
      console.log('Before update - found expense with ID:', id, '?', allExpenses.some(e => e.id === id));
      
      const updatedExpenses = allExpenses.map(expense =>
        expense.id === id ? { ...expense, ...data, updated_at: new Date().toISOString() } : expense
      );
      
      saveExpensesToStorage(updatedExpenses);
      
      return updatedExpenses.find(e => e.id === id);
    },
    {
      onSuccess: () => {
        console.log('✅ Expense updated successfully');
        refetch();
        toast.success('Expense updated successfully!');
      },
      onError: (error) => {
        console.error('❌ Update expense failed:', error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      },
    }
  );

  // Delete expense mutation - FIXED
  const deleteExpenseMutation = useMutation(
    async (id) => {
      console.log('🗑️ Attempting to delete expense:', id);
      
      const allExpenses = getExpensesFromStorage();
      console.log('Current expenses before delete:', allExpenses.map(e => ({ id: e.id, desc: e.description })));
      
      // Find the expense to confirm it exists
      const expenseToDelete = allExpenses.find(e => e.id === id);
      if (!expenseToDelete) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      console.log('Found expense to delete:', expenseToDelete.description);
      
      // Filter out the expense
      const updatedExpenses = allExpenses.filter(expense => {
        const keep = expense.id !== id;
        if (!keep) {
          console.log('🗑️ Removing expense:', expense.id, expense.description);
        }
        return keep;
      });
      
      console.log('Expenses after delete:', updatedExpenses.map(e => ({ id: e.id, desc: e.description })));
      console.log('Successfully removed expense? Count before:', allExpenses.length, 'Count after:', updatedExpenses.length);
      
      saveExpensesToStorage(updatedExpenses);
      
      return { id, deletedExpense: expenseToDelete };
    },
    {
      onSuccess: (result) => {
        console.log('✅ Expense deleted successfully:', result.id);
        refetch(); // Force refresh
        toast.success('Expense deleted successfully!');
      },
      onError: (error) => {
        console.error('❌ Delete expense failed:', error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      },
    }
  );

  // Bulk delete mutation - FIXED
  const bulkDeleteMutation = useMutation(
    async (ids) => {
      console.log('🗑️ Bulk deleting expenses from localStorage:', ids);
      
      const allExpenses = getExpensesFromStorage();
      console.log('Before bulk delete:', allExpenses.length, 'expenses');
      
      const updatedExpenses = allExpenses.filter(expense => {
        const keep = !ids.includes(expense.id);
        if (!keep) {
          console.log('🗑️ Bulk removing expense:', expense.id, expense.description);
        }
        return keep;
      });
      
      console.log('After bulk delete:', updatedExpenses.length, 'expenses');
      saveExpensesToStorage(updatedExpenses);
      
      return { deletedCount: ids.length };
    },
    {
      onSuccess: (data) => {
        console.log('✅ Bulk delete successful:', data.deletedCount);
        refetch();
        toast.success(`${data.deletedCount} expenses deleted successfully!`);
      },
      onError: (error) => {
        console.error('❌ Bulk delete failed:', error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      },
    }
  );

  // Export expenses
  const exportExpensesMutation = useMutation(
    async (exportFilters = {}) => {
      const allExpenses = expenses;
      const filtered = filterExpenses(allExpenses, exportFilters);
      
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Vendor', 'Payment Method'];
      const csvContent = [
        headers.join(','),
        ...filtered.map(expense => [
          expense.date,
          `"${expense.description}"`,
          expense.category,
          expense.amount,
          `"${expense.vendor || ''}"`,
          expense.payment_method || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      return blob;
    },
    {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Expenses exported successfully!');
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        console.error('Export error:', error);
        toast.error(errorMessage);
      },
    }
  );

  // Helper functions
  const createExpense = useCallback(async (expenseData) => {
    try {
      return await createExpenseMutation.mutateAsync(expenseData);
    } catch (error) {
      throw error;
    }
  }, [createExpenseMutation]);

  const updateExpense = useCallback(async (id, expenseData) => {
    try {
      return await updateExpenseMutation.mutateAsync({ id, data: expenseData });
    } catch (error) {
      throw error;
    }
  }, [updateExpenseMutation]);

  const deleteExpense = useCallback((id) => {
    console.log('🗑️ Delete expense called with ID:', id);
    return deleteExpenseMutation.mutate(id);
  }, [deleteExpenseMutation]);

  const bulkDeleteExpenses = useCallback((ids) => {
    console.log('🗑️ Bulk delete expenses called with IDs:', ids);
    return bulkDeleteMutation.mutate(ids);
  }, [bulkDeleteMutation]);

  const exportExpenses = useCallback((exportFilters = {}) => {
    return exportExpensesMutation.mutate(exportFilters);
  }, [exportExpensesMutation]);

  // Debug info
  const debugInfo = useMemo(() => ({
    useLocalStorage,
    expensesCount: expenses.length,
    rawExpensesCount: rawExpenses.length,
    refreshTrigger,
    dataSource: useLocalStorage ? 'localStorage' : 'API',
    apiTested,
    filters,
    apiError: apiError?.message,
  }), [useLocalStorage, expenses.length, rawExpenses.length, refreshTrigger, apiTested, JSON.stringify(filters), apiError?.message]);

  useEffect(() => {
    console.log('🐛 useExpenses Debug:', debugInfo);
  }, [JSON.stringify(debugInfo)]);

  return {
    // Data
    expenses: expenses || [],
    filters,
    
    // Loading states
    isLoading,
    isCreating: createExpenseMutation.isLoading,
    isUpdating: updateExpenseMutation.isLoading,
    isDeleting: deleteExpenseMutation.isLoading,
    isBulkDeleting: bulkDeleteMutation.isLoading,
    isExporting: exportExpensesMutation.isLoading,
    
    // Error states
    error,
    createError: createExpenseMutation.error,
    updateError: updateExpenseMutation.error,
    deleteError: deleteExpenseMutation.error,
    
    // Actions
    createExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    exportExpenses,
    refetch,
    
    // Debug info
    useLocalStorage,
    dataSource: useLocalStorage ? 'localStorage' : 'API',
  };
};

// Hook for expense statistics
export const useExpenseStats = (dateRange = {}) => {
  const { expenses } = useExpenses();
  
  const stats = useMemo(() => ({
    total: expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0),
    count: expenses.length,
    categories: expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + (parseFloat(expense.amount) || 0);
      return acc;
    }, {}),
  }), [expenses]);

  return {
    stats,
    isLoading: false,
    error: null,
  };
};

// Hook for expense categories
export const useExpenseCategories = () => {
  const { EXPENSE_CATEGORIES } = require('../utils/constants');
  
  return {
    categories: EXPENSE_CATEGORIES,
    isLoading: false,
    error: null,
  };
};

// Hook for single expense
export const useExpense = (expenseId) => {
  const { expenses } = useExpenses();
  const expense = useMemo(() => 
    expenses.find(e => e.id === expenseId), 
    [expenses, expenseId]
  );

  return {
    expense,
    isLoading: false,
    error: expense ? null : 'Expense not found',
  };
};