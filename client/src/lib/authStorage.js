const TOKEN_KEY = 'dsa_tracker_token';

/**
 * Safe local storage utility for JWT persistence.
 * Prevents key collision with other local development applications.
 */
export const authStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage read error:', e);
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.error('Storage write error:', e);
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },
};
