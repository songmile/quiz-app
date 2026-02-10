<template>
  <div class="variant-question">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-code-branch"></i> 变种题目
        </div>
        <div class="card-actions">
          <button 
            class="action-button" 
            @click="generateVariant"
            :disabled="isLoading || isGenerating"
            title="生成变种题目"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isGenerating }"></i>
          </button>
          <button 
            class="action-button" 
            @click="addToQuestionBank"
            :disabled="isLoading || !variant || addingToBank"
            title="添加到题库"
          >
            <i class="fas fa-plus" :class="{ 'fa-spin': addingToBank }"></i>
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
          <span>正在生成变种题目，请稍候...</span>
          <div class="progress-bar">
            <div class="progress-indeterminate"></div>
          </div>
        </div>
        
        <div class="empty-state" v-else-if="!variant">
          <i class="fas fa-code-branch"></i>
          <p>尚未生成变种题目</p>
          <button class="generate-button" @click="generateVariant">
            生成变种题
          </button>
        </div>
        
        <div class="variant-content" v-else>
          <div class="variant-metadata">
            <span class="generated-time">
              生成时间: {{ formatDate(variant.generatedAt) }}
            </span>
          </div>
          
          <div class="question-card">
            <div class="question-type-badge">{{ variant.type }}</div>
            
            <div class="question-text" :style="{ fontSize: `${variantFontSize}px` }">
              {{ variant.text }}
            </div>
            
            <div class="question-options" v-if="hasOptions">
              <div 
                v-for="option in variant.options" 
                :key="option.letter"
                class="option"
              >
                <div class="option-marker">{{ option.letter }}</div>
                <div class="option-text">{{ option.text }}</div>
              </div>
            </div>
            
            <div class="question-answer">
              <div class="answer-label">正确答案:</div>
              <div class="answer-value">{{ variant.answer }}</div>
            </div>
            
            <div class="question-explanation" v-if="variant.explanation">
              <div class="explanation-label">解析:</div>
              <div class="explanation-content">{{ variant.explanation }}</div>
            </div>
            
            <div class="question-relation" v-if="variant.relation">
              <div class="relation-label">与原题关系:</div>
              <div class="relation-content">{{ variant.relation }}</div>
            </div>
          </div>
          
          <div class="variant-actions">
            <button class="add-button" @click="addToQuestionBank" :disabled="addingToBank">
              <i class="fas fa-plus-circle" :class="{ 'fa-spin': addingToBank }"></i>
              添加到题库
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantQuestion',
  props: {
    questionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      checkInterval: null,
      addingToBank: false
    };
  },
  computed: {
    variant() {
      return this.$store.getters['ai/variant'];
    },
    isLoading() {
      return this.$store.getters['ai/isLoading'];
    },
    isGenerating() {
      return this.$store.getters['ai/generatingStatus'].variant;
    },
    variantFontSize() {
      return this.$store.getters['settings/fontSettings']?.variant_font_size || 13;
    },
    hasOptions() {
      return this.variant && this.variant.options && this.variant.options.length > 0;
    }
  },
  methods: {
    async fetchVariant() {
      await this.$store.dispatch('ai/getVariant', this.questionId);
    },
    async generateVariant() {
      // Start generation
      const response = await this.$store.dispatch('ai/generateVariant', {
        questionId: this.questionId,
        force: false
      });
      
      if (response) {
        // Start polling for variant
        this.startPolling();
      }
    },
    startPolling() {
      // Clear existing interval if any
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      
      // Check every 3 seconds until variant is found or max attempts reached
      let attempts = 0;
      const maxAttempts = 20; // About 1 minute of polling
      
      this.checkInterval = setInterval(async () => {
        attempts++;
        await this.fetchVariant();
        
        // Stop polling if variant is found or max attempts reached
        if (this.variant || attempts >= maxAttempts) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }, 3000);
    },
    async addToQuestionBank() {
      if (!this.variant || this.addingToBank) return;
      
      try {
        this.addingToBank = true;
        
        const response = await this.$store.dispatch('ai/addVariantToQuestions', this.questionId);
        
        if (response) {
          this.$notify({
            type: 'success',
            title: '添加成功',
            text: '变种题目已添加到题库'
          });
        }
      } catch (error) {
        this.$notify({
          type: 'error',
          title: '添加失败',
          text: error.message || '无法添加变种题目到题库'
        });
      } finally {
        this.addingToBank = false;
      }
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
    // Fetch variant when component mounts
    this.fetchVariant();
  },
  beforeUnmount() {
    // Clear interval when component is unmounted
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  watch: {
    // Fetch new variant when question changes
    questionId(newId) {
      this.$store.commit('ai/SET_VARIANT', null);
      this.fetchVariant();
    }
  }
};
</script>

<style scoped>
.variant-question {
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
  background-color: #fff0f8;
  border-bottom: 1px solid #ffd6e7;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #d81b60;
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
  color: #d81b60;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background-color: rgba(216, 27, 96, 0.1);
}

.action-button:disabled {
  color: #f48fb1;
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
  height: 200px;
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
  background-color: #d81b60;
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
  background-color: #d81b60;
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
  background-color: #c2185b;
}

.variant-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.variant-metadata {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

.question-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.question-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #d81b60;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-text {
  margin-bottom: 20px;
  line-height: 1.5;
  white-space: pre-line;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: flex-start;
  padding: 10px 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.option-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 10px;
  font-size: 0.9rem;
}

.option-text {
  flex: 1;
  line-height: 1.4;
}

.question-answer, .question-explanation, .question-relation {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.answer-label, .explanation-label, .relation-label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #495057;
}

.answer-value {
  color: #d81b60;
  font-weight: 500;
}

.explanation-content, .relation-content {
  line-height: 1.5;
  white-space: pre-line;
  color: #495057;
}

.variant-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.add-button {
  background-color: #d81b60;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.add-button:hover:not(:disabled) {
  background-color: #c2185b;
}

.add-button:disabled {
  background-color: #f8bbd0;
  cursor: not-allowed;
}
</style>