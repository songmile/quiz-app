<template>
  <div class="error-analysis">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-exclamation-triangle"></i> 错误分析
        </div>
        <div class="card-actions">
          <button 
            class="action-button" 
            @click="generateErrorAnalysis"
            :disabled="isLoading || isGenerating || !userAnswer"
            title="生成错误分析"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isGenerating }"></i>
          </button>
        </div>
      </div>
      
      <div class="card-content">
        <div class="loading-spinner" v-if="isLoading">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>加载中...</span>
        </div>
        
        <div class="generating-indicator" v-else-if="isGenerating">
          <i class="fas fa-cog fa-spin"></i>
          <span>正在生成错误分析，请稍候...</span>
          <div class="progress-bar">
            <div class="progress-indeterminate"></div>
          </div>
        </div>
        
        <div class="user-answer-required" v-else-if="!userAnswer">
          <i class="fas fa-info-circle"></i>
          <p>需要提交错误答案后才能进行分析</p>
        </div>
        
        <div class="empty-state" v-else-if="!errorAnalysis">
          <i class="fas fa-search"></i>
          <p>尚未生成错误分析</p>
          <button class="generate-button" @click="generateErrorAnalysis">
            分析错误
          </button>
        </div>
        
        <div class="analysis-content" v-else>
          <div class="analysis-metadata">
            <span class="answered">
              错误答案: <strong>{{ errorAnalysis.userAnswer }}</strong>
            </span>
            <span class="generated-time">
              生成时间: {{ formatDate(errorAnalysis.generatedAt) }}
            </span>
          </div>
          
          <div class="analysis-text" :style="{ fontSize: `${errorFontSize}px` }">
            {{ errorAnalysis.analysis }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorAnalysis',
  props: {
    questionId: {
      type: String,
      required: true
    },
    userAnswer: {
      type: String,
      default: ''
    },
    isCorrect: {
      type: Boolean,
      default: null
    }
  },
  data() {
    return {
      checkInterval: null
    };
  },
  computed: {
    errorAnalysis() {
      return this.$store.getters['ai/errorAnalysis'];
    },
    isLoading() {
      return this.$store.getters['ai/isLoading'];
    },
    isGenerating() {
      return this.$store.getters['ai/generatingStatus'].errorAnalysis;
    },
    errorFontSize() {
      return this.$store.getters['settings/fontSettings']?.error_font_size || 13;
    },
    shouldShow() {
      // Only show error analysis for incorrect answers
      return this.userAnswer && this.isCorrect === false;
    }
  },
  methods: {
    async fetchErrorAnalysis() {
      if (!this.userAnswer) return;
      
      await this.$store.dispatch('ai/getErrorAnalysis', {
        questionId: this.questionId,
        userAnswer: this.userAnswer
      });
    },
    async generateErrorAnalysis() {
      if (!this.userAnswer) return;
      
      // Start generation
      const response = await this.$store.dispatch('ai/generateErrorAnalysis', {
        questionId: this.questionId,
        userAnswer: this.userAnswer,
        force: false
      });
      
      if (response) {
        // Start polling for analysis
        this.startPolling();
      }
    },
    startPolling() {
      // Clear existing interval if any
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      
      // Check every 3 seconds until analysis is found or max attempts reached
      let attempts = 0;
      const maxAttempts = 20; // About 1 minute of polling
      
      this.checkInterval = setInterval(async () => {
        attempts++;
        await this.fetchErrorAnalysis();
        
        // Stop polling if analysis is found or max attempts reached
        if (this.errorAnalysis || attempts >= maxAttempts) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }, 3000);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  },
  mounted() {
    // Fetch error analysis when component mounts
    if (this.shouldShow) {
      this.fetchErrorAnalysis();
    }
  },
  beforeUnmount() {
    // Clear interval when component is unmounted
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  watch: {
    // Fetch new analysis when question or answer changes
    questionId() {
      this.$store.commit('ai/SET_ERROR_ANALYSIS', null);
      if (this.shouldShow) {
        this.fetchErrorAnalysis();
      }
    },
    userAnswer() {
      this.$store.commit('ai/SET_ERROR_ANALYSIS', null);
      if (this.shouldShow) {
        this.fetchErrorAnalysis();
      }
    },
    isCorrect(newValue) {
      if (newValue === false && this.userAnswer) {
        this.fetchErrorAnalysis();
      }
    }
  }
};
</script>

<style scoped>
.error-analysis {
  margin-bottom: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff8f8;
  border-bottom: 1px solid #ffe0e0;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e53935;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  background-color: transparent;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #e53935;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background-color: rgba(229, 57, 53, 0.1);
}

.action-button:disabled {
  color: #ef9a9a;
  cursor: not-allowed;
}

.card-content {
  padding: 20px;
  min-height: 200px;
}

.loading-spinner, .generating-indicator, .empty-state, .user-answer-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  gap: 15px;
  color: #6c757d;
}

.loading-spinner i, .generating-indicator i, .empty-state i, .user-answer-required i {
  font-size: 2rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-indeterminate {
  position: absolute;
  height: 100%;
  width: 30%;
  background-color: #e53935;
  animation: indeterminate 1.5s infinite ease-in-out;
}

@keyframes indeterminate {
  0% {
    left: -30%;
  }
  100% {
    left: 100%;
  }
}

.generate-button {
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #d32f2f;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.analysis-metadata {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
}

.analysis-text {
  line-height: 1.6;
  white-space: pre-line;
  color: #333;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #e53935;
}
</style>