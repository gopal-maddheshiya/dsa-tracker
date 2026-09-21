import api from './axios';

/**
 * Fetch connected platforms and their current sync statuses
 */
export const getSyncStatus = async () => {
  const response = await api.get('/sync/status');
  return response.data;
};

/**
 * Verify and connect a platform handle
 * @param {string} platform - 'leetcode' | 'codeforces'
 * @param {string} handle - user handle / username
 */
export const connectPlatform = async (platform, handle) => {
  const response = await api.post('/sync/connect', { platform, handle });
  return response.data;
};

/**
 * Disconnect / unlink a platform account
 * @param {string} platform - 'leetcode' | 'codeforces'
 */
export const disconnectPlatform = async (platform) => {
  const response = await api.post('/sync/disconnect', { platform });
  return response.data;
};

/**
 * Trigger an immediate live sync for a specific platform
 * @param {string} platform - 'leetcode' | 'codeforces'
 */
export const syncPlatform = async (platform) => {
  const response = await api.post(`/sync/${platform}`);
  return response.data;
};

/**
 * Trigger sync for all connected platforms
 */
export const syncAllPlatforms = async () => {
  const response = await api.post('/sync/all');
  return response.data;
};
