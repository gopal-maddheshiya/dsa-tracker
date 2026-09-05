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
