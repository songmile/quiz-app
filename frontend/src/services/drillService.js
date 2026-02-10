import apiClient from './api';

export default {
  startDrill(count) {
    return apiClient.post('/drill/start', { count });
  },
  getAnalysis() {
    return apiClient.get('/drill/analysis');
  }
};
