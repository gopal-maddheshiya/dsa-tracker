import api from './axios';

/**
 * Fetches grounded coaching note for a target problem.
 *
 * @param {string} problemId - The ID of the problem to coach on
 * @returns {Promise<Object>} Structured coaching note
 */
export const getAICoach = async (problemId) => {
  const response = await api.post('/ai/coach', { problemId });
  return response.data?.data;
};

/**
 * Fetches synthesized takeaway for an attempt (preview-only, non-persisted).
 *
 * @param {string} attemptId - The ID of the attempt to synthesize
 * @returns {Promise<Object>} Structured takeaway note { source, takeaway, pattern, nextRecallPrompt }
 */
export const coachAttemptTakeaway = async (attemptId) => {
  const response = await api.post('/ai/takeaway', { attemptId });
  return response.data?.data;
};

/**
 * Fetches 7-day progress review (preview-only, non-persisted).
 *
 * @returns {Promise<Object>} Structured weekly review
 */
export const fetchWeeklyReview = async () => {
  const response = await api.post('/ai/weekly-review');
  return response.data?.data;
};

