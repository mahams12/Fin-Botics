import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// Generic API hook for simple CRUD operations
export const useApi = (endpoint, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const {
    queryKey = [endpoint],
    queryFn,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false,
    ...queryOptions
  } = options;

  // Fetch data
  const {
    data,
    isLoading: queryLoading,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery(
    queryKey,
    queryFn,
    {
      enabled,
      staleTime,
      cacheTime,
      refetchOnWindowFocus,
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || `Failed to fetch ${endpoint}`;
        setError(errorMessage);
        if (options.showErrorToast !== false) {
          toast.error(errorMessage);
        }
      },
      ...queryOptions,
    }
  );

  // Generic mutation hook
  const createMutation = useMutation(
    (data) => queryFn({ method: 'POST', data }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || `Failed to create ${endpoint}`;
        setError(errorMessage);
        toast.error(errorMessage);
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => queryFn({ method: 'PUT', id, data }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        if (options.updateSuccessMessage) {
          toast.success(options.updateSuccessMessage);
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || `Failed to update ${endpoint}`;
        setError(errorMessage);
        toast.error(errorMessage);
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => queryFn({ method: 'DELETE', id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        if (options.deleteSuccessMessage) {
          toast.success(options.deleteSuccessMessage);
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || `Failed to delete ${endpoint}`;
        setError(errorMessage);
        toast.error(errorMessage);
      },
    }
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    data,
    
    // Loading states
    isLoading: queryLoading || loading,
    isFetching,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    
    // Error states
    error: error || queryError,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Actions
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    clearError,
    
    // Mutation objects (for advanced usage)
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

// Hook for handling async operations with loading states
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction();
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Operation failed';
      setError(errorMessage);
      
      if (options.showErrorToast !== false) {
        toast.error(errorMessage);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

// Hook for debounced search - CORRECTED VERSION
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for pagination
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
    offset: (page - 1) * pageSize,
  };
};

// Hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for handling form state
export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    const validationErrors = {};
    let isValid = true;
    
    Object.keys(validationSchema).forEach(field => {
      const validator = validationSchema[field];
      const value = values[field];
      const error = validator(value, values);
      
      if (error) {
        validationErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(validationErrors);
    return isValid;
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const touchedFields = {};
    Object.keys(values).forEach(key => {
      touchedFields[key] = true;
    });
    setTouched(touchedFields);
    
    if (validate()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    setTouched: setFieldTouched,
    validate,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Hook for infinite scrolling
export const useInfiniteScroll = (callback, hasMore = true) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || !hasMore) {
        return;
      }
      setIsFetching(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!isFetching) return;
    
    const fetchData = async () => {
      await callback();
      setIsFetching(false);
    };
    
    fetchData();
  }, [isFetching, callback]);

  return [isFetching, setIsFetching];
};

// Hook for window size
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook for click outside detection
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

// Hook for keyboard shortcuts
export const useKeyboardShortcut = (keys, callback, options = {}) => {
  const { disabled = false, target = document } = options;

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event) => {
      const keysPressed = [];
      
      if (event.ctrlKey) keysPressed.push('ctrl');
      if (event.metaKey) keysPressed.push('meta');
      if (event.shiftKey) keysPressed.push('shift');
      if (event.altKey) keysPressed.push('alt');
      
      keysPressed.push(event.key.toLowerCase());
      
      const keyString = keysPressed.join('+');
      const targetKeys = Array.isArray(keys) ? keys : [keys];
      
      if (targetKeys.some(k => k.toLowerCase() === keyString)) {
        event.preventDefault();
        callback(event);
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, disabled, target]);
};

// Hook for media queries
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Hook for copy to clipboard
export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Copied to clipboard!');
      
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, [timeout]);

  return [isCopied, copyToClipboard];
};

// Hook for toggle state
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, { toggle, setTrue, setFalse, setValue }];
};

// Hook for previous value
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Hook for array state management
export const useArray = (initialArray = []) => {
  const [array, setArray] = useState(initialArray);

  const push = useCallback((element) => {
    setArray(prev => [...prev, element]);
  }, []);

  const filter = useCallback((callback) => {
    setArray(prev => prev.filter(callback));
  }, []);

  const update = useCallback((index, newElement) => {
    setArray(prev => prev.map((item, i) => i === index ? newElement : item));
  }, []);

  const remove = useCallback((index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  return {
    array,
    set: setArray,
    push,
    filter,
    update,
    remove,
    clear,
  };
};