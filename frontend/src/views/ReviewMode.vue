<template>
  <div class="review-mode">
    <div class="review-header">
      <h1 class="mode-title">{{ reviewModeLabel }}</h1>
      <div class="review-actions">
        <div class="mode-switch">
          <button class="mode-btn" :class="{ active: reviewType === 'wrong' }" @click="switchMode('wrong')">
            错题复习
          </button>
          <button class="mode-btn" :class="{ active: reviewType === 'spaced' }" @click="switchMode('spaced')">
            间隔复习
            <span class="due-badge" v-if="dueCount > 0">{{ dueCount }}</span>
          </button>
        </div>
        <button class="action-button restart" @click="startReview">
          <i class="fas fa-redo"></i> 重新开始
        </button>
        <button class="action-button home" @click="goHome">
          <i class="fas fa-home"></i> 返回首页
        </button>
      </div>
    </div>
    
    <!-- Question Jump Navigator -->
    <div class="question-navigator" v-if="totalQuestions > 1">
      <div class="navigator-header">
        <span class="navigator-title">题目导航</span>
      </div>
      <div class="jump-controls">
        <div class="jump-input">
          <input 
            type="number" 
            v-model.number="jumpToIndex"
            min="1"
            :max="totalQuestions"
            @keyup.enter="handleJumpToQuestion"
          >
          <span class="total-indicator">/ {{ totalQuestions }}</span>
        </div>
        <button 
          class="jump-button" 
          @click="handleJumpToQuestion"
          :disabled="!isValidJumpIndex"
        >
          跳转
        </button>
      </div>
      
      <div class="question-quick-nav">
        <button
          v-if="totalQuestions > 10"
          class="quick-nav-button nav-skip"
          :disabled="currentIndex < 10"
          @click="jumpToQuestion(currentIndex - 10)"
        >-10</button>
        <template v-for="(item, idx) in getQuickNavItems()" :key="idx">
          <span v-if="item.type === 'ellipsis'" class="nav-ellipsis">...</span>
          <button
            v-else
            class="quick-nav-button"
            :class="{ 'active': currentIndex + 1 === item.value }"
            @click="jumpToQuestion(item.value - 1)"
          >{{ item.value }}</button>
        </template>
        <button
          v-if="totalQuestions > 10"
          class="quick-nav-button nav-skip"
          :disabled="currentIndex >= totalQuestions - 10"
          @click="jumpToQuestion(currentIndex + 10)"
        >+10</button>
      </div>
    </div>
    
    <div class="review-progress" v-if="totalQuestions > 0">
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-text">
        进度: {{ currentIndex + 1 }} / {{ totalQuestions }} ({{ progress.toFixed(0) }}%)
      </div>
    </div>
    
    <div class="review-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>加载中...</span>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="retry-button" @click="startReview">重试</button>
      </div>
      
      <!-- Empty State - No Wrong Questions -->
      <div v-else-if="noWrongQuestions" class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>太棒了！你目前没有错题需要复习。</p>
        <button class="quiz-button" @click="goToQuiz">去答题</button>
      </div>
      
      <!-- Empty State - Not Started -->
      <div v-else-if="!currentQuestion" class="empty-state">
        <i class="fas fa-history"></i>
        <p>复习错题，巩固你的 Spring Boot 知识！</p>
        <button class="start-button" @click="startReview">开始复习</button>
      </div>
      
      <!-- Question Card -->
      <QuestionCard
        v-else
        :question="currentQuestion"
        :current-index="currentIndex"
        :total-questions="totalQuestions"
        :is-first="currentIndex === 0"
        :is-last="currentIndex === totalQuestions - 1"
        :initial-answer="userAnswer"
        :submitted-answer="submittedAnswer"
        :correct-answer="correctAnswer"
        :is-correct="isCorrect"
        @update:answer="updateAnswer"
        @submit="submitAnswer"
        @next="nextQuestion"
        @previous="previousQuestion"
      />
      
      <!-- Note Panel -->
      <NotePanel v-if="currentQuestion" :questionId="currentQuestion.id" />

      <!-- AI Components -->
      <div v-if="currentQuestion" class="ai-components">
        <!-- Components that show immediately when question loads -->
        <div class="immediate-components">
          <!-- Knowledge Tree - Always shows -->
          <KnowledgeTree :questionId="currentQuestion.id" />
          
          <!-- Design Process - Always shows -->
          <DesignProcess :questionId="currentQuestion.id" />
        </div>
        
        <!-- Components that only show after answering -->
        <div v-if="submittedAnswer" class="post-answer-components">
          <!-- AI Explanation -->
          <AIExplanation :questionId="currentQuestion.id" />
          
          <!-- Error Analysis (only if answer is incorrect) -->
          <ErrorAnalysis 
            v-if="isCorrect === false"
            :questionId="currentQuestion.id" 
            :userAnswer="submittedAnswer"
            :isCorrect="isCorrect"
          />
          
          <!-- Variant Question -->
          <VariantQuestion :questionId="currentQuestion.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import QuestionCard from '@/components/quiz/QuestionCard.vue';
