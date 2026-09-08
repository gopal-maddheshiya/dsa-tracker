import api from './axios';

/**
 * Fetch high-level summary KPIs (total problems, total attempts, solved counts, difficulty breakdown).
 * @returns {Promise<Object>} API response data object
 */
export const fetchAnalyticsSummary = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};

/**
 * Fetch topic analytics ranked by struggle ratio descending.
 * @returns {Promise<Object>} API response data object
 */
export const fetchTopicAnalytics = async () => {
  const response = await api.get('/analytics/topics');
  return response.data;
};

/**
 * Fetch chronological daily trend of solved problem attempts.
 * @returns {Promise<Object>} API response data object
 */
export const fetchTrendAnalytics = async () => {
  const response = await api.get('/analytics/trend');
  return response.data;
};

/**
 * Fetch calendar heatmap of all practice attempts.
 * @returns {Promise<Object>} API response data object
 */
export const fetchHeatmapAnalytics = async () => {
  const response = await api.get('/analytics/heatmap');
  return response.data;
};

/**
 * Fetch prioritized spaced-repetition revision queue.
 * @returns {Promise<Object>} API response data object
 */
export const fetchRevisionQueue = async () => {
  const response = await api.get('/analytics/revision-queue');
  return response.data;
};

/**
 * Fetch full profile: streak, badges, best day, difficulty breakdown.
 * @returns {Promise<Object>} API response data object
 */
export const fetchProfileAnalytics = async () => {
  const response = await api.get('/analytics/profile');
  return response.data;
};
