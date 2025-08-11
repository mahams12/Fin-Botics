import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  session_id: localStorage.getItem('session_id'), // Changed from token
  google_token: localStorage.getItem('google_token'), // Store Google token separately
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      // Store session_id instead of token
      localStorage.setItem('session_id', action.payload.session_id);
      
      // Store Google token if available (for chat functionality)
      if (action.payload.google_token) {
        localStorage.setItem('google_token', action.payload.google_token);
      }
      
      return {
        ...state,
        user: action.payload.user,
        session_id: action.payload.session_id, // Changed from token
        google_token: action.payload.google_token || state.google_token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      // Remove all tokens
      localStorage.removeItem('token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('google_token');
      return {
        ...state,
        user: null,
        session_id: null, // Changed from token
        google_token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const sessionId = localStorage.getItem('session_id');
      const token = localStorage.getItem('token'); // Fallback for compatibility
      
      if (sessionId || token) {
        try {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          const userData = await authService.getCurrentUser();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('session_id');
          localStorage.removeItem('google_token');
          dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Session expired' });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.login(email, password);
      console.log('Login response:', response); // Debug log
      
      // Ensure session_id is stored immediately and separately
      if (response.session_id) {
        localStorage.setItem('session_id', response.session_id);
        console.log('✅ Stored session_id:', response.session_id);
      } else {
        console.error('❌ No session_id in response:', response);
      }
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response });
      
      toast.success('Successfully logged in!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Google login function - SIMPLIFIED AND FIXED
  const loginWithGoogle = async (googleResponse) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      console.log('🔍 Google response received:', googleResponse);
      
      // Get the credential directly from Google's response
      const googleCredential = googleResponse.credential;
      
      if (!googleCredential) {
        throw new Error('No credential received from Google');
      }
      
      console.log('🔍 Google credential found:', googleCredential.substring(0, 50) + '...');
      
      // Send to backend - let authService handle the formatting
      const response = await authService.googleLogin(googleResponse);
      
      console.log('✅ Backend response:', response);
      
      // Add the Google token to the response for storage
      const responseWithGoogleToken = {
        ...response,
        google_token: googleCredential
      };
      
      console.log('💾 Storing Google token for chat');
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: responseWithGoogleToken });
      
      toast.success('Successfully logged in with Google!');
      return responseWithGoogleToken;
    } catch (error) {
      console.error('❌ Google login error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Google login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.register(userData);
      console.log('Register response:', response); // Debug log
      
      // Ensure session_id is stored immediately
      if (response.session_id) {
        localStorage.setItem('session_id', response.session_id);
        console.log('✅ Stored session_id after registration:', response.session_id);
      } else {
        console.error('❌ No session_id in registration response:', response);
      }
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response });
      
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const updatedUser = await authService.updateProfile(profileData);
      dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: updatedUser });
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Profile update failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;