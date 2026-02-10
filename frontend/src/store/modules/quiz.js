import quizService from '@/services/quizService';
import reviewService from '@/services/reviewService';

export default {
  namespaced: true,
  
  state: {
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    userAnswer: null,
    submittedAnswer: null,
    isCorrect: null,
    mode: 'normal', // 'normal' or 'review'
    loading: false,
    error: null,
    navigator: [],
    sessionId: null
  },
  
  mutations: {
    SET_CURRENT_QUESTION(state, { question, currentIndex, totalQuestions, userAnswer }) {
      state.currentQuestion = question;
      state.currentIndex = currentIndex;
      state.totalQuestions = totalQuestions;
      state.userAnswer = userAnswer || null;
      // Reset submitted answer when changing question
      state.submittedAnswer = null;
      state.isCorrect = null;
    },
    SET_USER_ANSWER(state, answer) {
      state.userAnswer = answer;
    },
    SET_SUBMITTED_ANSWER(state, { userAnswer, isCorrect }) {
      state.submittedAnswer = userAnswer;
      state.isCorrect = isCorrect;
    },
    SET_MODE(state, mode) {
      state.mode = mode;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_NAVIGATOR(state, navigator) {
      state.navigator = navigator;
    },
    SET_SESSION_ID(state, sessionId) {
      state.sessionId = sessionId;
    },
    RESET_QUIZ_STATE(state) {
      state.currentQuestion = null;
      state.currentIndex = 0;
      state.userAnswer = null;
      state.submittedAnswer = null;
      state.isCorrect = null;
    }
  },
  
  actions: {
    async startQuiz({ commit, dispatch }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_MODE', 'normal');
        const response = await quizService.startQuiz();
        commit('SET_SESSION_ID', response.data.sessionId);
        
        // Get the first question
        await dispatch('getCurrentQuestion', { index: 0, mode: 'normal' });
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to start quiz');
        console.error('Error starting quiz:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async startReview({ commit, dispatch }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_MODE', 'review');
        const response = await quizService.startReview();
        commit('SET_SESSION_ID', response.data.sessionId);

        // Get the first question
        await dispatch('getCurrentQuestion', { index: 0, mode: 'review' });

        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to start review');
        console.error('Error starting review:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async startSpacedReview({ commit, dispatch }, options = {}) {
      try {
        commit('SET_LOADING', true);
        commit('SET_MODE', 'spaced_review');
        const response = await reviewService.startSpacedReview(options);
        commit('SET_SESSION_ID', response.data.sessionId);

        await dispatch('getCurrentQuestion', { index: 0, mode: 'spaced_review' });

        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to start spaced review');
        console.error('Error starting spaced review:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async getCurrentQuestion({ commit, state }, { index, mode } = {}) {
      try {
        commit('SET_LOADING', true);
        const currentMode = mode || state.mode;
        const response = await quizService.getCurrentQuestion(index !== undefined ? index : state.currentIndex, currentMode);
        
        commit('SET_CURRENT_QUESTION', {
          question: response.data.data,
          currentIndex: response.data.currentIndex,
          totalQuestions: response.data.totalQuestions,
          userAnswer: response.data.userAnswer?.answer
        });
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get current question');
        console.error('Error getting current question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async submitAnswer({ commit, state, dispatch }) {
      try {
        if (!state.userAnswer) {
          commit('SET_ERROR', 'Please select an answer first');
          return null;
        }
        
        commit('SET_LOADING', true);
        const response = await quizService.submitAnswer(
          state.currentQuestion.id,
          state.userAnswer,
          state.mode
        );
        
        commit('SET_SUBMITTED_ANSWER', {
          userAnswer: response.data.data.userAnswer,
          isCorrect: response.data.data.isCorrect
        });
        
        // Update navigator data after submitting an answer
        dispatch('fetchNavigator');
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to submit answer');
        console.error('Error submitting answer:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    setUserAnswer({ commit }, answer) {
      commit('SET_USER_ANSWER', answer);
    },
    
    async nextQuestion({ commit, state, dispatch }) {
      try {
        commit('SET_LOADING', true);
        const response = await quizService.getNextQuestion(state.currentIndex, state.mode);
        
        if (response.data.isLast) {
          commit('SET_ERROR', 'This is the last question');
          return response.data;
        }
        
        await dispatch('getCurrentQuestion', { 
          index: response.data.currentIndex,
          mode: state.mode
        });
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get next question');
        console.error('Error getting next question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async previousQuestion({ commit, state, dispatch }) {
      try {
        commit('SET_LOADING', true);
        const response = await quizService.getPreviousQuestion(state.currentIndex, state.mode);
        
        if (response.data.isFirst) {
          commit('SET_ERROR', 'This is the first question');
          return response.data;
        }
        
        await dispatch('getCurrentQuestion', { 
          index: response.data.currentIndex,
          mode: state.mode
        });
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to get previous question');
        console.error('Error getting previous question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async jumpToQuestion({ commit, state }, index) {
      try {
        commit('SET_LOADING', true);
        const response = await quizService.jumpToQuestion(index, state.mode);
        
        commit('SET_CURRENT_QUESTION', {
          question: response.data.data,
          currentIndex: response.data.currentIndex,
          totalQuestions: response.data.totalQuestions,
          userAnswer: response.data.userAnswer?.answer
        });
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to jump to question');
        console.error('Error jumping to question:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async resetQuiz({ commit }) {
      try {
        commit('SET_LOADING', true);
        await quizService.resetQuiz();
        commit('RESET_QUIZ_STATE');
        commit('SET_ERROR', null);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to reset quiz');
        console.error('Error resetting quiz:', error);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchNavigator({ commit, state }, { filter, type, search } = {}) {
      try {
        commit('SET_LOADING', true);
        const response = await quizService.getQuestionNavigator(
          filter || 'all',
          type || 'all',
          search || ''
        );
        
        commit('SET_NAVIGATOR', response.data.data);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch navigator');
        console.error('Error fetching navigator:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  getters: {
    currentQuestion: state => state.currentQuestion,
    currentIndex: state => state.currentIndex,
    totalQuestions: state => state.totalQuestions,
    userAnswer: state => state.userAnswer,
    submittedAnswer: state => state.submittedAnswer,
    isCorrect: state => state.isCorrect,
    isAnswerSubmitted: state => state.submittedAnswer !== null,
    mode: state => state.mode,
    isLoading: state => state.loading,
    error: state => state.error,
    navigator: state => state.navigator,
    progress: state => (state.currentIndex / (state.totalQuestions || 1)) * 100,
    sessionId: state => state.sessionId
  }
};