import NotePanel from '@/components/quiz/NotePanel.vue';

const AIExplanation = defineAsyncComponent(() => import('@/components/ai/AIExplanation.vue'));
const ErrorAnalysis = defineAsyncComponent(() => import('@/components/ai/ErrorAnalysis.vue'));
const VariantQuestion = defineAsyncComponent(() => import('@/components/ai/VariantQuestion.vue'));
const KnowledgeTree = defineAsyncComponent(() => import('@/components/ai/KnowledgeTree.vue'));
const DesignProcess = defineAsyncComponent(() => import('@/components/ai/DesignProcess.vue'));

export default {
  name: 'ReviewMode',
  components: {
    QuestionCard,
    AIExplanation,
    ErrorAnalysis,
    VariantQuestion,
    KnowledgeTree,
    DesignProcess,
    NotePanel
  },
  data() {
    return {
      noWrongQuestions: false,
      jumpToIndex: 1,
      reviewType: 'wrong'
    };
  },
  computed: {
    currentQuestion() {
      return this.$store.getters['quiz/currentQuestion'];
    },
    currentIndex() {
      return this.$store.getters['quiz/currentIndex'];
    },
    totalQuestions() {
      return this.$store.getters['quiz/totalQuestions'];
    },
    userAnswer() {
      return this.$store.getters['quiz/userAnswer'];
    },
    submittedAnswer() {
      return this.$store.getters['quiz/submittedAnswer'];
    },
    isCorrect() {
      return this.$store.getters['quiz/isCorrect'];
    },
    correctAnswer() {
      return this.currentQuestion?.answer || '';
    },
    isLoading() {
      return this.$store.getters['quiz/isLoading'];
    },
    error() {
      return this.$store.getters['quiz/error'];
    },
    progress() {
      return this.$store.getters['quiz/progress'];
    },
    isValidJumpIndex() {
      return this.jumpToIndex >= 1 && this.jumpToIndex <= this.totalQuestions;
    },
    dueCount() {
      return this.$store.getters['review/dueCount'];
    },
    reviewModeLabel() {
      return this.reviewType === 'spaced' ? '间隔复习' : '错题复习';
    }
  },
  methods: {
    async startReview() {
      try {
        // Reset AI data
        this.$store.dispatch('ai/resetAiData');

        // Reset noWrongQuestions flag
        this.noWrongQuestions = false;

        if (this.reviewType === 'spaced') {
          // Start spaced review session
          await this.$store.dispatch('quiz/startSpacedReview');
        } else {
          // Start wrong-question review session
          await this.$store.dispatch('quiz/startReview');
        }

        // Reset jump index
        this.jumpToIndex = 1;
      } catch (error) {
        // Check if error is due to no wrong questions
        if (error.response && error.response.data.message) {
          if (error.response.data.message.includes('暂无错题') ||
              error.response.data.message.includes('暂无待复习')) {
            this.noWrongQuestions = true;
          }
        }
      }
    },
    updateAnswer(answer) {
      this.$store.dispatch('quiz/setUserAnswer', answer);
    },
    async submitAnswer() {
      await this.$store.dispatch('quiz/submitAnswer');
    },
    async nextQuestion() {
      // Reset AI data
      this.$store.dispatch('ai/resetAiData');
      
      await this.$store.dispatch('quiz/nextQuestion');
      
      // Update jumpToIndex to match current index
      this.jumpToIndex = this.currentIndex + 1;
    },
    async previousQuestion() {
      // Reset AI data
      this.$store.dispatch('ai/resetAiData');
      
      await this.$store.dispatch('quiz/previousQuestion');
      
      // Update jumpToIndex to match current index
      this.jumpToIndex = this.currentIndex + 1;
    },
    async jumpToQuestion(index) {
      if (index < 0 || index >= this.totalQuestions) return;
      
      // Reset AI data
      this.$store.dispatch('ai/resetAiData');
      
      await this.$store.dispatch('quiz/jumpToQuestion', index);
      
      // Update jumpToIndex to match current index
      this.jumpToIndex = this.currentIndex + 1;
    },
    handleJumpToQuestion() {
      if (!this.isValidJumpIndex) return;
      
      // Convert from 1-based (UI) to 0-based (internal)
      this.jumpToQuestion(this.jumpToIndex - 1);
    },
    getQuickNavItems() {
      const maxButtons = 10;

      if (this.totalQuestions <= maxButtons) {
        return Array.from({ length: this.totalQuestions }, (_, i) => ({ type: 'number', value: i + 1 }));
      }

      const indexes = new Set();
      indexes.add(1);
      indexes.add(this.totalQuestions);

      const currentPage = this.currentIndex + 1;
      const range = 3;
      for (let i = Math.max(2, currentPage - range); i <= Math.min(this.totalQuestions - 1, currentPage + range); i++) {
        indexes.add(i);
      }

      const sorted = [...indexes].sort((a, b) => a - b);
      const items = [];
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
          items.push({ type: 'ellipsis' });
        }
        items.push({ type: 'number', value: sorted[i] });
      }
      return items;
    },
    switchMode(mode) {
      this.reviewType = mode;
      this.startReview();
    },
    goHome() {
      this.$router.push('/');
    },
    goToQuiz() {
      this.$router.push('/quiz');
    }
  },
  async created() {
    // Fetch due count for spaced review badge
    this.$store.dispatch('review/fetchDueCount');

    try {
      if (!this.currentQuestion) {
        await this.startReview();
      } else {
        this.jumpToIndex = this.currentIndex + 1;
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        if (error.response.data.message.includes('暂无错题') ||
            error.response.data.message.includes('暂无待复习')) {
          this.noWrongQuestions = true;
        }
      }
    }
  },
  beforeUnmount() {
    // End the session when leaving
    this.$store.dispatch('stats/endSession');
  },
  watch: {
    // Watch for currentIndex changes (from external sources)
    currentIndex(newIndex) {
      // Update jump index when current index changes (add 1 for UI)
      this.jumpToIndex = newIndex + 1;
    }
  }
};
</script>

