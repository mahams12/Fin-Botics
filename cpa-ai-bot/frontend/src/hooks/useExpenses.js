import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { expenseService } from '../services/expenseService';
import toast from 'react-hot-toast';

// Helper function to extract error message from various error formats
const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle API response errors
    if (error.response?.data) {
      const responseData = error.response.data;
      
      // Handle validation errors from FastAPI/Pydantic
      if (responseData.detail && Array.isArray(responseData.detail)) {
        // Extract the first validation error message
        const firstError = responseData.detail[0];
        if (firstError && firstError.msg) {
          return firstError.msg;
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
      
      // Handle single detail message
      if (typeof responseData.detail === 'string') {
        return responseData.detail;
      }
      
      // Handle other error formats
      if (responseData.message) return responseData.message;
      if (responseData.error) return responseData.error;
    }
    
    // Handle direct error object properties
    if (error.message) return error.message;
    if (error.msg) return error.msg;
    if (error.detail) return error.detail;
    
    // Last resort: stringify the error
    return JSON.stringify(error);
  }
  
  return 'An unknown error occurred';
};

export const useExpenses = (filters = {}) => {
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch expenses with filters
  const {
    data: expenses = [],
    isLoading,
    error,
    refetch
  } = useQuery(
    ['expenses', localFilters],
    () => expenseService.getExpenses(localFilters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Create expense mutation
  const createExpenseMutation = useMutation(
    expenseService.createExpense,
    {
      onSuccess: (newExpense) => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['expense-stats']);
        toast.success('Expense created successfully!');
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        console.error('Create expense error:', error);
        toast.error(errorMessage);
      },
    }
  );

  // Update expense mutation
  const updateExpenseMutation = useMutation(
    ({ id, data }) => expenseService.updateExpense(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['expense-stats']);
        toast.success('Expense updated successfully!');
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        console.error('Update expense error:', error);
        toast.error(errorMessage);
      },
    }
  );

  // Delete expense mutation
  const deleteExpenseMutation = useMutation(
    expenseService.deleteExpense,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['expense-stats']);
        toast.success('Expense deleted successfully!');
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        console.error('Delete expense error:', error);
        toast.error(errorMessage);
      },
    }
  );

  // Bulk operations
  const bulkDeleteMutation = useMutation(
    expenseService.bulkDeleteExpenses,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['expense-stats']);
        toast.success(`${data.deletedCount} expenses deleted successfully!`);
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        console.error('Bulk delete error:', error);
        toast.error(errorMessage);
      },
    }
  );

  const bulkUpdateMutation = useMutation(
    expenseService.bulkUpdateExpenses,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['expense-stats']);
        toast.success(`${data.updatedCount} expenses updated successfully!`);
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        console.error('Bulk update error:', error);
        toast.error(errorMessage);
      },
    }
  );

  // Export expenses
  const exportExpensesMutation = useMutation(
    expenseService.exportExpenses,
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

  // Update filters
  const updateFilters = (newFilters) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setLocalFilters({});
  };

  // Helper functions
  const createExpense = async (expenseData) => {
    try {
      return await createExpenseMutation.mutateAsync(expenseData);
    } catch (error) {
      // Re-throw the error so it can be handled in the component
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      return await updateExpenseMutation.mutateAsync({ id, data: expenseData });
    } catch (error) {
      throw error;
    }
  };

  const deleteExpense = (id) => {
    return deleteExpenseMutation.mutate(id);
  };

  const bulkDeleteExpenses = (ids) => {
    return bulkDeleteMutation.mutate(ids);
  };

  const bulkUpdateExpenses = (ids, updateData) => {
    return bulkUpdateMutation.mutate({ ids, data: updateData });
  };

  const exportExpenses = (exportFilters = {}) => {
    return exportExpensesMutation.mutate(exportFilters);
  };

  return {
    // Data
    expenses,
    filters: localFilters,
    
    // Loading states
    isLoading,
    isCreating: createExpenseMutation.isLoading,
    isUpdating: updateExpenseMutation.isLoading,
    isDeleting: deleteExpenseMutation.isLoading,
    isBulkDeleting: bulkDeleteMutation.isLoading,
    isBulkUpdating: bulkUpdateMutation.isLoading,
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
    bulkUpdateExpenses,
    exportExpenses,
    refetch,
    updateFilters,
    clearFilters,
  };
};

// Hook for expense statistics
export const useExpenseStats = (dateRange = {}) => {
  const {
    data: stats,
    isLoading,
    error
  } = useQuery(
    ['expense-stats', dateRange],
    () => expenseService.getExpenseStats(dateRange),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    stats,
    isLoading,
    error,
  };
};

// Hook for expense categories
export const useExpenseCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery(
    ['expense-categories'],
    expenseService.getCategories,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      refetchOnWindowFocus: false,
    }
  );

  return {
    categories,
    isLoading,
    error,
  };
};

// Hook for single expense
export const useExpense = (expenseId) => {
  const {
    data: expense,
    isLoading,
    error
  } = useQuery(
    ['expense', expenseId],
    () => expenseService.getExpense(expenseId),
    {
      enabled: !!expenseId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    expense,
    isLoading,
    error,
  };
};