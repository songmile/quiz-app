import questionService from '@/services/questionService';

export default {
  namespaced: true,
  
  state: {
    questions: [],
    currentQuestion: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    filters: {
      type: '',
      search: ''
    },
    importStatus: null,
    allTags: []
  },
  
  mutations: {
    SET_QUESTIONS(state, questions) {
      state.questions = questions;
    },
    SET_CURRENT_QUESTION(state, question) {
      state.currentQuestion = question;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_TOTAL_PAGES(state, totalPages) {
      state.totalPages = totalPages;
    },
    SET_CURRENT_PAGE(state, page) {
      state.currentPage = page;
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    ADD_QUESTION(state, question) {
      state.questions.unshift(question);
    },
    UPDATE_QUESTION(state, updatedQuestion) {
      const index = state.questions.findIndex(q => q.id === updatedQuestion.id);
      if (index !== -1) {
        state.questions.splice(index, 1, updatedQuestion);
      }
    },
    REMOVE_QUESTION(state, id) {
      state.questions = state.questions.filter(q => q.id !== id);
    },
    SET_IMPORT_STATUS(state, status) {
      state.importStatus = status;
    },
    SET_ALL_TAGS(state, tags) {
      state.allTags = tags;
    }
  },
  
  actions: {
    async fetchQuestions({ commit, state }, { page, limit, filters } = {}) {
      try {
        commit('SET_LOADING', true);
        const currentPage = page || state.currentPage;
        const activeFilters = filters || state.filters;
        const response = await questionService.getQuestions(
          currentPage,
          limit || 100,
          activeFilters
        );
        
        commit('SET_QUESTIONS', response.data.data);
        commit('SET_TOTAL_PAGES', response.data.totalPages);
        commit('SET_CURRENT_PAGE', currentPage);
        commit('SET_ERROR', null);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch questions');
        console.error('Error fetching questions:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchQuestion({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.getQuestion(id);
        commit('SET_CURRENT_QUESTION', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch question');
        console.error('Error fetching question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createQuestion({ commit }, questionData) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.createQuestion(questionData);
        commit('ADD_QUESTION', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to create question');
        console.error('Error creating question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateQuestion({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.updateQuestion(id, data);
        commit('UPDATE_QUESTION', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update question');
        console.error('Error updating question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteQuestion({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        await questionService.deleteQuestion(id);
        commit('REMOVE_QUESTION', id);
        commit('SET_ERROR', null);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to delete question');
        console.error('Error deleting question:', error);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async importQuestions({ commit }, { questions, mode, bankId }) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.importQuestions(questions, mode, bankId);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to import questions');
        console.error('Error importing questions:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async importTextQuestions({ commit }, { content, mode, bankId }) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.importTextQuestions(content, mode, bankId);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to import text questions');
        console.error('Error importing text questions:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async importQuestionsWithAI({ commit }, { content, mode, bankId }) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.importQuestionsWithAI(content, mode, bankId);
        commit('SET_IMPORT_STATUS', {
          id: response.data.importId,
          status: 'processing',
          mode: response.data.mode
        });
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to import questions with AI');
        console.error('Error importing questions with AI:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async cleanDuplicates({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.cleanDuplicates();
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to clean duplicates');
        console.error('Error cleaning duplicates:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createBackup({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.createBackup();
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to create backup');
        console.error('Error creating backup:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async restoreBackup({ commit }, backupId) {
      try {
        commit('SET_LOADING', true);
        const response = await questionService.restoreBackup(backupId);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to restore backup');
        console.error('Error restoring backup:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchAllTags({ commit }) {
      try {
        const response = await questionService.getAllTags();
        commit('SET_ALL_TAGS', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
    },

    setFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters);
      dispatch('fetchQuestions', { page: 1 });
    }
  },
  
  getters: {
    allQuestions: state => state.questions,
    questionById: state => id => state.questions.find(q => q.id === id),
    currentQuestion: state => state.currentQuestion,
    isLoading: state => state.loading,
    error: state => state.error,
    currentPage: state => state.currentPage,
    totalPages: state => state.totalPages,
    filters: state => state.filters,
    importStatus: state => state.importStatus
  }
};