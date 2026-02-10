import bookmarkService from '@/services/bookmarkService';

export default {
  namespaced: true,

  state: {
    bookmarkIds: [],
    bookmarks: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_BOOKMARK_IDS(state, ids) {
      state.bookmarkIds = ids;
    },
    SET_BOOKMARKS(state, bookmarks) {
      state.bookmarks = bookmarks;
    },
    ADD_BOOKMARK(state, questionId) {
      if (!state.bookmarkIds.includes(questionId)) {
        state.bookmarkIds.push(questionId);
      }
    },
    REMOVE_BOOKMARK(state, questionId) {
      state.bookmarkIds = state.bookmarkIds.filter(id => id !== questionId);
      state.bookmarks = state.bookmarks.filter(b => b.questionId !== questionId);
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchBookmarkIds({ commit }) {
      try {
        const response = await bookmarkService.getBookmarkIds();
        commit('SET_BOOKMARK_IDS', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('获取收藏ID失败:', error);
        return [];
      }
    },

    async fetchBookmarks({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await bookmarkService.getBookmarks();
        commit('SET_BOOKMARKS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取收藏列表失败');
        return [];
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async toggleBookmark({ state, commit }, questionId) {
      try {
        if (state.bookmarkIds.includes(questionId)) {
          await bookmarkService.removeBookmark(questionId);
          commit('REMOVE_BOOKMARK', questionId);
          return false;
        } else {
          await bookmarkService.addBookmark(questionId);
          commit('ADD_BOOKMARK', questionId);
          return true;
        }
      } catch (error) {
        console.error('切换收藏状态失败:', error);
        return null;
      }
    }
  },

  getters: {
    bookmarkIds: state => state.bookmarkIds,
    bookmarks: state => state.bookmarks,
    isBookmarked: state => (questionId) => state.bookmarkIds.includes(questionId),
    bookmarkCount: state => state.bookmarkIds.length,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
