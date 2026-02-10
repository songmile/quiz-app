import apiClient from './api';

export default {
  getBookmarks() {
    return apiClient.get('/bookmarks');
  },
  getBookmarkIds() {
    return apiClient.get('/bookmarks/ids');
  },
  addBookmark(questionId) {
    return apiClient.post(`/bookmarks/${questionId}`);
  },
  removeBookmark(questionId) {
    return apiClient.delete(`/bookmarks/${questionId}`);
  }
};
