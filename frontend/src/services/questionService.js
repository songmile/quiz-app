import apiClient from './api';

export default {
  // Get all questions with optional pagination and filtering
  getQuestions(page = 1, limit = 100, filters = {}) {
    const params = { page, limit, ...filters };
    return apiClient.get('/questions', { params });
  },

  // Get a specific question by ID
  getQuestion(id) {
    return apiClient.get(`/questions/${id}`);
  },

  // Create a new question
  createQuestion(questionData) {
    return apiClient.post('/questions', questionData);
  },

  // Update an existing question
  updateQuestion(id, questionData) {
    return apiClient.put(`/questions/${id}`, questionData);
  },

  // Delete a question
  deleteQuestion(id) {
    return apiClient.delete(`/questions/${id}`);
  },

  // Import questions from JSON data
  importQuestions(questions, mode = 'add', bankId = null) {
    return apiClient.post('/questions/import', { questions, mode, bankId });
  },

  // Import questions from standard text format (local parser, no AI)
  importTextQuestions(content, mode = 'add', bankId = null) {
    return apiClient.post('/questions/import/text', { content, mode, bankId });
  },

  // Import questions using AI from text content
  importQuestionsWithAI(content, mode = 'add', bankId = null) {
    return apiClient.post('/questions/import/ai', { content, mode, bankId });
  },

  // Get import task status
  getImportStatus(importId) {
    return apiClient.get(`/questions/import/status/${importId}`);
  },

  // Clean duplicate questions
  cleanDuplicates() {
    return apiClient.post('/questions/clean-duplicates');
  },

  // Create a backup of questions
  createBackup() {
    return apiClient.post('/questions/backup');
  },

  // Restore questions from a backup
  restoreBackup(backupId) {
    return apiClient.post('/questions/restore', { backupId });
  },

  // Get all tags
  getAllTags() {
    return apiClient.get('/questions/tags/all');
  }
};