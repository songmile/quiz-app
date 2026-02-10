import drillApiService from '@/services/drillService';
import quizService from '@/services/quizService';

export default {
  namespaced: true,

  state: {
    questions: [],
    currentIndex: 0,
    analysis: {},
    userAnswer: null,
    submittedAnswer: null,
    isCorrect: null,
    sessionActive: false,
    results: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_DRILL(state, { questions, analysis }) {
      state.questions = questions;
      state.analysis = analysis;
      state.currentIndex = 0;
      state.userAnswer = null;
      state.submittedAnswer = null;
      state.isCorrect = null;
      state.results = [];
      state.sessionActive = true;
    },
    SET_USER_ANSWER(state, answer) {
      state.userAnswer = answer;
    },
    SET_SUBMITTED(state, { userAnswer, isCorrect }) {
      state.submittedAnswer = userAnswer;
      state.isCorrect = isCorrect;
    },
    NEXT_QUESTION(state) {
      state.currentIndex++;
      state.userAnswer = null;
      state.submittedAnswer = null;
      state.isCorrect = null;
    },
    ADD_RESULT(state, result) {
      state.results.push(result);
    },
    END_SESSION(state) {
      state.sessionActive = false;
    },
    SET_ANALYSIS(state, analysis) {
      state.analysis = analysis;
    },
    SET_LOADING(state, val) {
      state.loading = val;
    },
    SET_ERROR(state, err) {
      state.error = err;
    }
  },

  actions: {
    async startDrill({ commit }, count = 20) {
      try {
        commit('SET_LOADING', true);
        const res = await drillApiService.startDrill(count);
        commit('SET_DRILL', {
          questions: res.data.data.questions,
          analysis: res.data.data.analysis
        });
        commit('SET_ERROR', null);
        return res.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '启动智能组卷失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchAnalysis({ commit }) {
      try {
        const res = await drillApiService.getAnalysis();
        commit('SET_ANALYSIS', res.data.data);
        return res.data.data;
      } catch (error) {
        console.error('获取弱项分析失败:', error);
        return null;
      }
    },

    setUserAnswer({ commit }, answer) {
      commit('SET_USER_ANSWER', answer);
    },

    async submitAnswer({ commit, state }) {
      const question = state.questions[state.currentIndex];
      if (!question || !state.userAnswer) return null;
      try {
        commit('SET_LOADING', true);
        const res = await quizService.submitAnswer(
          question.id, state.userAnswer, 'drill'
        );
        const data = res.data.data;
        commit('SET_SUBMITTED', {
          userAnswer: data.userAnswer,
          isCorrect: data.isCorrect
        });
        commit('ADD_RESULT', {
          questionId: question.id,
          isCorrect: data.isCorrect
        });
        return data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || '提交答案失败');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    nextQuestion({ commit, state }) {
      if (state.currentIndex < state.questions.length - 1) {
        commit('NEXT_QUESTION');
      } else {
        commit('END_SESSION');
      }
    }
  },

  getters: {
    questions: s => s.questions,
    currentQuestion: s => s.questions[s.currentIndex] || null,
    currentIndex: s => s.currentIndex,
    totalQuestions: s => s.questions.length,
    userAnswer: s => s.userAnswer,
    submittedAnswer: s => s.submittedAnswer,
    isCorrect: s => s.isCorrect,
    sessionActive: s => s.sessionActive,
    analysis: s => s.analysis,
    results: s => s.results,
    isLoading: s => s.loading,
    error: s => s.error,
    summary: s => {
      const total = s.results.length;
      const correct = s.results.filter(r => r.isCorrect).length;
      return {
        total,
        correct,
        rate: total > 0 ? Math.round((correct / total) * 100) : 0
      };
    }
  }
};
