import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal } from 'lucide-react';
import ExpenseItem from './ExpenseItem';
import ExpenseForm from './ExpenseForm';
import { useExpenses } from '../../hooks/useExpenses';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { EXPENSE_CATEGORIES, DATE_RANGES } from '../../utils/constants';

const ExpenseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('this_month');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const filters = {
    search: searchQuery,
    category: selectedCategory,
    dateRange,
    sortBy,
    sortOrder,
  };

  const { 
    expenses, 
    isLoading, 
    error, 
    exportExpenses, 
    bulkDeleteExpenses,
    refetch 
  } = useExpenses(filters);

  // Listen for new expenses added from Header
  useEffect(() => {
    const handleExpenseAdded = () => {
      refetch(); // Refresh the expense list
    };

    window.addEventListener('expenseAdded', handleExpenseAdded);
    
    return () => {
      window.removeEventListener('expenseAdded', handleExpenseAdded);
    };
  }, [refetch]);

  // Ensure expenses is always an array to prevent map errors
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
  };

  const handleSelectExpense = (expenseId, selected) => {
    if (selected) {
      setSelectedExpenses(prev => [...prev, expenseId]);
    } else {
      setSelectedExpenses(prev => prev.filter(id => id !== expenseId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedExpenses(safeExpenses.map(expense => expense.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExpenses.length > 0 && 
        window.confirm(`Delete ${selectedExpenses.length} selected expenses?`)) {
      try {
        await bulkDeleteExpenses(selectedExpenses);
        setSelectedExpenses([]);
      } catch (error) {
        console.error('Failed to delete expenses:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportExpenses(filters);
    } catch (error) {
      console.error('Failed to export expenses:', error);
    }
  };

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        showRetry 
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your business expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={handleSearch}
              className="form-input pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-select dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {DATE_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="form-select dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="vendor-asc">Vendor A-Z</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedExpenses.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-primary-700 dark:text-primary-300 font-medium">
              {selectedExpenses.length} expense(s) selected
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="btn btn-outline btn-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn btn-danger btn-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8">
            <Loading message="Loading expenses..." />
          </div>
        ) : safeExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MoreHorizontal className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first expense.'
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Header */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedExpenses.length === safeExpenses.length && safeExpenses.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="custom-checkbox mr-4"
                />
                <div className="grid grid-cols-12 gap-4 w-full">
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Vendor</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Expense Items */}
            {safeExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                selected={selectedExpenses.includes(expense.id)}
                onSelect={(selected) => handleSelectExpense(expense.id, selected)}
                onEdit={() => handleEdit(expense)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ExpenseList;