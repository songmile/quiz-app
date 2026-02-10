import statsService from '@/services/statsService';

export default {
  namespaced: true,
  
  state: {
      timelineStats: null,
    overview: null,
    categoryStats: null,
    wrongQuestions: null,
    sessions: null,
    trends: null,
    advisor: null,
    bankProgress: null,
    tagProgress: null,
    mastery: null,
    loading: false,
    error: null
  },
  
  mutations: {
      
      SET_TIMELINE_STATS(state, timelineStats) {
      state.timelineStats = timelineStats;
    },

    SET_OVERVIEW(state, overview) {
      state.overview = overview;
    },
    SET_CATEGORY_STATS(state, categoryStats) {
      state.categoryStats = categoryStats;
    },
    SET_WRONG_QUESTIONS(state, wrongQuestions) {
      state.wrongQuestions = wrongQuestions;
    },
    SET_SESSIONS(state, sessions) {
      state.sessions = sessions;
    },
    SET_TRENDS(state, trends) {
      state.trends = trends;
    },
    SET_ADVISOR(state, advisor) {
      state.advisor = advisor;
    },
    SET_BANK_PROGRESS(state, data) {
      state.bankProgress = data;
    },
    SET_TAG_PROGRESS(state, data) {
      state.tagProgress = data;
    },
    SET_MASTERY(state, data) {
      state.mastery = data;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  
  actions: {
          async fetchTimelineStats({ commit }, { period = 'daily', startDate = null, endDate = null, category = null }) {
      try {
        commit('SET_LOADING', true);
        
        const params = { period };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (category) params.category = category;
        
        const response = await statsService.getTimelineStats(params);
        commit('SET_TIMELINE_STATS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取时间段统计数据失败');
        console.error('获取时间段统计数据出错:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },


    async fetchOverview({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getOverview();
        commit('SET_OVERVIEW', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch overview statistics');
        console.error('Error fetching overview statistics:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchCategoryStats({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getCategoryStats();
        commit('SET_CATEGORY_STATS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch category statistics');
        console.error('Error fetching category statistics:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchWrongQuestions({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getWrongQuestions();
        commit('SET_WRONG_QUESTIONS', response.data);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch wrong questions');
        console.error('Error fetching wrong questions:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchSessions({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getSessions();
        commit('SET_SESSIONS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch sessions');
        console.error('Error fetching sessions:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchTrends({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getTrends();
        commit('SET_TRENDS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch trends');
        console.error('Error fetching trends:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchAdvisor({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getAdvisorSuggestions();
        commit('SET_ADVISOR', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch advisor suggestions');
        console.error('Error fetching advisor suggestions:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async startSession({ commit }, mode = 'normal') {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.startSession(mode);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to start session');
        console.error('Error starting session:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async endSession({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.endSession();
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to end session');
        console.error('Error ending session:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async resetStats({ commit, dispatch }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.resetStats();
        
        // Refresh stats data after reset
        await Promise.all([
          dispatch('fetchOverview'),
          dispatch('fetchCategoryStats'),
          dispatch('fetchWrongQuestions'),
          dispatch('fetchSessions')
        ]);
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to reset statistics');
        console.error('Error resetting statistics:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateViewHistory({ commit }, { view, currentIndex }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.updateViewHistory(view, currentIndex);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update view history');
        console.error('Error updating view history:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchBankProgress({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getBankProgress();
        commit('SET_BANK_PROGRESS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取题库进度失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchTagProgress({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getTagProgress();
        commit('SET_TAG_PROGRESS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取标签进度失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchMastery({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await statsService.getMastery();
        commit('SET_MASTERY', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取掌握度失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchAllStats({ dispatch }) {
      await Promise.all([
        dispatch('fetchOverview'),
        dispatch('fetchCategoryStats'),
        dispatch('fetchWrongQuestions'),
        dispatch('fetchSessions'),
        dispatch('fetchTrends'),
        dispatch('fetchAdvisor')
      ]);
    }
  },
  
  getters: {
      timelineStats: state => state.timelineStats,
      
    overview: state => state.overview,
    categoryStats: state => state.categoryStats,
    wrongQuestions: state => state.wrongQuestions,
    sessions: state => state.sessions,
    trends: state => state.trends,
    advisor: state => state.advisor,
    isLoading: state => state.loading,
    error: state => state.error,
    
    // Derived data
    correctRate: state => state.overview?.correctRate || '0.0',
    completionRate: state => state.overview?.completionRate || '0.0',
    totalAnswered: state => state.overview?.totalAnswered || 0,
    totalQuestions: state => state.overview?.totalQuestions || 0,
    wrongQuestionCount: state => state.overview?.wrongQuestionCount || 0,
    studyTimeFormatted: state => state.overview?.studyTime?.formatted || '0小时0分钟',
    bankProgress: state => state.bankProgress,
    tagProgress: state => state.tagProgress,
    mastery: state => state.mastery
  }
};