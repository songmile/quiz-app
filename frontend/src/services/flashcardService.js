import apiClient from './api';

export default {
  startSession(data) {
    return apiClient.post('/flashcards/start', data);
  },
  rateCard(questionId, rating) {
    return apiClient.post('/flashcards/rate', { questionId, rating });
  },
  getSessionInfo() {
    return apiClient.get('/flashcards/info');
  }
};
