<template>
  <div class="question-list">
    <div class="list-header">
      <h1 class="page-title">题目列表</h1>
      <div class="header-actions">
        <router-link to="/questions/import" class="action-button primary">
          <i class="fas fa-file-import"></i> 导入题目
        </router-link>
        <button class="action-button success" @click="showAddQuestionModal = true">
          <i class="fas fa-plus"></i> 新建题目
        </button>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索题目..." 
          @input="debounceSearch"
        >
        <i class="fas fa-search"></i>
      </div>
      
      <div class="type-filter">
        <select v-model="selectedType" @change="applyFilters">
          <option value="">所有题型</option>
          <option value="单选题">单选题</option>
          <option value="多选题">多选题</option>
          <option value="判断题">判断题</option>
          <option value="填空题">填空题</option>
          <option value="简答题">简答题</option>
        </select>
      </div>

      <div class="type-filter">
        <select v-model="selectedBankId" @change="applyFilters">
          <option value="">所有题库</option>
          <option value="null">未分组</option>
          <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
        </select>
      </div>

      <div class="type-filter">
        <select v-model="selectedTag" @change="applyFilters">
          <option value="">所有标签</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>

      <button class="clear-filter" @click="clearFilters" :disabled="!hasFilters">
        <i class="fas fa-times"></i> 清除筛选
      </button>
    </div>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载中...</span>
    </div>
    
    <div class="error-state" v-else-if="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button class="retry-button" @click="fetchQuestions">重试</button>
    </div>
    
    <div class="empty-state" v-else-if="!hasQuestions">
      <i class="fas fa-inbox"></i>
      <p v-if="hasFilters">没有符合条件的题目</p>
      <p v-else>题库中还没有题目</p>
      <div class="empty-actions">
        <router-link to="/questions/import" class="action-button primary">
          <i class="fas fa-file-import"></i> 导入题目
        </router-link>
        <button class="action-button success" @click="showAddQuestionModal = true">
          <i class="fas fa-plus"></i> 新建题目
        </button>
      </div>
    </div>
    
    <div class="questions-container" v-else>
      <div class="questions-grid">
        <div 
          v-for="question in questions" 
          :key="question.id"
          class="question-item"
          @click="selectQuestion(question)"
        >
          <div class="question-header">
            <div class="question-type">{{ question.type }}</div>
            <div class="question-actions">
              <button 
                class="edit-button" 
                @click.stop="editQuestion(question)"
                title="编辑题目"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="delete-button" 
                @click.stop="confirmDeleteQuestion(question)"
                title="删除题目"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="question-text">
            {{ truncateText(question.text, 100) }}
          </div>
          
          <div class="question-footer">
            <div class="question-id">ID: {{ truncateText(question.id, 12) }}</div>
            <div class="question-date">{{ formatDate(question.createdAt) }}</div>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-button"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="page-info">
          第 {{ currentPage }} / {{ totalPages }} 页
        </div>
        
        <button 
          class="page-button"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <!-- Add/Edit Question Modal -->
    <div class="modal" v-if="showAddQuestionModal || showEditQuestionModal">
      <div class="modal-overlay" @click="closeModals"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ showEditQuestionModal ? '编辑题目' : '新建题目' }}</h3>
          <button class="close-button" @click="closeModals">
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
          <button class="cancel-button" @click="closeModals">取消</button>
          <button 
            class="save-button" 
            @click="saveQuestion"
            :disabled="!isQuestionValid || isSaving"
          >
            <i class="fas fa-spinner fa-spin" v-if="isSaving"></i>
            {{ showEditQuestionModal ? '保存修改' : '创建题目' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-overlay" @click="showDeleteModal = false"></div>
      <div class="modal-container delete-confirm">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="close-button" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="confirm-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>确定要删除这道题目吗？此操作不可撤销。</p>
          </div>
          
          <div class="question-preview" v-if="questionToDelete">
            <div class="preview-type">{{ questionToDelete.type }}</div>
            <div class="preview-text">{{ truncateText(questionToDelete.text, 150) }}</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" @click="showDeleteModal = false">取消</button>
          <button 
            class="delete-button" 
            @click="deleteQuestion"
            :disabled="isDeleting"
          >
            <i class="fas fa-spinner fa-spin" v-if="isDeleting"></i>
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionList',
  data() {
    return {
      searchQuery: '',
      selectedType: '',
      selectedBankId: '',
      selectedTag: '',
      currentPage: 1,
      questions: [],
      totalPages: 1,
      showAddQuestionModal: false,
      showEditQuestionModal: false,
      showDeleteModal: false,
      editingQuestion: {
        type: '单选题',
        text: '',
        options: [
          { letter: 'A', text: '' },
          { letter: 'B', text: '' },
          { letter: 'C', text: '' },
          { letter: 'D', text: '' }
        ],
        answer: '',
        explanation: ''
      },
      questionToDelete: null,
      isSaving: false,
      isDeleting: false,
      searchTimeout: null
    };
  },
  computed: {
    isLoading() {
      return this.$store.getters['questions/isLoading'];
    },
    error() {
      return this.$store.getters['questions/error'];
    },
    hasQuestions() {
      return this.questions && this.questions.length > 0;
    },
    hasFilters() {
      return this.searchQuery || this.selectedType || this.selectedBankId || this.selectedTag;
    },
    banks() {
      return this.$store.getters['banks/allBanks'];
    },
    allTags() {
      return this.$store.state.questions.allTags || [];
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
    }
  },
  methods: {
    async fetchQuestions() {
      const filters = {
        search: this.searchQuery,
        type: this.selectedType
      };
      if (this.selectedBankId) filters.bankId = this.selectedBankId;
      if (this.selectedTag) filters.tags = this.selectedTag;

      await this.$store.dispatch('questions/fetchQuestions', {
        page: this.currentPage,
        limit: 12,
        filters
      });
      
      this.questions = this.$store.getters['questions/allQuestions'];
      this.totalPages = this.$store.getters['questions/totalPages'];
    },
    debounceSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    applyFilters() {
      this.currentPage = 1;
      this.fetchQuestions();
    },
    clearFilters() {
      this.searchQuery = '';
      this.selectedType = '';
      this.selectedBankId = '';
      this.selectedTag = '';
      this.applyFilters();
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      
      this.currentPage = page;
      this.fetchQuestions();
    },
    selectQuestion(question) {
      this.$router.push(`/questions/${question.id}`);
    },
    editQuestion(question) {
      this.editingQuestion = JSON.parse(JSON.stringify(question));
      
      // Ensure options array exists for choice questions
      if ((question.type === '单选题' || question.type === '多选题') && 
          (!this.editingQuestion.options || this.editingQuestion.options.length === 0)) {
        this.editingQuestion.options = [
          { letter: 'A', text: '' },
          { letter: 'B', text: '' },
          { letter: 'C', text: '' },
          { letter: 'D', text: '' }
        ];
      }
      
      this.showEditQuestionModal = true;
    },
    confirmDeleteQuestion(question) {
      this.questionToDelete = question;
      this.showDeleteModal = true;
    },
    async deleteQuestion() {
      if (!this.questionToDelete) return;
      
      try {
        this.isDeleting = true;
        
        await this.$store.dispatch('questions/deleteQuestion', this.questionToDelete.id);
        
        // Close modal
        this.showDeleteModal = false;
        this.questionToDelete = null;
        
        // Refresh questions
        this.fetchQuestions();
        
        // Show success message
        this.$notify({
          type: 'success',
          title: '删除成功',
          text: '题目已删除'
        });
      } catch (error) {
        console.error('Error deleting question:', error);
        this.$notify({
          type: 'error',
          title: '删除失败',
          text: error.message || '无法删除题目'
        });
      } finally {
        this.isDeleting = false;
      }
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
    async saveQuestion() {
      try {
        this.isSaving = true;
        
        // Prepare question data
        const questionData = { ...this.editingQuestion };
        
        // Remove options if not a choice question
        if (questionData.type !== '单选题' && questionData.type !== '多选题') {
          questionData.options = [];
        }
        
        if (this.showEditQuestionModal) {
          // Update existing question
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
        } else {
          // Create new question
          await this.$store.dispatch('questions/createQuestion', questionData);
          
          // Show success message
          this.$notify({
            type: 'success',
            title: '创建成功',
            text: '题目已创建'
          });
        }
        
        // Close modal
        this.closeModals();
        
        // Refresh questions
        this.fetchQuestions();
      } catch (error) {
        console.error('Error saving question:', error);
        this.$notify({
          type: 'error',
          title: this.showEditQuestionModal ? '更新失败' : '创建失败',
          text: error.message || '无法保存题目'
        });
      } finally {
        this.isSaving = false;
      }
    },
    closeModals() {
      this.showAddQuestionModal = false;
      this.showEditQuestionModal = false;
      this.resetEditingQuestion();
    },
    resetEditingQuestion() {
      this.editingQuestion = {
        type: '单选题',
        text: '',
        options: [
          { letter: 'A', text: '' },
          { letter: 'B', text: '' },
          { letter: 'C', text: '' },
          { letter: 'D', text: '' }
        ],
        answer: '',
        explanation: ''
      };
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
    truncateText(text, maxLength) {
      if (!text) return '';
      
      if (text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    }
  },
  created() {
    this.fetchQuestions();
    this.$store.dispatch('banks/fetchBanks');
    this.$store.dispatch('questions/fetchAllTags');
  }
};
</script>

<style scoped>
.question-list {
  max-width: 1200px;
  margin: 0 auto;
}

.list-header {
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
}

.action-button.primary {
  background-color: #1e88e5;
  color: white;
}

.action-button.primary:hover {
  background-color: #1976d2;
}

.action-button.success {
  background-color: #4caf50;
  color: white;
}

.action-button.success:hover {
  background-color: #388e3c;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  padding-left: 40px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.type-filter select {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 150px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.type-filter select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.clear-filter {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.clear-filter:hover:not(:disabled) {
  background-color: #e9ecef;
  color: #495057;
}

.clear-filter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.error-state p, .empty-state p {
  font-size: 1.2rem;
  max-width: 500px;
  margin: 0 auto;
}

.retry-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #dc3545;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #c82333;
}

.empty-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.questions-container {
  margin-bottom: 30px;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.question-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.question-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-type {
  background-color: #e3f2fd;
  color: #1e88e5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.edit-button, .delete-button {
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
}

.edit-button {
  background-color: #e3f2fd;
  color: #1e88e5;
}

.edit-button:hover {
  background-color: #bbdefb;
}

.delete-button {
  background-color: #ffebee;
  color: #e53935;
}

.delete-button:hover {
  background-color: #ffcdd2;
}

.question-text {
  flex: 1;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #333;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.page-button {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.page-button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #6c757d;
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

.modal-container.delete-confirm {
  max-width: 500px;
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

.cancel-button, .save-button, .delete-button {
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

.delete-button {
  background-color: #e53935;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.delete-button:disabled {
  background-color: #ef9a9a;
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

/* Delete confirm styles */
.confirm-message {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.confirm-message i {
  font-size: 2rem;
  color: #e53935;
}

.confirm-message p {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.question-preview {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.preview-type {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}

.preview-text {
  line-height: 1.5;
  color: #333;
}
</style>