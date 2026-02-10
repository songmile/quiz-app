<template>
  <div class="question-detail">
    <div class="detail-header">
      <h1 class="page-title">题目详情</h1>
      <div class="header-actions">
        <router-link to="/questions" class="action-button">
          <i class="fas fa-arrow-left"></i> 返回题目列表
        </router-link>
        <button class="action-button primary" @click="editQuestion">
          <i class="fas fa-edit"></i> 编辑题目
        </button>
      </div>
    </div>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载中...</span>
    </div>
    
    <div class="error-state" v-else-if="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button class="retry-button" @click="fetchQuestion">重试</button>
    </div>
    
    <div class="question-container" v-else-if="question">
      <div class="question-card">
        <div class="card-header">
          <div class="question-type">{{ question.type }}</div>
          <div class="question-id">ID: {{ question.id }}</div>
        </div>
        
        <div class="question-content" :style="{ fontSize: `${questionFontSize}px` }">
          {{ question.text }}
        </div>
        
        <div class="question-options" v-if="hasOptions">
          <div 
            v-for="option in question.options" 
            :key="option.letter"
            class="option"
            :class="{ 'correct': isOptionCorrect(option.letter) }"
          >
            <div class="option-marker">{{ option.letter }}</div>
            <div class="option-text">{{ option.text }}</div>
          </div>
        </div>
        
        <div class="answer-section">
          <div class="answer-label">正确答案:</div>
          <div class="answer-value">{{ question.answer }}</div>
        </div>
        
        <div class="explanation-section" v-if="question.explanation">
          <div class="explanation-label">解析:</div>
          <div class="explanation-content" :style="{ fontSize: `${explanationFontSize}px` }">
            {{ question.explanation }}
          </div>
        </div>
        
        <div class="meta-info">
          <div class="meta-item">
            <span class="meta-label">创建时间:</span>
            <span class="meta-value">{{ formatDate(question.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">上次更新:</span>
            <span class="meta-value">{{ formatDate(question.updatedAt) }}</span>
          </div>
        </div>
      </div>
      
      <!-- AI Features Section -->
      <div class="ai-features">
        <!-- AI Explanation -->
        <AIExplanation :questionId="question.id" />
        
        <!-- Knowledge Tree -->
        <KnowledgeTree :questionId="question.id" />
        
        <!-- Variant Question -->
        <VariantQuestion :questionId="question.id" />
        
        <!-- Design Process -->
        <DesignProcess :questionId="question.id" />
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <i class="fas fa-question-circle"></i>
      <p>未找到题目</p>
      <router-link to="/questions" class="nav-button">
        返回题目列表
      </router-link>
    </div>
    
    <!-- Edit Question Modal -->
    <div class="modal" v-if="showEditModal">
      <div class="modal-overlay" @click="showEditModal = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>编辑题目</h3>
          <button class="close-button" @click="showEditModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="question-type">题目类型</label>
            <select id="question-type" v-model="editingQuestion.type">
              <option value="单选题">单选题</option>
              <option value="多选题">多选题</option>
              <option value="判断题">判断题</option>
              <option value="填空题">填空题</option>
              <option value="简答题">简答题</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="question-text">题目内容</label>
            <textarea 
              id="question-text" 
              v-model="editingQuestion.text" 
              rows="5"
              placeholder="输入题目内容..."
            ></textarea>
          </div>
          
          <!-- Options for choice questions -->
          <div class="form-group" v-if="isChoiceQuestion">
            <label>选项</label>
            <div 
              v-for="(option, index) in editingQuestion.options" 
              :key="index"
              class="option-input-group"
            >
              <div class="option-letter">{{ option.letter }}</div>
              <input 
                type="text" 
                v-model="option.text" 
                :placeholder="`选项 ${option.letter} 内容...`"
              >
              <button 
                class="remove-option" 
                @click="removeOption(index)"
                :disabled="editingQuestion.options.length <= 2"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <button class="add-option" @click="addOption">
              <i class="fas fa-plus"></i> 添加选项
            </button>
          </div>
          
          <div class="form-group">
            <label for="question-answer">正确答案</label>
            <input 
              type="text" 
              id="question-answer" 
              v-model="editingQuestion.answer"
              :placeholder="getAnswerPlaceholder()"
            >
            <div class="answer-help" v-if="isChoiceQuestion">
              {{ getAnswerHelpText() }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="question-explanation">解析</label>
            <textarea 
              id="question-explanation" 
              v-model="editingQuestion.explanation" 
              rows="4"
              placeholder="题目解析（可选）..."
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" @click="showEditModal = false">取消</button>
          <button 
            class="save-button" 
            @click="saveQuestion"
            :disabled="!isQuestionValid || isSaving"
          >
            <i class="fas fa-spinner fa-spin" v-if="isSaving"></i>
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

const AIExplanation = defineAsyncComponent(() => import('@/components/ai/AIExplanation.vue'));
const KnowledgeTree = defineAsyncComponent(() => import('@/components/ai/KnowledgeTree.vue'));
const VariantQuestion = defineAsyncComponent(() => import('@/components/ai/VariantQuestion.vue'));
const DesignProcess = defineAsyncComponent(() => import('@/components/ai/DesignProcess.vue'));

export default {
  name: 'QuestionDetail',
  components: {
    AIExplanation,
    KnowledgeTree,
    VariantQuestion,
    DesignProcess
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showEditModal: false,
      editingQuestion: {
        type: '',
        text: '',
        options: [],
        answer: '',
        explanation: ''
      },
      isSaving: false
    };
  },
  computed: {
    question() {
      return this.$store.getters['questions/currentQuestion'];
    },
    isLoading() {
      return this.$store.getters['questions/isLoading'];
    },
    error() {
      return this.$store.getters['questions/error'];
    },
    hasOptions() {
      return this.question && this.question.options && this.question.options.length > 0;
    },
    isChoiceQuestion() {
      return this.editingQuestion.type === '单选题' || this.editingQuestion.type === '多选题';
    },
    isQuestionValid() {
      const { type, text, options, answer } = this.editingQuestion;
      
      if (!text || !answer) return false;
      
      if (type === '单选题' || type === '多选题') {
        // Check if all options have content
        if (options.some(opt => !opt.text)) return false;
        
        // Check if answer is valid
        if (type === '单选题') {
          // Single choice should have one letter
          return /^[A-Za-z]$/.test(answer);
        } else {
          // Multiple choice should have comma-separated letters
          return /^[A-Za-z](,[A-Za-z])*$/.test(answer);
        }
      }
      
      return true;
    },
    // Font sizes from store
    questionFontSize() {
      return this.$store.getters['settings/questionFontSize'] || 14;
    },
    optionFontSize() {
      return this.$store.getters['settings/optionFontSize'] || 13;
    },
    explanationFontSize() {
      return this.$store.getters['settings/explanationFontSize'] || 13;
    }
  },
  methods: {
    async fetchQuestion() {
      await this.$store.dispatch('questions/fetchQuestion', this.id);
    },
    isOptionCorrect(letter) {
      if (!this.question || !this.question.answer) return false;
      
      const answers = this.question.answer.split(',');
      return answers.includes(letter);
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
    },
    editQuestion() {
      if (!this.question) return;
      
      this.editingQuestion = JSON.parse(JSON.stringify(this.question));
      
      // Ensure options array exists for choice questions
      if ((this.question.type === '单选题' || this.question.type === '多选题') && 
          (!this.editingQuestion.options || this.editingQuestion.options.length === 0)) {
        this.editingQuestion.options = [
          { letter: 'A', text: '' },
          { letter: 'B', text: '' },
          { letter: 'C', text: '' },
          { letter: 'D', text: '' }
        ];
      }
      
      this.showEditModal = true;
    },
    addOption() {
      const nextLetter = String.fromCharCode(
        'A'.charCodeAt(0) + this.editingQuestion.options.length
      );
      
      this.editingQuestion.options.push({
        letter: nextLetter,
        text: ''
      });
    },
    removeOption(index) {
      if (this.editingQuestion.options.length <= 2) return;
      
      this.editingQuestion.options.splice(index, 1);
      
      // Reassign letters
      this.editingQuestion.options.forEach((option, idx) => {
        option.letter = String.fromCharCode('A'.charCodeAt(0) + idx);
      });
    },
    getAnswerPlaceholder() {
      const { type } = this.editingQuestion;
      
      switch (type) {
        case '单选题':
          return 'A, B, C 或 D...';
        case '多选题':
          return 'A,B,C... (用逗号分隔)';
        case '判断题':
          return '对 或 错';
        case '填空题':
        case '简答题':
          return '输入正确答案...';
        default:
          return '输入正确答案...';
      }
    },
    getAnswerHelpText() {
      const { type } = this.editingQuestion;
      
      switch (type) {
        case '单选题':
          return '请输入选项字母，例如 A';
        case '多选题':
          return '请输入选项字母，用逗号分隔，例如 A,C,D';
        default:
          return '';
      }
    },
    async saveQuestion() {
      try {
        this.isSaving = true;
        
        // Prepare question data
        const questionData = { ...this.editingQuestion };
        
        // Remove options if not a choice question
        if (questionData.type !== '单选题' && questionData.type !== '多选题') {
          questionData.options = [];
        }
        
        // Update question
        await this.$store.dispatch('questions/updateQuestion', {
          id: questionData.id,
          data: questionData
        });
        
        // Show success message
        this.$notify({
          type: 'success',
          title: '更新成功',
          text: '题目已更新'
        });
        
        // Close modal
        this.showEditModal = false;
        
        // Refresh question
        this.fetchQuestion();
      } catch (error) {
        console.error('Error saving question:', error);
        this.$notify({
          type: 'error',
          title: '更新失败',
          text: error.message || '无法更新题目'
        });
      } finally {
        this.isSaving = false;
      }
    }
  },
  created() {
    this.fetchQuestion();
  },
  watch: {
    id(newId) {
      this.fetchQuestion();
    }
  }
};
</script>

<style scoped>
.question-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  text-decoration: none;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
}

.action-button:hover {
  background-color: #e9ecef;
}

.action-button.primary {
  background-color: #1e88e5;
  color: white;
  border: none;
}

.action-button.primary:hover {
  background-color: #1976d2;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

.error-state p, .empty-state p {
  font-size: 1.2rem;
  max-width: 500px;
  margin: 0 auto;
}

.retry-button, .nav-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.retry-button {
  background-color: #dc3545;
  color: white;
}

.retry-button:hover {
  background-color: #c82333;
}

.nav-button {
  background-color: #1e88e5;
  color: white;
}

.nav-button:hover {
  background-color: #1976d2;
}

.question-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.question-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.question-type {
  background-color: #e3f2fd;
  color: #1e88e5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-id {
  font-size: 0.8rem;
  color: #6c757d;
}

.question-content {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 20px;
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
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s;
}

.option.correct {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
}

.option-marker {
  flex-shrink: 0;
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
  transition: all 0.2s;
}

.option.correct .option-marker {
  background-color: #4caf50;
  color: white;
}

.option-text {
  flex-grow: 1;
  line-height: 1.4;
}

.answer-section, .explanation-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.answer-label, .explanation-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.answer-value {
  color: #1e88e5;
  font-weight: 500;
  font-size: 1.1rem;
}

.explanation-content {
  line-height: 1.5;
  white-space: pre-line;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #6c757d;
}

.meta-label {
  margin-right: 5px;
}

.ai-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-button {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button, .save-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

.save-button {
  background-color: #1e88e5;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.save-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #1e88e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.remove-option {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: #ffebee;
  color: #e53935;
  flex-shrink: 0;
}

.remove-option:hover:not(:disabled) {
  background-color: #ffcdd2;
}

.remove-option:disabled {
  background-color: #f5f5f5;
  color: #bdbdbd;
  cursor: not-allowed;
}

.add-option {
  padding: 8px 15px;
  border: 1px dashed #1e88e5;
  border-radius: 4px;
  background-color: #e3f2fd;
  color: #1e88e5;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  width: fit-content;
  margin-top: 10px;
}

.add-option:hover {
  background-color: #bbdefb;
}

.answer-help {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
