import { formatDate, formatDateTime, formatTime } from './dateUtils';

// Currency formatters
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

export const formatCurrencyCompact = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  
  const num = Number(amount);
  
  if (Math.abs(num) >= 1000000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }
  
  return formatCurrency(amount, currency, locale);
};

export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  const cleaned = currencyString.toString().replace(/[^0-9.-]/g, '');
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

// Number formatters
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    locale: 'en-US',
  };
  
  const { locale, ...formatOptions } = { ...defaultOptions, ...options };
  
  return new Intl.NumberFormat(locale, formatOptions).format(Number(number));
};

export const formatNumberCompact = (number, locale = 'en-US') => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(number));
};

export const formatPercentage = (value, decimals = 1, locale = 'en-US') => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
};

export const formatDecimalPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${(Number(value) * 100).toFixed(decimals)}%`;
};

// Phone number formatter
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber;
};

// Address formatter
export const formatAddress = (address) => {
  if (!address) return '';
  
  const {
    street,
    street2,
    city,
    state,
    zipCode,
    country
  } = address;
  
  const parts = [];
  
  if (street) parts.push(street);
  if (street2) parts.push(street2);
  
  const cityStateZip = [city, state, zipCode].filter(Boolean).join(', ');
  if (cityStateZip) parts.push(cityStateZip);
  
  if (country && country !== 'US') parts.push(country);
  
  return parts.join('\n');
};

export const formatAddressOneLine = (address) => {
  if (!address) return '';
  
  const {
    street,
    street2,
    city,
    state,
    zipCode,
    country
  } = address;
  
  const parts = [];
  
  if (street) parts.push(street);
  if (street2) parts.push(street2);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  if (country && country !== 'US') parts.push(country);
  
  return parts.join(', ');
};

// Name formatter
export const formatName = (firstName, lastName, middleName = '') => {
  const parts = [firstName, middleName, lastName].filter(Boolean);
  return parts.join(' ');
};

export const formatNameWithInitials = (firstName, lastName, middleName = '') => {
  if (!firstName && !lastName) return '';
  
  let formatted = firstName || '';
  if (middleName) {
    formatted += ` ${middleName.charAt(0)}.`;
  }
  if (lastName) {
    formatted += ` ${lastName}`;
  }
  
  return formatted.trim();
};

export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Text formatters
export const formatTitle = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatSentence = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatCamelCase = (text) => {
  if (!text) return '';
  
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

export const formatPascalCase = (text) => {
  if (!text) return '';
  
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

export const formatSnakeCase = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '');
};

export const formatKebabCase = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

// Social media formatters
export const formatTwitterHandle = (handle) => {
  if (!handle) return '';
  
  const cleaned = handle.replace(/^@/, '');
  return `@${cleaned}`;
};

export const formatHashtag = (tag) => {
  if (!tag) return '';
  
  const cleaned = tag.replace(/^#/, '').replace(/\s+/g, '');
  return `#${cleaned}`;
};

// Credit card formatter
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
  
  return formatted;
};

export const maskCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;
  
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(Math.max(0, cleaned.length - 4));
  
  return formatCreditCard(masked + lastFour);
};

// SSN formatter
export const formatSSN = (ssn) => {
  if (!ssn) return '';
  
  const cleaned = ssn.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return ssn;
};

export const maskSSN = (ssn) => {
  if (!ssn) return '';
  
  const cleaned = ssn.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `***-**-${cleaned.slice(5)}`;
  }
  
  return ssn;
};

// Tax ID formatter
export const formatEIN = (ein) => {
  if (!ein) return '';
  
  const cleaned = ein.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  }
  
  return ein;
};

// URL formatter
export const formatURL = (url) => {
  if (!url) return '';
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

export const formatDomain = (url) => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// List formatters
export const formatList = (items, conjunction = 'and') => {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
};

export const formatBulletList = (items, bullet = '•') => {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  return items.map(item => `${bullet} ${item}`).join('\n');
};

export const formatNumberedList = (items, startNumber = 1) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  return items.map((item, index) => `${startNumber + index}. ${item}`).join('\n');
};

// Duration formatter
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};

