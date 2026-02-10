import apiClient from './api';

export default {
  // Start a new quiz session
  startQuiz() {
    return apiClient.post('/quiz/start');
  },

  // Start a review session with wrong questions
  startReview() {
    return apiClient.post('/quiz/review');
  },

  // Get the current question
  getCurrentQuestion(index = 0, mode = 'normal') {
    return apiClient.get('/quiz/current', { params: { index, mode } });
  },

  // Submit an answer
  submitAnswer(questionId, userAnswer, mode = 'normal') {
    return apiClient.post('/quiz/submit', { questionId, userAnswer, mode });
  },

  // Get the next question
  getNextQuestion(currentIndex, mode = 'normal') {
    return apiClient.get('/quiz/next', { params: { currentIndex, mode } });
  },

  // Get the previous question
  getPreviousQuestion(currentIndex, mode = 'normal') {
    return apiClient.get('/quiz/previous', { params: { currentIndex, mode } });
  },

  // Get user answer history
  getUserAnswers(filters = {}, page = 1, limit = 100) {
    return apiClient.get('/quiz/answers', { 
      params: { page, limit, ...filters } 
    });
  },

  // Get answers for a specific question
  getQuestionAnswers(questionId) {
    return apiClient.get(`/quiz/answers/${questionId}`);
  },

  // Reset quiz progress
  resetQuiz() {
    return apiClient.post('/quiz/reset');
  },

  // Get navigation data for questions
  getQuestionNavigator(filter = 'all', type = 'all', search = '') {
    return apiClient.get('/quiz/navigator', {
      params: { filter, type, search }
    });
  },

  // Jump to a specific question
  jumpToQuestion(index, mode = 'normal') {
    return apiClient.post(`/quiz/jump/${index}`, { mode });
  }
};