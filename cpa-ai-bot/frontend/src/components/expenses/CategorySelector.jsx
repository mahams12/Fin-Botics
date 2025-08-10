import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

const CategorySelector = ({ value, onChange, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = EXPENSE_CATEGORIES.filter(category =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.value === value);

  const handleSelect = (category) => {
    onChange(category.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          form-input w-full flex items-center justify-between
          ${error ? 'border-red-500' : ''}
          ${!selectedCategory ? 'text-gray-400' : ''}
        `}
      >
        <div className="flex items-center space-x-2">
          {selectedCategory ? (
            <>
              <span className="text-lg">{selectedCategory.icon}</span>
              <span>{selectedCategory.label}</span>
            </>
          ) : (
            <span>Select a category</span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleSelect(category)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors
                    ${value === category.value ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}
                  `}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.label}</span>
                  {value === category.value && (
                    <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                No categories found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CategorySelector;