export const formatDurationLong = (seconds) => {
  if (!seconds || seconds < 0) return '0 seconds';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

// Distance formatter
export const formatDistance = (miles, unit = 'miles') => {
  if (!miles || miles < 0) return `0 ${unit}`;
  
  const formatted = formatNumber(miles, { maximumFractionDigits: 1 });
  return `${formatted} ${unit}`;
};

export const formatMileage = (miles) => {
  if (!miles || miles < 0) return '0 mi';
  
  if (miles < 1) {
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }
  
  const formatted = formatNumber(miles, { maximumFractionDigits: 1 });
  return `${formatted} mi`;
};

// Export formatters
export const formatCSVCell = (value) => {
  if (value === null || value === undefined) return '';
  
  const stringValue = value.toString();
  
  // If the value contains quotes, commas, or newlines, wrap it in quotes and escape quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

export const formatCSVRow = (row) => {
  if (!Array.isArray(row)) return '';
  return row.map(formatCSVCell).join(',');
};

// Template formatters
export const formatTemplate = (template, variables = {}) => {
  if (!template) return '';
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

export const formatTemplateAdvanced = (template, variables = {}) => {
  if (!template) return '';
  
  return template.replace(/\{\{(\w+)(?:\|([^}]+))?\}\}/g, (match, key, defaultValue) => {
    const value = variables[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    return defaultValue || '';
  });
};

// JSON formatters
export const formatJSONString = (obj, indent = 2) => {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return '';
  }
};

export const formatJSONCompact = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '';
  }
};

// Color formatters
export const formatHexColor = (color) => {
  if (!color) return '';
  
  const cleaned = color.replace(/[^0-9a-fA-F]/g, '');
  
  if (cleaned.length === 3) {
    return `#${cleaned}`;
  } else if (cleaned.length === 6) {
    return `#${cleaned}`;
  }
  
  return color;
};

export const formatRGBColor = (r, g, b, a = null) => {
  const red = Math.max(0, Math.min(255, Math.round(r || 0)));
  const green = Math.max(0, Math.min(255, Math.round(g || 0)));
  const blue = Math.max(0, Math.min(255, Math.round(b || 0)));
  
  if (a !== null) {
    const alpha = Math.max(0, Math.min(1, Number(a)));
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  
  return `rgb(${red}, ${green}, ${blue})`;
};

// Error message formatter
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail
        .map(err => `${err.loc?.join(' ')}: ${err.msg}`)
        .join(', ');
    }
    return error.response.data.detail;
  }
  
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  
  return 'An unexpected error occurred';
};

// Validation message formatter
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return [];
  
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message: Array.isArray(message) ? message[0] : message,
  }));
};

// Search highlight formatter
export const formatSearchHighlight = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Breadcrumb formatter
export const formatBreadcrumbs = (path, separator = ' > ') => {
  if (!Array.isArray(path)) return '';
  return path.filter(Boolean).join(separator);
};

// Status formatter
export const formatStatus = (status) => {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Priority formatter
export const formatPriority = (priority) => {
  const priorityMap = {
    1: 'Low',
    2: 'Medium', 
    3: 'High',
    4: 'Critical',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  
  return priorityMap[priority] || priority;
};

// Grade formatter
export const formatGrade = (score, maxScore = 100) => {
  if (score === null || score === undefined || maxScore === 0) return 'N/A';
  
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

// Rating formatter
export const formatRating = (rating, maxRating = 5) => {
  if (rating === null || rating === undefined) return 'Not rated';
  
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxRating - Math.floor(rating));
  return `${stars} (${formatNumber(rating, { maximumFractionDigits: 1 })}/${maxRating})`;
};

// Progress formatter
export const formatProgress = (current, total) => {
  if (!total || total === 0) return '0%';
  
  const percentage = (current / total) * 100;
  return `${Math.round(percentage)}% (${current}/${total})`;
};

// Version formatter
export const formatVersion = (version) => {
  if (!version) return '';
  
  // Ensure version follows semantic versioning pattern
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9-]+))?(?:\+([a-zA-Z0-9-]+))?$/;
  const match = version.match(versionRegex);
  
  if (match) {
    const [, major, minor, patch, prerelease, build] = match;
    let formatted = `${major}.${minor}.${patch}`;
    
    if (prerelease) formatted += `-${prerelease}`;
    if (build) formatted += `+${build}`;
    
    return formatted;
  }
  
  return version;
};

// Coordinate formatter
export const formatCoordinates = (lat, lng, precision = 6) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return '';
  }
  
  const latitude = Number(lat).toFixed(precision);
  const longitude = Number(lng).toFixed(precision);
  
  return `${latitude}, ${longitude}`;
};

// Unit formatter
export const formatUnit = (value, unit, plural = null) => {
  if (value === null || value === undefined) return '';
  
  const num = Number(value);
  const unitText = (plural && Math.abs(num) !== 1) ? plural : unit;
  
  return `${formatNumber(num)} ${unitText}`;
};

// Truncate with ellipsis
export const formatTruncate = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

// Word count formatter
export const formatWordCount = (text) => {
  if (!text) return '0 words';
  
  const words = text.trim().split(/\s+/).length;
  return `${words} word${words !== 1 ? 's' : ''}`;
};

// Character count formatter
export const formatCharCount = (text, includeSpaces = true) => {
  if (!text) return '0 characters';
  
  const count = includeSpaces ? text.length : text.replace(/\s/g, '').length;
  return `${count} character${count !== 1 ? 's' : ''}`;
};