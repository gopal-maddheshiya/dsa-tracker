import api from './axios';

/**
 * Update user display name
 * @param {Object} data { name: string }
 */
export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

/**
 * Change authenticated user's password
 * @param {Object} data { currentPassword: string, newPassword: string }
 */
export const changePassword = async (data) => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};

/**
 * Request password reset code
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password using verification code
 * @param {Object} data { email: string, resetCode: string, newPassword: string }
 */
export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};
