import apiClient from './client';

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
};
