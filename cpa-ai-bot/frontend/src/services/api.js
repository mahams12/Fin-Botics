import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          // Not found
          toast.error('The requested resource was not found.');
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
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
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

  // Download file
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    }).then(response => response.data);
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

export const buildUrl = (endpoint, params = {}) => {
  const queryString = buildQueryString(params);
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Export the axios instance for advanced usage
export default api;