import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Receipt, Tag, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { EXPENSE_CATEGORIES, TAX_CATEGORIES } from '../../utils/constants';
import { useExpenses } from '../../hooks/useExpenses';

const ExpenseItem = ({ expense, selected, onSelect, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const { deleteExpense } = useExpenses();

  const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
  const taxCategory = TAX_CATEGORIES.find(tax => tax.value === expense.tax_category);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expense.id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const getTaxCategoryColor = (taxCategory) => {
    switch (taxCategory?.value) {
      case 'deductible':
        return 'bg-green-100 text-green-800';
      case 'non_deductible':
        return 'bg-red-100 text-red-800';
      case 'partially_deductible':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="custom-checkbox mr-4"
        />
        
        <div className="grid grid-cols-12 gap-4 w-full">
          {/* Description */}
          <div className="col-span-3">
            <div className="flex items-start space-x-3">
              {expense.receipt_url && (
                <Receipt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-gray-900">{expense.description}</p>
                {expense.notes && (
                  <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                )}
                {expense.tags && expense.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {expense.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {expense.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{expense.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              {category && (
                <>
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm text-gray-900">{category.label}</span>
                </>
              )}
            </div>
            {taxCategory && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTaxCategoryColor(taxCategory)}`}>
                {taxCategory.label}
              </span>
            )}
          </div>

          {/* Amount */}
          <div className="col-span-2">
            <p className="font-semibold text-gray-900">
              {formatCurrency(expense.amount)}
            </p>
            {expense.billable && (
              <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                Billable
              </span>
            )}
          </div>

          {/* Date */}
          <div className="col-span-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(expense.date)}</span>
            </div>
          </div>

          {/* Vendor */}
          <div className="col-span-2">
            <p className="text-sm text-gray-900">
              {expense.vendor || 'Not specified'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {expense.payment_method?.replace('_', ' ')}
            </p>
          </div>

          {/* Actions */}
          <div className="col-span-1">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onEdit();
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      
                      {expense.receipt_url && (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowActions(false)}
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          View Receipt
                        </a>
                      )}
                      
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;