<style scoped>
.review-mode {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mode-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-button.restart {
  background-color: #ff9800;
  color: white;
}

.action-button.restart:hover {
  background-color: #f57c00;
}

.action-button.home {
  background-color: #f5f5f5;
  color: #333;
}

.action-button.home:hover {
  background-color: #e0e0e0;
}

/* Question Navigator Styles */
.question-navigator {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 20px;
}

.navigator-header {
  margin-bottom: 10px;
}

.navigator-title {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.jump-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.jump-input {
  position: relative;
  flex: 1;
  max-width: 200px;
}

.jump-input input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.jump-input input:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.total-indicator {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
}

.jump-button {
  padding: 10px 15px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.jump-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.jump-button:disabled {
  background-color: #ef9a9a;
  cursor: not-allowed;
}

.question-quick-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-nav-button {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-nav-button:hover:not(.active) {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.quick-nav-button.active {
  background-color: #e53935;
  color: white;
  border-color: #e53935;
}

.quick-nav-button.nav-skip {
  width: auto;
  padding: 0 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
}

.quick-nav-button.nav-skip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 36px;
  color: #adb5bd;
  font-weight: bold;
  user-select: none;
}

.review-progress {
  margin-bottom: 20px;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress {
  height: 100%;
  background-color: #e53935;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: right;
}

.review-container {
  position: relative;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 15px;
  text-align: center;
  color: #6c757d;
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 3rem;
}

.error-state i {
  color: #dc3545;
}

.empty-state i.fa-check-circle {
  color: #28a745;
}

.empty-state p, .error-state p {
  font-size: 1.2rem;
  max-width: 500px;
  margin: 0 auto;
}

.retry-button, .start-button, .quiz-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button {
  background-color: #dc3545;
  color: white;
}

.retry-button:hover {
  background-color: #c82333;
}

.start-button {
  background-color: #e53935;
  color: white;
}

.start-button:hover {
  background-color: #d32f2f;
}

.quiz-button {
  background-color: #1e88e5;
  color: white;
}

.quiz-button:hover {
  background-color: #1976d2;
}

.ai-components {
  margin-top: 30px;
}

.immediate-components {
  margin-bottom: 30px;
}

.post-answer-components {
  border-top: 1px dashed #dee2e6;
  padding-top: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .jump-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .jump-input {
    max-width: none;
  }
}
</style>