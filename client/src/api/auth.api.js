import apiClient from './client.js';

/**
 * Authentication API module.
 * Wraps centralized Axios client calls for signup, login, and session validation.
 */
export const authApi = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string }} userData
   */
  signup: (userData) => {
    return apiClient.post('/auth/signup', userData);
  },

  /**
   * Authenticate user with credentials
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Fetch current authenticated user identity
   */
  getMe: () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Update authenticated user profile or change password
   * @param {{ name?: string, currentPassword?: string, newPassword?: string }} updateData
   */
  updateProfile: (updateData) => {
    return apiClient.put('/auth/profile', updateData);
  },

  /**
   * Authenticate user with Google ID token credential
   * @param {{ credential: string }} payload
   */
  googleLogin: (payload) => {
    return apiClient.post('/auth/google', payload);
  },

  /**
   * Request password recovery link/token
   * @param {{ email: string }} payload
   */
  forgotPassword: (payload) => {
    return apiClient.post('/auth/forgot-password', payload);
  },

  /**
   * Reset password with valid token
   * @param {{ token: string, newPassword: string }} payload
   */
  resetPassword: (payload) => {
    return apiClient.post('/auth/reset-password', payload);
  },
};
