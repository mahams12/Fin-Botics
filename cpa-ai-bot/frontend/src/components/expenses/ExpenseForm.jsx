import React, { useState } from 'react';
import { X, Upload, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { useExpenses } from '../../hooks/useExpenses';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, TAX_CATEGORIES } from '../../utils/constants';
import CategorySelector from './CategorySelector';
import { formatDate } from '../../utils/dateUtils';

const ExpenseForm = ({ expense = null, onClose, onSuccess }) => {
  const { createExpense, updateExpense, isCreating, isUpdating } = useExpenses();
  const isEditing = Boolean(expense);
  
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    description: expense?.description || '',
    category: expense?.category || '',
    date: expense?.date ? formatDate(expense.date, 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
    vendor: expense?.vendor || '',
    paymentMethod: expense?.payment_method || 'credit_card',
    taxCategory: expense?.tax_category || 'unknown',
    notes: expense?.notes || '',
    tags: expense?.tags?.join(', ') || '',
    billable: expense?.billable || false,
    receipt: null,
  });

  const [errors, setErrors] = useState({});
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt: file }));
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setReceiptPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to extract error message from various error formats
  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      // Handle different error object structures
      if (error.message) return error.message;
      if (error.msg) return error.msg;
      if (error.detail) return error.detail;
      if (error.error) return error.error;
      // If it's a validation error array, extract the first message
      if (Array.isArray(error) && error.length > 0) {
        const firstError = error[0];
        if (typeof firstError === 'string') return firstError;
        if (firstError.msg) return firstError.msg;
        if (firstError.message) return firstError.message;
      }
      // Last resort: stringify the error
      return JSON.stringify(error);
    }
    return 'An unknown error occurred';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitError(''); // Clear any previous submit errors
      
      const expenseData = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date + 'T00:00:00', // Convert date to datetime format
        vendor: formData.vendor.trim(),
        payment_method: formData.paymentMethod,
        tax_category: formData.taxCategory,
        notes: formData.notes.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        billable: formData.billable,
      };

      // Debug: Log the data being sent
      console.log('Sending expense data:', expenseData);
      console.log('Form data:', formData);

      if (isEditing) {
        await updateExpense(expense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      
      // Debug: Log the full error response
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);
        
        // Log the full detail array
        if (error.response.data.detail) {
          console.log('Full error detail:', JSON.stringify(error.response.data.detail, null, 2));
        }
      }
      
      // Handle API validation errors
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        
        // If it's a validation error with field-specific errors
        if (responseData.detail && Array.isArray(responseData.detail)) {
          const fieldErrors = {};
          responseData.detail.forEach(err => {
            if (err.loc && err.loc.length > 1) {
              const fieldName = err.loc[1]; // Usually the field name is at index 1
              fieldErrors[fieldName] = getErrorMessage(err);
            }
          });
          
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
          }
        }
        
        // General error message
        setSubmitError(getErrorMessage(responseData));
      } else {
        setSubmitError(getErrorMessage(error));
      }
    }
  };

  const loading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-hard max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-sm text-red-700">
                  {submitError}
                </div>
              </div>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && <p className="form-error">{getErrorMessage(errors.amount)}</p>}
            </div>

            <div>
              <label className="form-label">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`form-input ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="form-error">{getErrorMessage(errors.date)}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              <FileText className="w-4 h-4 inline mr-1" />
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-input ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Office supplies, lunch meeting, etc."
            />
            {errors.description && <p className="form-error">{getErrorMessage(errors.description)}</p>}
          </div>

          {/* Category and Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <Tag className="w-4 h-4 inline mr-1" />
                Category *
              </label>
              <CategorySelector
                value={formData.category}
                onChange={(category) => {
                  setFormData(prev => ({ ...prev, category }));
                  // Clear category error when selection changes
                  if (errors.category) {
                    setErrors(prev => ({ ...prev, category: '' }));
                  }
                }}
                error={errors.category}
              />
              {errors.category && <p className="form-error">{getErrorMessage(errors.category)}</p>}
            </div>

            <div>
              <label className="form-label">Vendor</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Amazon, Starbucks, etc."
              />
            </div>
          </div>

          {/* Payment Method and Tax Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Tax Category</label>
              <select
                name="taxCategory"
                value={formData.taxCategory}
                onChange={handleInputChange}
                className="form-select"
              >
                {TAX_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="form-label">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="form-input"
              placeholder="business, travel, client (comma-separated)"
            />
            <p className="form-help">Separate multiple tags with commas</p>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="form-textarea"
              placeholder="Additional details about this expense..."
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="form-label">Receipt</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
            
            {/* Receipt Preview */}
            {receiptPreview && (
              <div className="mt-4">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="max-w-full h-32 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
            
            {formData.receipt && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {formData.receipt.name}
              </div>
            )}
          </div>

          {/* Billable Checkbox */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="billable"
                checked={formData.billable}
                onChange={handleInputChange}
                className="custom-checkbox"
              />
              <span className="text-sm font-medium text-gray-700">
                This is a billable expense
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-2"></div>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                isEditing ? 'Update Expense' : 'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;