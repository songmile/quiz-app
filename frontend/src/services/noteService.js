import apiClient from './api';

export default {
  getNotes(params) {
    return apiClient.get('/notes', { params });
  },
  getQuestionNotes(questionId) {
    return apiClient.get(`/notes/question/${questionId}`);
  },
  createNote(data) {
    return apiClient.post('/notes', data);
  },
  updateNote(id, content) {
    return apiClient.put(`/notes/${id}`, { content });
  },
  deleteNote(id) {
    return apiClient.delete(`/notes/${id}`);
  }
};
