import apiClient from './api';

export default {
  // Generate AI explanation for a question
  generateExplanation(questionId, force = false) {
    return apiClient.post(`/ai/explanation/${questionId}`, {}, {
      params: { force }
    });
  },

  // Get AI explanation for a question
  getExplanation(questionId) {
    return apiClient.get(`/ai/explanation/${questionId}`);
  },

  // Generate error analysis
  generateErrorAnalysis(questionId, userAnswer, force = false) {
    return apiClient.post(`/ai/error-analysis/${questionId}`, { userAnswer }, {
      params: { force }
    });
  },

  // Get error analysis
  getErrorAnalysis(questionId, userAnswer) {
    return apiClient.get(`/ai/error-analysis/${questionId}`, {
      params: { userAnswer }
    });
  },

  // Generate variant question
  generateVariant(questionId, force = false) {
    return apiClient.post(`/ai/variant/${questionId}`, {}, {
      params: { force }
    });
  },

  // Get variant question
  getVariant(questionId) {
    return apiClient.get(`/ai/variant/${questionId}`);
  },

  // Add variant to question bank
  addVariantToQuestions(questionId) {
    return apiClient.post(`/ai/variant/${questionId}/add`);
  },

  // Generate knowledge tree
  generateKnowledgeTree(questionId, force = false) {
    return apiClient.post(`/ai/knowledge-tree/${questionId}`, {}, {
      params: { force }
    });
  },

  // Get knowledge tree
  getKnowledgeTree(questionId) {
    return apiClient.get(`/ai/knowledge-tree/${questionId}`);
  },

  // Generate design process
  generateDesignProcess(questionId, force = false) {
    return apiClient.post(`/ai/design-process/${questionId}`, {}, {
      params: { force }
    });
  },

  // Get design process
  getDesignProcess(questionId) {
    return apiClient.get(`/ai/design-process/${questionId}`);
  },

  // Test API connection
  testApiConnection(apiIndex = 0) {
    return apiClient.post('/ai/test-connection', { apiIndex });
  },

  // Clear all AI explanations
  clearExplanations() {
    return apiClient.delete('/ai/explanations');
  },

  // Clear all error analyses
  clearErrorAnalyses() {
    return apiClient.delete('/ai/error-analyses');
  },

  // Clear all variants
  clearVariants() {
    return apiClient.delete('/ai/variants');
  }
};