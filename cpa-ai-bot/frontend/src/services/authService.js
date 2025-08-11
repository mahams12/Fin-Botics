import { apiMethods } from './api';

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    const response = await apiMethods.post('/auth/login', {
      email,
      password,
    });
    return response;
  },

  // Register new user
  register: async (userData) => {
    const response = await apiMethods.post('/auth/register', userData);
    return response;
  },

  // Google OAuth login - FIXED
  googleLogin: async (tokenResponse) => {
    console.log('🔧 AuthService received:', tokenResponse);
    
    // Extract the Google token from various possible fields
    const googleToken = tokenResponse.credential || 
                       tokenResponse.token || 
                       tokenResponse.access_token || 
                       tokenResponse.id_token;
    
    console.log('🔧 Sending to backend:', { token: googleToken });
    
    if (!googleToken) {
      throw new Error('No Google token found in response');
    }
    
    const response = await apiMethods.post('/auth/google', {
      token: googleToken,
    });
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiMethods.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('session_id');
    localStorage.removeItem('google_token');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiMethods.get('/auth/me');
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiMethods.put('/auth/profile', profileData);
    return response;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiMethods.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiMethods.post('/auth/forgot-password', {
      email,
    });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiMethods.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await apiMethods.post('/auth/verify-email', {
      token,
    });
    return response;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await apiMethods.post('/auth/resend-verification', {
      email,
    });
    return response;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiMethods.post('/auth/refresh');
    return response;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await apiMethods.put('/auth/preferences', preferences);
    return response;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiMethods.upload('/auth/profile-picture', formData);
    return response;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await apiMethods.delete('/auth/account', {
      data: { password }
    });
    return response;
  },

  // Check if email exists
  checkEmail: async (email) => {
    const response = await apiMethods.post('/auth/check-email', {
      email,
    });
    return response;
  },

  // Get user sessions
  getUserSessions: async () => {
    const response = await apiMethods.get('/auth/sessions');
    return response;
  },

  // Revoke session
  revokeSession: async (sessionId) => {
    const response = await apiMethods.delete(`/auth/sessions/${sessionId}`);
    return response;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await apiMethods.post('/auth/2fa/enable');
    return response;
  },

  // Disable 2FA
  disable2FA: async (code) => {
    const response = await apiMethods.post('/auth/2fa/disable', {
      code,
    });
    return response;
  },

  // Verify 2FA code
  verify2FA: async (code) => {
    const response = await apiMethods.post('/auth/2fa/verify', {
      code,
    });
    return response;
  },
};