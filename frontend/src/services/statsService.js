import apiClient from './api';

export default {
  // Get all statistics
  getAllStats() {
    return apiClient.get('/stats');
  },

  // Get overview statistics
  getOverview() {
    return apiClient.get('/stats/overview');
  },

    // 获取时间段统计数据
    getTimelineStats(params) {
      return apiClient.get('/stats/timeline', { params });
    },

  // Get category statistics
  getCategoryStats() {
    return apiClient.get('/stats/categories');
  },

  // Get wrong questions statistics
  getWrongQuestions() {
    return apiClient.get('/stats/wrong-questions');
  },

  // Get session records
  getSessions() {
    return apiClient.get('/stats/sessions');
  },

  // Get learning trend data
  getTrends() {
    return apiClient.get('/stats/trends');
  },

  // Start a new study session
  startSession(mode = 'normal') {
    return apiClient.post('/stats/sessions/start', { mode });
  },

  // End current study session
  endSession() {
    return apiClient.post('/stats/sessions/end');
  },

  // Reset all statistics
  resetStats() {
    return apiClient.post('/stats/reset');
  },

  // Get advisor suggestions
  getAdvisorSuggestions() {
    return apiClient.get('/stats/advisor');
  },

  // Update view history
  updateViewHistory(view, currentIndex) {
    return apiClient.post('/stats/view-history', { view, currentIndex });
  },

  // Get bank progress
  getBankProgress() {
    return apiClient.get('/stats/bank-progress');
  },

  // Get tag progress
  getTagProgress() {
    return apiClient.get('/stats/tag-progress');
  },

  // Get mastery overview
  getMastery() {
    return apiClient.get('/stats/mastery');
  }
};