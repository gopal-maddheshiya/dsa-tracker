import api from './axios';

/**
 * Fetch problems for authenticated user with optional filter parameters
 * @param {Object} filters - { topic, difficulty, status, search }
 */
export const fetchProblems = async (filters = {}) => {
  const params = {};
  if (filters.topic) params.topic = filters.topic;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  const response = await api.get('/problems', { params });
  return response.data;
};

/**
 * Fetch a single problem by ID along with its attempt history
 * @param {string} id - Problem ID
 */
export const fetchProblemById = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

/**
 * Create a new problem
 * @param {Object} problemData - { title, platform, link, topics, difficulty }
 */
export const createProblem = async (problemData) => {
  const response = await api.post('/problems', problemData);
  return response.data;
};

/**
 * Update an existing problem
 * @param {string} id - Problem ID
 * @param {Object} problemData - Updated problem fields
 */
export const updateProblem = async (id, problemData) => {
  const response = await api.put(`/problems/${id}`, problemData);
  return response.data;
};

/**
 * Delete a problem and cascade delete all associated attempts
 * @param {string} id - Problem ID
 */
export const deleteProblem = async (id) => {
  const response = await api.delete(`/problems/${id}`);
  return response.data;
};

/**
 * Bulk import problems
 * @param {Array} problems - Array of problem objects
 */
export const importProblems = async (problems) => {
  const response = await api.post('/problems/import', { problems });
  return response.data;
};
