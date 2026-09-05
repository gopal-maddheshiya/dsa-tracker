import axios from 'axios';

/**
 * Centralized Axios instance configured with base URL from environment variables.
 * In development, defaults to localhost Express server.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
