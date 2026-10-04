import apiClient from './client.js';

/**
 * Problem and Attempt API module.
 * Wraps centralized Axios client calls with standard envelope unwrapping.
 */
export const problemsApi = {
  /**
   * Fetch all problems for the authenticated user with optional filtering/search
   * @param {Object} [params] - Query parameters
   * @param {string} [params.search] - Case-insensitive search query
   * @param {string} [params.difficulty] - 'easy' | 'medium' | 'hard'
   * @param {string} [params.topic] - Topic filter
   * @param {string} [params.status] - 'solved' | 'struggled' | 'revisit_needed'
   */
  getProblems: (params = {}) => {
    return apiClient.get('/problems', { params });
  },

  /**
   * Fetch a single problem by ID with its full attempt history
   * @param {string} id - Problem ObjectId
   */
  getProblem: (id) => {
    return apiClient.get(`/problems/${id}`);
  },

  /**
   * Create a new problem
   * @param {Object} data
   * @param {string} data.title
   * @param {'leetcode'|'gfg'|'codechef'|'hackerrank'|'other'} data.platform
   * @param {string} data.link
   * @param {string[]} data.topics
   * @param {'easy'|'medium'|'hard'} data.difficulty
   */
  createProblem: (data) => {
    return apiClient.post('/problems', data);
  },

  /**
   * Update problem details
   * @param {string} id - Problem ObjectId
   * @param {Object} data - Partial problem fields to update
   */
  updateProblem: (id, data) => {
    return apiClient.put(`/problems/${id}`, data);
  },

  /**
   * Delete problem and cascade delete all its attempts
   * @param {string} id - Problem ObjectId
   */
  deleteProblem: (id) => {
    return apiClient.delete(`/problems/${id}`);
  },

  /**
   * Log a new practice attempt for a problem
   * @param {string} problemId - Problem ObjectId
   * @param {Object} data
   * @param {'solved'|'struggled'|'revisit_needed'} data.status
   * @param {number} [data.timeTakenMinutes]
   * @param {string} [data.notes]
   * @param {string} [data.attemptedAt] - ISO date string
   */
  createAttempt: (problemId, data) => {
    return apiClient.post(`/problems/${problemId}/attempts`, data);
  },

  /**
   * Fetch attempt history for a problem
   * @param {string} problemId - Problem ObjectId
   */
  getAttempts: (problemId) => {
    return apiClient.get(`/problems/${problemId}/attempts`);
  },
};

export default problemsApi;
