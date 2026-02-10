import flashcardService from '@/services/flashcardService';

export default {
  namespaced: true,

  state: {
    cards: [],
    currentIndex: 0,
    flipped: false,
    sessionActive: false,
    ratings: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_CARDS(state, cards) {
      state.cards = cards;
      state.currentIndex = 0;
      state.flipped = false;
      state.ratings = [];
      state.sessionActive = true;
    },
    FLIP(state) {
      state.flipped = !state.flipped;
    },
    NEXT_CARD(state) {
      state.currentIndex++;
      state.flipped = false;
    },
    ADD_RATING(state, { questionId, rating }) {
      state.ratings.push({ questionId, rating });
    },
    END_SESSION(state) {
      state.sessionActive = false;
    },
    SET_LOADING(state, val) {
      state.loading = val;
    },
    SET_ERROR(state, err) {
      state.error = err;
    }
  },

  actions: {
    async startSession({ commit }, options = {}) {
      try {
        commit('SET_LOADING', true);
        const res = await flashcardService.startSession(options);
        commit('SET_CARDS', res.data.data.cards);
        commit('SET_ERROR', null);
        return res.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '启动闪卡失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    flip({ commit }) {
      commit('FLIP');
    },

    async rateCard({ commit, state }, rating) {
      const card = state.cards[state.currentIndex];
      if (!card) return;
      try {
        await flashcardService.rateCard(card.id, rating);
        commit('ADD_RATING', { questionId: card.id, rating });
        if (state.currentIndex < state.cards.length - 1) {
          commit('NEXT_CARD');
        } else {
          commit('END_SESSION');
        }
      } catch (error) {
        console.error('评分失败:', error);
      }
    }
  },

  getters: {
    cards: s => s.cards,
    currentCard: s => s.cards[s.currentIndex] || null,
    currentIndex: s => s.currentIndex,
    totalCards: s => s.cards.length,
    flipped: s => s.flipped,
    sessionActive: s => s.sessionActive,
    ratings: s => s.ratings,
    isLoading: s => s.loading,
    error: s => s.error,
    summary: s => {
      const total = s.ratings.length;
      const counts = { again: 0, hard: 0, good: 0, easy: 0 };
      s.ratings.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
      return { total, counts };
    }
  }
};
