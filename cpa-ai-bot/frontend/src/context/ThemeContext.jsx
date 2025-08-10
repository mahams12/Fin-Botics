import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  language: localStorage.getItem('language') || 'en',
  notifications: {
    email: localStorage.getItem('emailNotifications') !== 'false',
    push: localStorage.getItem('pushNotifications') !== 'false',
    sound: localStorage.getItem('soundNotifications') !== 'false',
  },
  accessibility: {
    highContrast: localStorage.getItem('highContrast') === 'true',
    reducedMotion: localStorage.getItem('reducedMotion') === 'true',
    fontSize: localStorage.getItem('fontSize') || 'medium',
  },
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LANGUAGE: 'SET_LANGUAGE',
  UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
  UPDATE_ACCESSIBILITY: 'UPDATE_ACCESSIBILITY',
  RESET_PREFERENCES: 'RESET_PREFERENCES',
};

// Reducer function
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      localStorage.setItem('theme', action.payload);
      return {
        ...state,
        theme: action.payload,
      };
    case THEME_ACTIONS.TOGGLE_THEME:
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return {
        ...state,
        theme: newTheme,
      };
    case THEME_ACTIONS.SET_SIDEBAR_COLLAPSED:
      localStorage.setItem('sidebarCollapsed', action.payload.toString());
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };
    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      const newSidebarState = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', newSidebarState.toString());
      return {
        ...state,
        sidebarCollapsed: newSidebarState,
      };
    case THEME_ACTIONS.SET_LANGUAGE:
      localStorage.setItem('language', action.payload);
      return {
        ...state,
        language: action.payload,
      };
    case THEME_ACTIONS.UPDATE_NOTIFICATIONS:
      // Save each notification setting to localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(`${key}Notifications`, value.toString());
      });
      return {
        ...state,
        notifications: {
          ...state.notifications,
          ...action.payload,
        },
      };
    case THEME_ACTIONS.UPDATE_ACCESSIBILITY:
      // Save each accessibility setting to localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          ...action.payload,
        },
      };
    case THEME_ACTIONS.RESET_PREFERENCES:
      // Clear all localStorage items and reset to defaults
      const itemsToRemove = [
        'theme', 'sidebarCollapsed', 'language',
        'emailNotifications', 'pushNotifications', 'soundNotifications',
        'highContrast', 'reducedMotion', 'fontSize'
      ];
      itemsToRemove.forEach(item => localStorage.removeItem(item));
      
      return {
        theme: 'light',
        sidebarCollapsed: false,
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sound: true,
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          fontSize: 'medium',
        },
      };
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Apply theme to document on theme change
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (state.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (state.accessibility.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Font size
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (state.accessibility.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      case 'extra-large':
        root.classList.add('text-xl');
        break;
      default:
        root.classList.add('text-base');
    }
  }, [state.accessibility]);

  // Detect system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        dispatch({ 
          type: THEME_ACTIONS.SET_THEME, 
          payload: e.matches ? 'dark' : 'light' 
        });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => {
      if (!localStorage.getItem('reducedMotion')) {
        dispatch({
          type: THEME_ACTIONS.UPDATE_ACCESSIBILITY,
          payload: { reducedMotion: e.matches }
        });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Action functions
  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
  };

  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
  };

  const setSidebarCollapsed = (collapsed) => {
    dispatch({ type: THEME_ACTIONS.SET_SIDEBAR_COLLAPSED, payload: collapsed });
  };

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setLanguage = (language) => {
    dispatch({ type: THEME_ACTIONS.SET_LANGUAGE, payload: language });
  };

  const updateNotifications = (notifications) => {
    dispatch({ type: THEME_ACTIONS.UPDATE_NOTIFICATIONS, payload: notifications });
  };

  const updateAccessibility = (accessibility) => {
    dispatch({ type: THEME_ACTIONS.UPDATE_ACCESSIBILITY, payload: accessibility });
  };

  const resetPreferences = () => {
    dispatch({ type: THEME_ACTIONS.RESET_PREFERENCES });
  };

  // Utility functions
  const isDark = state.theme === 'dark';
  const isLight = state.theme === 'light';

  // Context value
  const value = {
    ...state,
    setTheme,
    toggleTheme,
    setSidebarCollapsed,
    toggleSidebar,
    setLanguage,
    updateNotifications,
    updateAccessibility,
    resetPreferences,
    isDark,
    isLight,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;