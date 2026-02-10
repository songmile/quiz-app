import reviewService from '@/services/reviewService';

export default {
  namespaced: true,

  state: {
    dueCount: 0,
    reviewStats: null,
    loading: false,
    error: null
  },

  mutations: {
    SET_DUE_COUNT(state, count) {
      state.dueCount = count;
    },
    SET_REVIEW_STATS(state, stats) {
      state.reviewStats = stats;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchDueCount({ commit }) {
      try {
        const response = await reviewService.getDueCount();
        commit('SET_DUE_COUNT', response.data.data.dueCount);
        return response.data.data.dueCount;
      } catch (error) {
        console.error('获取待复习数量失败:', error);
        return 0;
      }
    },

    async fetchReviewStats({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await reviewService.getReviewStats();
        commit('SET_REVIEW_STATS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取复习统计失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },

  getters: {
    dueCount: state => state.dueCount,
    reviewStats: state => state.reviewStats,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
