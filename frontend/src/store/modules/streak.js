import streakService from '@/services/streakService';

export default {
  namespaced: true,

  state: {
    currentStreak: 0,
    longestStreak: 0,
    dailyGoal: 10,
    todayProgress: 0,
    activityLog: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_STREAK(state, data) {
      state.currentStreak = data.currentStreak || 0;
      state.longestStreak = data.longestStreak || 0;
      state.dailyGoal = data.dailyGoal || 10;
      state.todayProgress = data.todayProgress || 0;
      state.activityLog = data.activityLog || [];
    },
    SET_LOADING(state, val) {
      state.loading = val;
    },
    SET_ERROR(state, err) {
      state.error = err;
    }
  },

  actions: {
    async fetchStreak({ commit }) {
      try {
        commit('SET_LOADING', true);
        const res = await streakService.getStreak();
        commit('SET_STREAK', res.data.data);
        commit('SET_ERROR', null);
        return res.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取打卡数据失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateGoal({ commit, dispatch }, goal) {
      try {
        await streakService.updateDailyGoal(goal);
        await dispatch('fetchStreak');
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '更新目标失败');
      }
    }
  },

  getters: {
    currentStreak: s => s.currentStreak,
    longestStreak: s => s.longestStreak,
    dailyGoal: s => s.dailyGoal,
    todayProgress: s => s.todayProgress,
    goalPercent: s => s.dailyGoal > 0 ? Math.min(100, Math.round((s.todayProgress / s.dailyGoal) * 100)) : 0,
    goalReached: s => s.todayProgress >= s.dailyGoal,
    activityLog: s => s.activityLog,
    isLoading: s => s.loading,
    error: s => s.error
  }
};
