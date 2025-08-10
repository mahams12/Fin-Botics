// String helpers
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  export const truncate = (str, maxLength = 100) => {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  };
  
  export const slugify = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  export const extractInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Number helpers
  export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  export const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return '0';
    
    const defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    };
    
    return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(number);
  };
  
  export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
  };
  
  export const roundToDecimals = (number, decimals = 2) => {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };
  
  // Array helpers
  export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  };
  
  export const sortBy = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = key.includes('.') ? getNestedValue(a, key) : a[key];
      const bVal = key.includes('.') ? getNestedValue(b, key) : b[key];
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  };
  
  export const filterBy = (array, filters) => {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = key.includes('.') ? getNestedValue(item, key) : item[key];
        return itemValue?.toString().toLowerCase().includes(value.toString().toLowerCase());
      });
    });
  };
  
  export const uniqueBy = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const value = key.includes('.') ? getNestedValue(item, key) : item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  };
  
  export const sumBy = (array, key) => {
    return array.reduce((sum, item) => {
      const value = key.includes('.') ? getNestedValue(item, key) : item[key];
      return sum + (Number(value) || 0);
    }, 0);
  };
  
  // Object helpers
  export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  export const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
    return obj;
  };
  
  export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  };
  
  export const pick = (obj, keys) => {
    const result = {};
    keys.forEach(key => {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };
  
  export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  };
  
  // Validation helpers
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };
  
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  export const validateRequired = (value, fieldName = 'Field') => {
    if (isEmpty(value)) {
      return `${fieldName} is required`;
    }
    return null;
  };
  
  export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!isValidEmail(email)) return 'Invalid email format';
    return null;
  };
  
  export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
    return null;
  };
  
  export const validateAmount = (amount) => {
    if (!amount) return 'Amount is required';
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 'Amount must be a valid number';
    if (numAmount <= 0) return 'Amount must be greater than 0';
    if (numAmount > 999999999.99) return 'Amount is too large';
    return null;
  };
  
  // File helpers
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };
  
  export const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  };
  
  export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  // Color helpers
  export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  export const getContrastColor = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };
  
  // Local storage helpers
  export const setLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting localStorage:', error);
      return false;
    }
  };
  
  export const getLocalStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return defaultValue;
    }
  };
  
  export const removeLocalStorage = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage:', error);
      return false;
    }
  };
  
  // URL helpers
  export const buildQueryParams = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  };
  
  export const parseQueryParams = (search) => {
    const params = new URLSearchParams(search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  };
  
  // Debounce and throttle
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // Random helpers
  export const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };
  
  export const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };
  
  export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Error helpers
  export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  };
  
  export const logError = (error, context = '') => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  };