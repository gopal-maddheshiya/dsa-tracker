/**
 * Extracts a safe, human-readable error message from Axios errors or generic Error objects.
 * Prevents raw stack traces, undefined messages, or technical jargon from leaking to users.
 *
 * @param {any} error - Caught error object
 * @param {string} [fallback='An unexpected error occurred. Please try again.'] - Fallback message
 * @returns {string} Clean error message
 */
export const getErrorMessage = (error, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallback;

  // Axios response error from backend
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
  }

  // Network / timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'The server took too long to respond. Please check your network and try again.';
  }

  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please verify your internet connection or server status.';
  }

  // Generic message
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};
