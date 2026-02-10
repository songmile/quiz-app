<template>
  <div class="ai-explanation">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-robot"></i> AI 解析
        </div>
        <div class="card-actions">
          <button 
            class="action-button" 
            @click="generateExplanation"
            :disabled="isLoading || isGenerating"
            title="生成 AI 解析"
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
          <span>正在生成解析，请稍候...</span>
          <div class="progress-bar">
            <div class="progress-indeterminate"></div>
          </div>
        </div>
        
        <div class="empty-state" v-else-if="!explanation">
          <i class="fas fa-lightbulb"></i>
          <p>尚未生成 AI 解析</p>
          <button class="generate-button" @click="generateExplanation">
            生成解析
          </button>
        </div>
        
        <div class="explanation-content" v-else>
          <div class="explanation-metadata">
            <span class="generated-time">
              生成时间: {{ formatDate(explanation.generatedAt) }}
            </span>
          </div>
          
          <div class="explanation-text" :style="{ fontSize: `${aiFontSize}px` }">
            {{ explanation.explanation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIExplanation',
  props: {
    questionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      checkInterval: null
    };
  },
  computed: {
    explanation() {
      return this.$store.getters['ai/explanation'];
    },
    isLoading() {
      return this.$store.getters['ai/isLoading'];
    },
    isGenerating() {
      return this.$store.getters['ai/generatingStatus'].explanation;
    },
    aiFontSize() {
      return this.$store.getters['settings/fontSettings']?.ai_font_size || 13;
    }
  },
  methods: {
    async fetchExplanation() {
      await this.$store.dispatch('ai/getExplanation', this.questionId);
    },
    async generateExplanation() {
      // Start generation
      const response = await this.$store.dispatch('ai/generateExplanation', {
        questionId: this.questionId,
        force: false // Set to true to regenerate even if one exists
      });
      
      if (response) {
        // Start polling for explanation
        this.startPolling();
      }
    },
    startPolling() {
      // Clear existing interval if any
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      
      // Check every 3 seconds until explanation is found or max attempts reached
      let attempts = 0;
      const maxAttempts = 20; // About 1 minute of polling
      
      this.checkInterval = setInterval(async () => {
        attempts++;
        await this.fetchExplanation();
        
        // Stop polling if explanation is found or max attempts reached
        if (this.explanation || attempts >= maxAttempts) {
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
    // Fetch explanation when component mounts
    this.fetchExplanation();
  },
  beforeUnmount() {
    // Clear interval when component is unmounted
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  watch: {
    // Fetch new explanation when question changes
    questionId(newId) {
      this.$store.commit('ai/SET_EXPLANATION', null);
      this.fetchExplanation();
    }
  }
};
</script>

<style scoped>
.ai-explanation {
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
  background-color: #f0f7ff;
  border-bottom: 1px solid #d1e3ff;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e88e5;
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
  color: #1e88e5;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background-color: rgba(30, 136, 229, 0.1);
}

.action-button:disabled {
  color: #90caf9;
  cursor: not-allowed;
}

.card-content {
  padding: 20px;
  min-height: 200px;
}

.loading-spinner, .generating-indicator, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  gap: 15px;
  color: #6c757d;
}

.loading-spinner i, .generating-indicator i, .empty-state i {
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
  background-color: #1e88e5;
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
  background-color: #1e88e5;
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
  background-color: #1976d2;
}

.explanation-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.explanation-metadata {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

.explanation-text {
  line-height: 1.6;
  white-space: pre-line;
  color: #333;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #1e88e5;
}
</style>