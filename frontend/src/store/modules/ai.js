import aiService from '@/services/aiService';

export default {
  namespaced: true,
  
  state: {
    explanation: null,
    errorAnalysis: null,
    variant: null,
    knowledgeTree: null,
    designProcess: null,
    loading: false,
    error: null,
    generatingStatus: {
      explanation: false,
      errorAnalysis: false,
      variant: false,
      knowledgeTree: false,
      designProcess: false
    }
  },
  
  mutations: {
    SET_EXPLANATION(state, explanation) {
      state.explanation = explanation;
    },
    SET_ERROR_ANALYSIS(state, errorAnalysis) {
      state.errorAnalysis = errorAnalysis;
    },
    SET_VARIANT(state, variant) {
      state.variant = variant;
    },
    SET_KNOWLEDGE_TREE(state, knowledgeTree) {
      state.knowledgeTree = knowledgeTree;
    },
    SET_DESIGN_PROCESS(state, designProcess) {
      state.designProcess = designProcess;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_GENERATING_STATUS(state, { type, status }) {
      state.generatingStatus = {
        ...state.generatingStatus,
        [type]: status
      };
    },
    RESET_AI_DATA(state) {
      state.explanation = null;
      state.errorAnalysis = null;
      state.variant = null;
      state.knowledgeTree = null;
      state.designProcess = null;
      state.generatingStatus = {
        explanation: false,
        errorAnalysis: false,
        variant: false,
        knowledgeTree: false,
        designProcess: false
      };
    }
  },
  
  actions: {
    async generateExplanation({ commit }, { questionId, force = false }) {
      try {
        commit('SET_GENERATING_STATUS', { type: 'explanation', status: true });
        const response = await aiService.generateExplanation(questionId, force);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to generate explanation');
        console.error('Error generating explanation:', error);
        return null;
      } finally {
        commit('SET_GENERATING_STATUS', { type: 'explanation', status: false });
      }
    },
    
    async getExplanation({ commit }, questionId) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.getExplanation(questionId);
        
        if (response.data.exists) {
          commit('SET_EXPLANATION', response.data.data);
        } else {
          commit('SET_EXPLANATION', null);
        }
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get explanation');
        console.error('Error getting explanation:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async generateErrorAnalysis({ commit }, { questionId, userAnswer, force = false }) {
      try {
        commit('SET_GENERATING_STATUS', { type: 'errorAnalysis', status: true });
        const response = await aiService.generateErrorAnalysis(questionId, userAnswer, force);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to generate error analysis');
        console.error('Error generating error analysis:', error);
        return null;
      } finally {
        commit('SET_GENERATING_STATUS', { type: 'errorAnalysis', status: false });
      }
    },
    
    async getErrorAnalysis({ commit }, { questionId, userAnswer }) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.getErrorAnalysis(questionId, userAnswer);
        
        if (response.data.exists) {
          commit('SET_ERROR_ANALYSIS', response.data.data);
        } else {
          commit('SET_ERROR_ANALYSIS', null);
        }
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get error analysis');
        console.error('Error getting error analysis:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async generateVariant({ commit }, { questionId, force = false }) {
      try {
        commit('SET_GENERATING_STATUS', { type: 'variant', status: true });
        const response = await aiService.generateVariant(questionId, force);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to generate variant');
        console.error('Error generating variant:', error);
        return null;
      } finally {
        commit('SET_GENERATING_STATUS', { type: 'variant', status: false });
      }
    },
    
    async getVariant({ commit }, questionId) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.getVariant(questionId);
        
        if (response.data.exists) {
          commit('SET_VARIANT', response.data.data);
        } else {
          commit('SET_VARIANT', null);
        }
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get variant');
        console.error('Error getting variant:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async addVariantToQuestions({ commit }, questionId) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.addVariantToQuestions(questionId);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to add variant to questions');
        console.error('Error adding variant to questions:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async generateKnowledgeTree({ commit }, { questionId, force = false }) {
      try {
        commit('SET_GENERATING_STATUS', { type: 'knowledgeTree', status: true });
        const response = await aiService.generateKnowledgeTree(questionId, force);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to generate knowledge tree');
        console.error('Error generating knowledge tree:', error);
        return null;
      } finally {
        commit('SET_GENERATING_STATUS', { type: 'knowledgeTree', status: false });
      }
    },
    
    async getKnowledgeTree({ commit }, questionId) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.getKnowledgeTree(questionId);
        
        if (response.data.exists) {
          commit('SET_KNOWLEDGE_TREE', response.data.data);
        } else {
          commit('SET_KNOWLEDGE_TREE', null);
        }
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get knowledge tree');
        console.error('Error getting knowledge tree:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async generateDesignProcess({ commit }, { questionId, force = false }) {
      try {
        commit('SET_GENERATING_STATUS', { type: 'designProcess', status: true });
        const response = await aiService.generateDesignProcess(questionId, force);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to generate design process');
        console.error('Error generating design process:', error);
        return null;
      } finally {
        commit('SET_GENERATING_STATUS', { type: 'designProcess', status: false });
      }
    },
    
    async getDesignProcess({ commit }, questionId) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.getDesignProcess(questionId);
        
        if (response.data.exists) {
          commit('SET_DESIGN_PROCESS', response.data.data);
        } else {
          commit('SET_DESIGN_PROCESS', null);
        }
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get design process');
        console.error('Error getting design process:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async testApiConnection({ commit }, apiIndex = 0) {
      try {
        commit('SET_LOADING', true);
        const response = await aiService.testApiConnection(apiIndex);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to test API connection');
        console.error('Error testing API connection:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    resetAiData({ commit }) {
      commit('RESET_AI_DATA');
    }
  },
  
  getters: {
    explanation: state => state.explanation,
    errorAnalysis: state => state.errorAnalysis,
    variant: state => state.variant,
    knowledgeTree: state => state.knowledgeTree,
    designProcess: state => state.designProcess,
    isLoading: state => state.loading,
    error: state => state.error,
    generatingStatus: state => state.generatingStatus,
    isGenerating: state => Object.values(state.generatingStatus).some(status => status === true)
  }
};