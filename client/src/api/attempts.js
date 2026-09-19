import api from './axios';

/**
 * Log a new attempt for a specific problem
 * @param {string} problemId - Target problem ID
 * @param {Object} attemptData - { status, timeTakenMinutes, notes, attemptedAt }
 */
export const createAttempt = async (problemId, attemptData) => {
  const response = await api.post(`/problems/${problemId}/attempts`, attemptData);
  return response.data;
};

/**
 * Fetch attempt history for a specific problem
 * @param {string} problemId - Target problem ID
 */
export const fetchAttempts = async (problemId) => {
  const response = await api.get(`/problems/${problemId}/attempts`);
  return response.data;
};

/**
 * Update an existing attempt for a specific problem
 * @param {string} problemId - Target problem ID
 * @param {string} attemptId - Target attempt ID
 * @param {Object} attemptData - { status, timeTakenMinutes, notes, attemptedAt }
 */
export const updateAttempt = async (problemId, attemptId, attemptData) => {
  const response = await api.put(`/problems/${problemId}/attempts/${attemptId}`, attemptData);
  return response.data;
};

/**
 * Delete an attempt for a specific problem
 * @param {string} problemId - Target problem ID
 * @param {string} attemptId - Target attempt ID
 */
export const deleteAttempt = async (problemId, attemptId) => {
  const response = await api.delete(`/problems/${problemId}/attempts/${attemptId}`);
  return response.data;
};
