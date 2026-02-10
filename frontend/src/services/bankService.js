import apiClient from './api';

export default {
  getBanks() {
    return apiClient.get('/banks');
  },
  createBank(data) {
    return apiClient.post('/banks', data);
  },
  updateBank(id, data) {
    return apiClient.put(`/banks/${id}`, data);
  },
  deleteBank(id) {
    return apiClient.delete(`/banks/${id}`);
  },
  getBankQuestions(id, params) {
    return apiClient.get(`/banks/${id}/questions`, { params });
  }
};
