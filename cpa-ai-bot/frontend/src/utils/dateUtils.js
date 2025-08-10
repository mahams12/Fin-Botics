import { format, parse, isValid, addDays, addWeeks, addMonths, addYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isAfter, isBefore, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

// Date formatting
export const formatDate = (date, formatString = 'MM/dd/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

export const formatDateTime = (date, formatString = 'MM/dd/yyyy hh:mm a') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

export const formatTime = (date, formatString = 'hh:mm a') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

// Date parsing
export const parseDate = (dateString, formatString = 'MM/dd/yyyy') => {
  if (!dateString) return null;
  try {
    const parsed = parse(dateString, formatString, new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const parseDateTime = (dateTimeString, formatString = 'MM/dd/yyyy hh:mm a') => {
  if (!dateTimeString) return null;
  try {
    const parsed = parse(dateTimeString, formatString, new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Date validation
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj);
};

export const isDateInRange = (date, startDate, endDate) => {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  
  const dateObj = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return dateObj >= start && dateObj <= end;
};

export const isDateAfter = (date, compareDate) => {
  if (!isValidDate(date) || !isValidDate(compareDate)) return false;
  return isAfter(new Date(date), new Date(compareDate));
};

export const isDateBefore = (date, compareDate) => {
  if (!isValidDate(date) || !isValidDate(compareDate)) return false;
  return isBefore(new Date(date), new Date(compareDate));
};

// Date calculations
export const addToDate = (date, amount, unit = 'days') => {
  if (!isValidDate(date)) return null;
  
  const dateObj = new Date(date);
  
  switch (unit) {
    case 'days':
      return addDays(dateObj, amount);
    case 'weeks':
      return addWeeks(dateObj, amount);
    case 'months':
      return addMonths(dateObj, amount);
    case 'years':
      return addYears(dateObj, amount);
    default:
      return dateObj;
  }
};

export const subtractFromDate = (date, amount, unit = 'days') => {
  return addToDate(date, -amount, unit);
};

export const getDaysDifference = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return 0;
  return differenceInDays(new Date(date1), new Date(date2));
};

export const getWeeksDifference = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return 0;
  return differenceInWeeks(new Date(date1), new Date(date2));
};

export const getMonthsDifference = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return 0;
  return differenceInMonths(new Date(date1), new Date(date2));
};

export const getYearsDifference = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return 0;
  return differenceInYears(new Date(date1), new Date(date2));
};

// Date ranges
export const getDateRange = (rangeType, referenceDate = new Date()) => {
  const now = new Date(referenceDate);
  
  switch (rangeType) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case 'yesterday':
      const yesterday = addDays(now, -1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    case 'this_week':
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
      };
    case 'last_week':
      const lastWeekStart = startOfWeek(addWeeks(now, -1));
      return {
        start: lastWeekStart,
        end: endOfWeek(lastWeekStart),
      };
    case 'this_month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'last_month':
      const lastMonth = addMonths(now, -1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    case 'this_quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
      return {
        start: quarterStart,
        end: quarterEnd,
      };
    case 'last_quarter':
      const lastQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
      const lastQuarterEnd = new Date(lastQuarterStart.getFullYear(), lastQuarterStart.getMonth() + 3, 0);
      return {
        start: lastQuarterStart,
        end: lastQuarterEnd,
      };
    case 'this_year':
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    case 'last_year':
      const lastYear = addYears(now, -1);
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear),
      };
    default:
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
  }
};

export const getQuarterInfo = (date = new Date()) => {
  const dateObj = new Date(date);
  const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
  const year = dateObj.getFullYear();
  
  return {
    quarter,
    year,
    label: `Q${quarter} ${year}`,
    startMonth: (quarter - 1) * 3,
    endMonth: quarter * 3 - 1,
  };
};

export const getTaxYear = (date = new Date()) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  
  // Tax year typically runs from January to December
  // But you might want to adjust this based on your requirements
  return year;
};

// Fiscal year helpers (assuming April to March)
export const getFiscalYear = (date = new Date()) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  
  // If month is April (3) or later, fiscal year is current year
  // If month is before April, fiscal year is previous year
  return month >= 3 ? year : year - 1;
};

export const getFiscalYearRange = (fiscalYear) => {
  return {
    start: new Date(fiscalYear, 3, 1), // April 1st
    end: new Date(fiscalYear + 1, 2, 31), // March 31st
  };
};

// Business day helpers
export const isWeekend = (date) => {
  const dateObj = new Date(date);
  const day = dateObj.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isBusinessDay = (date) => {
  return !isWeekend(date);
};

export const getNextBusinessDay = (date) => {
  let nextDay = addDays(new Date(date), 1);
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};

export const getPreviousBusinessDay = (date) => {
  let prevDay = addDays(new Date(date), -1);
  while (isWeekend(prevDay)) {
    prevDay = addDays(prevDay, -1);
  }
  return prevDay;
};

export const getBusinessDaysInRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return 0;
  
  let count = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    if (isBusinessDay(current)) {
      count++;
    }
    current = addDays(current, 1);
  }
  
  return count;
};

// Time zone helpers
export const convertToTimezone = (date, timezone) => {
  if (!isValidDate(date)) return null;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date(date));
  } catch {
    return null;
  }
};

export const getTimezoneOffset = (timezone) => {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return (utc.getTime() - target.getTime()) / (1000 * 60); // Return offset in minutes
  } catch {
    return 0;
  }
};

// Calendar helpers
export const getCalendarMonth = (date = new Date()) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const firstDayOfWeek = firstDay.getDay();
  const weeksInMonth = Math.ceil((daysInMonth + firstDayOfWeek) / 7);
  
  return {
    year,
    month,
    daysInMonth,
    firstDay,
    lastDay,
    firstDayOfWeek,
    weeksInMonth,
  };
};

export const getWeekDays = (startOfWeek = 0) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return [...days.slice(startOfWeek), ...days.slice(0, startOfWeek)];
};

export const getMonthNames = (format = 'long') => {
  const formatter = new Intl.DateTimeFormat('en-US', { month: format });
  return Array.from({ length: 12 }, (_, i) => 
    formatter.format(new Date(2000, i, 1))
  );
};

// Age calculation
export const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!isValidDate(birthDate)) return 0;
  
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Date array generators
export const generateDateRange = (startDate, endDate, step = 1, unit = 'days') => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return [];
  
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(new Date(current));
    current = addToDate(current, step, unit);
  }
  
  return dates;
};

export const generateMonthsArray = (year) => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i,
    name: getMonthNames()[i],
    short: getMonthNames('short')[i],
    date: new Date(year, i, 1),
  }));
};

export const generateYearsArray = (startYear, endYear = new Date().getFullYear()) => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};