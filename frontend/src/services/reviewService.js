import apiClient from './api';

export default {
  getDueQuestions(params) {
    return apiClient.get('/review/due', { params });
  },
  getDueCount() {
    return apiClient.get('/review/due-count');
  },
  getReviewStats() {
    return apiClient.get('/review/stats');
  },
  startSpacedReview(data) {
    return apiClient.post('/review/start', data);
  }
};
