import axios from 'axios';
import { authStorage } from '../lib/authStorage.js';

/**
 * Normalizes the API base URL to ensure predictable path resolution.
 * - Trims whitespace and trailing slashes.
 * - If given an absolute URL that does not end in '/api', appends '/api'.
 * - Preserves relative '/api' proxy fallback.
 *
 * @param {string} [rawUrl]
 * @returns {string} Normalized API base URL
 */
export function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return '/api';
  }
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '/api';
  }
  // Relative path starting with /api
  if (trimmed === '/api' || trimmed.startsWith('/api/')) {
    return trimmed;
  }
  // Absolute URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (!trimmed.endsWith('/api')) {
      return `${trimmed}/api`;
    }
  }
  return trimmed;
}

const RAW_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';
const API_BASE_URL = normalizeApiBaseUrl(RAW_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Injects Authorization token when available
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized error parsing
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred',
      data: error.response?.data || null,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
