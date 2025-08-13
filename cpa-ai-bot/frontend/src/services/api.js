import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance - FIXED: Remove /api/v1 from baseURL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', // ✅ FIXED: No /api/v1 suffix
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session ID
api.interceptors.request.use(
  (config) => {
    // Check for both token (legacy) and session_id (new)
    const sessionId = localStorage.getItem('session_id');
    const token = localStorage.getItem('token');
    
    if (sessionId) {
      // Add session ID as multiple headers/params for compatibility
      config.headers['X-Session-ID'] = sessionId;
      config.headers['Authorization'] = `Bearer ${sessionId}`;
      // Also add as query parameter for endpoints that expect it
      config.params = config.params || {};
      config.params.session_id = sessionId;
    } else if (token) {
      // Fallback to Bearer token if session_id not found
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // DEBUG: Log the final URL being requested
    const fullUrl = config.baseURL + config.url + (config.params ? '?' + new URLSearchParams(config.params).toString() : '');
    console.log('Full API Request URL:', fullUrl);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear session and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('session_id');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          // Not found - Don't show toast for 404s as they're handled by fallback
          console.warn('API endpoint not found:', error.config?.url);
          break;
        case 422:
          // Validation error
          const validationErrors = response.data?.detail;
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach(err => {
              toast.error(`${err.loc?.join(' ')}: ${err.msg}`);
            });
          } else {
            toast.error('Validation error occurred.');
          }
          break;
        case 429:
          // Rate limit
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          // Server error
          toast.error('Internal server error. Please try again later.');
          break;
        default:
          // Generic error
          const errorMessage = response.data?.detail || response.data?.message || 'An error occurred';
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      console.warn('Network error:', error.message);
    } else {
      // Other error
      console.warn('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // GET request
  get: (url, config = {}) => {
    return api.get(url, config).then(response => response.data);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config).then(response => response.data);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config).then(response => response.data);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config).then(response => response.data);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return api.delete(url, config).then(response => response.data);
  },

  // Upload file
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data);
  },

  // Download file - ENHANCED for better blob handling
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    }).then(response => {
      // Return the raw response for blob handling
      return response;
    });
  },
};

// Utility functions
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

// FIXED buildUrl function - now handles URL construction properly
export const buildUrl = (endpoint, params = {}) => {
  // Ensure endpoint starts with / but doesn't double up
  let url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Build query parameters
  const queryString = buildQueryString(params);
  
  // Combine URL and query string
  const finalUrl = queryString ? `${url}?${queryString}` : url;
  
  console.log('buildUrl result:', finalUrl); // Debug log
  return finalUrl;
};

// Export the axios instance for advanced usage
export default api;