import apiClient from './client.js';

/**
 * Analytics API Module
 * Encapsulates all backend analytics endpoints for the DSA Tracker cockpit.
 */
export const analyticsApi = {
  /**
   * Fetch aggregate problem and attempt statistics along with difficulty breakdown
   */
  getSummary: () => {
    return apiClient.get('/analytics/summary');
  },

  /**
   * Fetch topic-wise weakness ranking and struggle ratios
   */
  getTopics: () => {
    return apiClient.get('/analytics/topics');
  },

  /**
   * Fetch weekly practice trend of solved attempts over time
   */
  getTrend: () => {
    return apiClient.get('/analytics/trend');
  },

  /**
   * Fetch daily calendar activity records for the practice heatmap
   */
  getHeatmap: () => {
    return apiClient.get('/analytics/heatmap');
  },

  /**
   * Fetch spaced-repetition revision queue (prepared for Phase 9)
   * @param {Object} [params] - Optional query parameters (e.g. now)
   */
  getRevisionQueue: (params = {}) => {
    return apiClient.get('/analytics/revision-queue', { params });
  },
};

// Named function exports for direct destructuring
export const getSummary = analyticsApi.getSummary;
export const getTopics = analyticsApi.getTopics;
export const getTrend = analyticsApi.getTrend;
export const getHeatmap = analyticsApi.getHeatmap;
export const getRevisionQueue = analyticsApi.getRevisionQueue;

export default analyticsApi;
