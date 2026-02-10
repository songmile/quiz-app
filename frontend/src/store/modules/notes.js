import noteService from '@/services/noteService';

export default {
  namespaced: true,

  state: {
    notes: [],
    questionNotes: [],
    total: 0,
    totalPages: 1,
    loading: false,
    error: null
  },

  mutations: {
    SET_NOTES(state, { notes, total, totalPages }) {
      state.notes = notes;
      state.total = total;
      state.totalPages = totalPages;
    },
    SET_QUESTION_NOTES(state, notes) {
      state.questionNotes = notes;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchNotes({ commit }, params = {}) {
      try {
        commit('SET_LOADING', true);
        const response = await noteService.getNotes(params);
        commit('SET_NOTES', {
          notes: response.data.data,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取笔记失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchQuestionNotes({ commit }, questionId) {
      try {
        commit('SET_LOADING', true);
        const response = await noteService.getQuestionNotes(questionId);
        commit('SET_QUESTION_NOTES', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取笔记失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createNote({ dispatch }, { questionId, content }) {
      const response = await noteService.createNote({ questionId, content });
      await dispatch('fetchQuestionNotes', questionId);
      return response.data.data;
    },

    async updateNote({ dispatch }, { id, content, questionId }) {
      const response = await noteService.updateNote(id, content);
      if (questionId) await dispatch('fetchQuestionNotes', questionId);
      return response.data.data;
    },

    async deleteNote({ dispatch }, { id, questionId }) {
      await noteService.deleteNote(id);
      if (questionId) await dispatch('fetchQuestionNotes', questionId);
    }
  },

  getters: {
    allNotes: state => state.notes,
    questionNotes: state => state.questionNotes,
    total: state => state.total,
    totalPages: state => state.totalPages,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
