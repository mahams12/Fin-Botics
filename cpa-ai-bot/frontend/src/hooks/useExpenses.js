import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { expenseService } from '../services/expenseService';
import toast from 'react-hot-toast';

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
        const errorMessage = error.response?.data?.detail || 'Failed to create expense';
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
        const errorMessage = error.response?.data?.detail || 'Failed to update expense';
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
        const errorMessage = error.response?.data?.detail || 'Failed to delete expense';
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
        const errorMessage = error.response?.data?.detail || 'Failed to delete expenses';
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
        const errorMessage = error.response?.data?.detail || 'Failed to update expenses';
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
        const errorMessage = error.response?.data?.detail || 'Failed to export expenses';
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
  const createExpense = (expenseData) => {
    return createExpenseMutation.mutate(expenseData);
  };

  const updateExpense = (id, expenseData) => {
    return updateExpenseMutation.mutate({ id, data: expenseData });
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