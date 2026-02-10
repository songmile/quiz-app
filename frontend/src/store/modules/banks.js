import bankService from '@/services/bankService';

export default {
  namespaced: true,

  state: {
    banks: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_BANKS(state, banks) {
      state.banks = banks;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchBanks({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await bankService.getBanks();
        commit('SET_BANKS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '获取题库列表失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createBank({ dispatch }, data) {
      const response = await bankService.createBank(data);
      await dispatch('fetchBanks');
      return response.data.data;
    },

    async updateBank({ dispatch }, { id, data }) {
      const response = await bankService.updateBank(id, data);
      await dispatch('fetchBanks');
      return response.data.data;
    },

    async deleteBank({ dispatch }, id) {
      await bankService.deleteBank(id);
      await dispatch('fetchBanks');
    }
  },

  getters: {
    allBanks: state => state.banks,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
