<template>
  <div class="question-import">
    <div class="import-header">
      <h1 class="page-title">导入题目</h1>
      <router-link to="/questions" class="back-button">
        <i class="fas fa-arrow-left"></i> 返回题目列表
      </router-link>
    </div>
    
    <div class="import-container">
      <div class="import-tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'text' }"
          @click="activeTab = 'text'"
        >
          <i class="fas fa-file-alt"></i> 文本导入
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'json' }"
          @click="activeTab = 'json'"
        >
          <i class="fas fa-file-code"></i> JSON导入
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'ai' }"
          @click="activeTab = 'ai'"
        >
          <i class="fas fa-robot"></i> AI智能导入
        </button>
      </div>
      
      <div class="import-content">
        <!-- Text Import -->
        <div class="import-panel" v-if="activeTab === 'text'">
          <div class="panel-description">
            <p>您可以粘贴纯文本格式的题目内容，系统将自动解析并导入。</p>
            <p>支持的格式示例:</p>
            <pre class="format-example">单选题：Spring Boot 的核心特性是什么？
A. 自动配置
B. 微服务支持
C. 分布式事务
D. 响应式编程
答案：A
解析：Spring Boot 的核心特性是自动配置（Auto-configuration）。

多选题：Spring Boot Starter 包含哪些组件？
A. 依赖管理
B. 自动配置
C. 预定义配置
D. 应用程序监控
答案：A,B,C
解析：Spring Boot Starter 包含依赖管理、自动配置和预定义配置组件。</pre>
          </div>
          
          <div class="import-form">
            <div class="form-group">
              <label for="text-content">题目内容</label>
              <textarea 
                id="text-content" 
                v-model="textContent" 
                rows="15"
                placeholder="粘贴题目内容..."
              ></textarea>
            </div>
            
            <div class="import-options">
              <div class="bank-selection">
                <label>导入到题库：</label>
                <select v-model="selectedBankId">
                  <option value="">不指定题库</option>
                  <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
                </select>
              </div>

              <div class="mode-selection">
                <label>导入模式：</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="importMode" value="add">
                    <span>添加模式（保留现有题目）</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="importMode" value="replace">
                    <span>替换模式（清空现有题库）</span>
                  </label>
                </div>
              </div>

              <button
                class="import-button"
                @click="importTextContent"
                :disabled="isImporting || !textContent"
              >
                <i class="fas fa-spinner fa-spin" v-if="isImporting"></i>
                <i class="fas fa-file-import" v-else></i>
                开始导入
              </button>
            </div>
          </div>
        </div>
        
        <!-- JSON Import -->
        <div class="import-panel" v-if="activeTab === 'json'">
          <div class="panel-description">
            <p>您可以粘贴JSON格式的题目内容进行导入，或选择上传JSON文件。</p>
            <p>JSON格式示例:</p>
            <pre class="format-example">[
  {
    "type": "单选题",
    "text": "Spring Boot 的核心特性是什么？",
    "options": [
      { "letter": "A", "text": "自动配置" },
      { "letter": "B", "text": "微服务支持" },
      { "letter": "C", "text": "分布式事务" },
      { "letter": "D", "text": "响应式编程" }
    ],
    "answer": "A",
    "explanation": "Spring Boot 的核心特性是自动配置（Auto-configuration）。"
  }
]</pre>
          </div>
          
          <div class="import-form">
            <div class="form-group">
              <label for="json-content">JSON内容</label>
              <textarea 
                id="json-content" 
                v-model="jsonContent" 
                rows="15"
                placeholder="粘贴JSON内容..."
              ></textarea>
            </div>
            
            <div class="file-upload">
              <label for="json-file">或者上传JSON文件</label>
              <div class="file-input-wrapper">
                <input 
                  type="file" 
                  id="json-file" 
                  accept=".json"
                  @change="handleFileUpload"
                >
                <div class="file-name" v-if="selectedFileName">
                  {{ selectedFileName }}
                </div>
              </div>
            </div>
            
            <div class="import-options">
              <div class="bank-selection">
                <label>导入到题库：</label>
                <select v-model="selectedBankId">
                  <option value="">不指定题库</option>
                  <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
                </select>
              </div>

              <div class="mode-selection">
                <label>导入模式：</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="importMode" value="add">
                    <span>添加模式（保留现有题目）</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="importMode" value="replace">
                    <span>替换模式（清空现有题库）</span>
                  </label>
                </div>
              </div>

              <button
                class="import-button"
                @click="importJsonContent"
                :disabled="isImporting || (!jsonContent && !selectedFile)"
              >
                <i class="fas fa-spinner fa-spin" v-if="isImporting"></i>
                <i class="fas fa-file-import" v-else></i>
                开始导入
              </button>
            </div>
          </div>
        </div>
        
        <!-- AI Import -->
        <div class="import-panel" v-if="activeTab === 'ai'">
          <div class="panel-description">
            <p>使用AI智能导入功能，您可以粘贴任意格式的题目内容，AI将自动解析并导入。</p>
            <p>AI优势：</p>
            <ul>
              <li>支持多种格式的题目内容解析</li>
              <li>自动识别题目类型、选项和答案</li>
              <li>处理不规则格式的内容</li>
              <li>修正常见的格式问题</li>
            </ul>
            <p class="note">注意：AI解析可能需要较长时间，请耐心等待。大量题目建议分批导入。</p>
          </div>
          
          <div class="import-form">
            <div class="form-group">
              <label for="ai-content">题目内容</label>
              <textarea 
                id="ai-content" 
                v-model="aiContent" 
                rows="15"
                placeholder="粘贴任意格式的题目内容..."
              ></textarea>
            </div>
            
            <div class="import-options">
              <div class="bank-selection">
                <label>导入到题库：</label>
                <select v-model="selectedBankId">
                  <option value="">不指定题库</option>
                  <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
                </select>
              </div>

              <div class="mode-selection">
                <label>导入模式：</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="importMode" value="add">
                    <span>添加模式（保留现有题目）</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="importMode" value="replace">
                    <span>替换模式（清空现有题库）</span>
                  </label>
                </div>
              </div>

              <button
                class="import-button"
                @click="importWithAI"
                :disabled="isImporting || !aiContent"
              >
                <i class="fas fa-spinner fa-spin" v-if="isImporting"></i>
                <i class="fas fa-robot" v-else></i>
                AI智能导入
              </button>
            </div>
          </div>
        </div>
        
        <!-- Import Status -->
        <div class="import-status" v-if="importStatus">
          <div class="status-header">
            <h3>导入状态</h3>
            <div 
              class="status-badge"
              :class="{
                'processing': importStatus.status === 'processing',
                'completed': importStatus.status === 'completed',
                'failed': importStatus.status === 'failed'
              }"
            >
              {{ getStatusText(importStatus.status) }}
            </div>
          </div>
          
          <div class="progress-container" v-if="importStatus.status === 'processing'">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${importStatus.progress.percentage}%` }"
              ></div>
            </div>
            <div class="progress-text">
              {{ importStatus.progress.percentage }}% 
              ({{ importStatus.progress.processed }}/{{ importStatus.progress.total }})
            </div>
          </div>
          
          <div class="status-details">
            <div class="detail-item">
              <div class="detail-label">导入模式</div>
              <div class="detail-value">{{ importStatus.mode === 'add' ? '添加模式' : '替换模式' }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">已导入题目</div>
              <div class="detail-value">{{ importStatus.importedCount || 0 }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">处理时间</div>
              <div class="detail-value">{{ importStatus.duration || 0 }} 秒</div>
            </div>
          </div>
          
          <div class="error-list" v-if="importStatus.errors && importStatus.errors.length > 0">
            <h4>错误信息</h4>
            <ul>
              <li v-for="(error, index) in importStatus.errors" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>
          
          <div class="status-actions">
            <button class="back-to-list" @click="goToQuestionList">
              <i class="fas fa-list"></i> 查看题目列表
            </button>
            <button class="close-status" @click="clearImportStatus">
              <i class="fas fa-times"></i> 关闭状态
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import questionService from '@/services/questionService';

export default {
  name: 'QuestionImport',
  data() {
    return {
      activeTab: 'text',
      textContent: '',
      jsonContent: '',
      aiContent: '',
      importMode: 'add',
      isImporting: false,
      importStatus: null,
      selectedFile: null,
      selectedFileName: '',
      statusCheckInterval: null,
      selectedBankId: ''
    };
  },
  computed: {
    banks() {
      return this.$store.getters['banks/allBanks'] || [];
    }
  },
  created() {
    this.$store.dispatch('banks/fetchBanks');
  },
  methods: {
    async importTextContent() {
      if (!this.textContent || this.isImporting) return;

      try {
        this.isImporting = true;
        this.clearImportStatus();

        // 使用本地解析器导入文本（无需AI，速度快）
        const response = await this.$store.dispatch('questions/importTextQuestions', {
          content: this.textContent,
          mode: this.importMode,
          bankId: this.selectedBankId || null
        });

        if (response) {
          this.importStatus = {
            status: 'completed',
            mode: this.importMode,
            importedCount: response.added,
            duration: '0',
            progress: {
              total: response.parsed,
              processed: response.parsed,
              percentage: '100'
            }
          };

          this.$notify({
            type: 'success',
            title: '导入成功',
            text: `解析 ${response.parsed} 道题目，成功导入 ${response.added} 道，${response.duplicates} 道重复被跳过`
          });
        }
      } catch (error) {
        console.error('Error importing questions:', error);
        this.$notify({
          type: 'error',
          title: '导入失败',
          text: error.response?.data?.message || error.message || '无法导入题目'
        });

        this.importStatus = {
          status: 'failed',
          mode: this.importMode,
          errors: [error.response?.data?.message || error.message || '未知错误']
        };
      } finally {
        this.isImporting = false;
      }
    },
    async importJsonContent() {
      if ((!this.jsonContent && !this.selectedFile) || this.isImporting) return;
      
      try {
        this.isImporting = true;
        this.clearImportStatus();
        
        let questions = [];
        
        // Parse JSON content from textarea or file
        if (this.jsonContent) {
          questions = JSON.parse(this.jsonContent);
        } else if (this.selectedFile) {
          const fileContent = await this.readFileContent(this.selectedFile);
          questions = JSON.parse(fileContent);
        }
        
        // Validate questions
        if (!Array.isArray(questions)) {
          throw new Error('JSON格式错误，应为题目数组');
        }
        
        // Import questions
        const response = await this.$store.dispatch('questions/importQuestions', {
          questions,
          mode: this.importMode,
          bankId: this.selectedBankId || null
        });
        
        if (response) {
          this.importStatus = {
            status: 'completed',
            mode: this.importMode,
            importedCount: response.added,
            duration: '0',
            progress: {
              total: questions.length,
              processed: questions.length,
              percentage: '100'
            }
          };
          
          this.$notify({
            type: 'success',
            title: '导入成功',
            text: `成功导入 ${response.added} 道题目，${response.duplicates} 道重复题目被跳过`
          });
        }
      } catch (error) {
        console.error('Error importing questions:', error);
        this.$notify({
          type: 'error',
          title: '导入失败',
          text: error.message || '无法导入题目'
        });
        
        this.importStatus = {
          status: 'failed',
          mode: this.importMode,
          errors: [error.message || '未知错误']
        };
      } finally {
        this.isImporting = false;
      }
    },
    async importWithAI() {
      if (!this.aiContent || this.isImporting) return;
      
      try {
        this.isImporting = true;
        this.clearImportStatus();
        
        // Start AI import with content
        const response = await this.$store.dispatch('questions/importQuestionsWithAI', {
          content: this.aiContent,
          mode: this.importMode,
          bankId: this.selectedBankId || null
        });
        
        if (response && response.importId) {
          // Start polling for import status
          this.startStatusPolling(response.importId);
        }
      } catch (error) {
        console.error('Error importing questions with AI:', error);
        this.$notify({
          type: 'error',
          title: '导入失败',
          text: error.message || '无法导入题目'
        });
        this.isImporting = false;
      }
    },
    startStatusPolling(importId) {
      // Clear any existing interval
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
      }
      
      // Check status every 2 seconds
      this.statusCheckInterval = setInterval(async () => {
        try {
          const response = await this.fetchImportStatus(importId);
          
          if (!response) return;
          
          this.importStatus = response;
          
          // Stop polling when import is completed or failed
          if (response.status === 'completed' || response.status === 'failed') {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
            this.isImporting = false;
            
            if (response.status === 'completed') {
              this.$notify({
                type: 'success',
                title: '导入成功',
                text: `成功导入 ${response.importedCount} 道题目`
              });
            } else {
              this.$notify({
                type: 'error',
                title: '导入失败',
                text: '导入过程中发生错误，请查看详细信息'
              });
            }
          }
        } catch (error) {
          console.error('Error checking import status:', error);
        }
      }, 2000);
    },
    async fetchImportStatus(importId) {
      const response = await questionService.getImportStatus(importId);
      return response.data.data;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.jsonContent = ''; // Clear textarea when file is selected
    },
    async readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
      });
    },
    getStatusText(status) {
      switch (status) {
        case 'processing':
          return '处理中';
        case 'completed':
          return '已完成';
        case 'failed':
          return '失败';
        default:
          return '未知状态';
      }
    },
    clearImportStatus() {
      this.importStatus = null;
      
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
        this.statusCheckInterval = null;
      }
    },
    goToQuestionList() {
      this.$router.push('/questions');
    }
  },
  beforeUnmount() {
    // Clear interval when component is unmounted
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }
};
</script>

<style scoped>
.question-import {
  max-width: 1000px;
  margin: 0 auto;
}

.import-header {
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

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #e9ecef;
  color: #212529;
}

.import-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.import-tabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  flex: 1;
  padding: 15px;
  border: none;
  background-color: #f8f9fa;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-button:hover:not(.active) {
  background-color: #e9ecef;
}

.tab-button.active {
  background-color: white;
  font-weight: 500;
  color: #1e88e5;
  box-shadow: inset 0 -2px 0 #1e88e5;
}

.import-content {
  padding: 20px;
}

.import-panel {
  display: flex;
  gap: 30px;
}

.panel-description {
  flex: 1;
  max-width: 350px;
}

.panel-description p {
  margin-top: 0;
  margin-bottom: 15px;
  line-height: 1.5;
  color: #495057;
}

.panel-description ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.panel-description li {
  margin-bottom: 8px;
  color: #495057;
}

.format-example {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 0.85rem;
  overflow: auto;
  max-height: 250px;
  white-space: pre-wrap;
  color: #333;
  border: 1px solid #dee2e6;
}

.note {
  font-size: 0.9rem;
  color: #dc3545;
  font-style: italic;
}

.import-form {
  flex: 2;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.file-upload {
  margin-bottom: 20px;
}

.file-upload label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input-wrapper input[type="file"] {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
  font-size: 0.9rem;
}

.file-name {
  font-size: 0.9rem;
  color: #1e88e5;
  word-break: break-all;
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bank-selection {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.bank-selection label {
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.bank-selection select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 200px;
  background-color: white;
  cursor: pointer;
}

.bank-selection select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.mode-selection {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mode-selection label {
  font-weight: 500;
  color: #495057;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.import-button {
  align-self: flex-end;
  padding: 10px 20px;
  background-color: #1e88e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.import-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.import-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.import-status {
  margin-top: 30px;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  border: 1px solid #dee2e6;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.status-badge.processing {
  background-color: #ff9800;
}

.status-badge.completed {
  background-color: #4caf50;
}

.status-badge.failed {
  background-color: #f44336;
}

.progress-container {
  margin-bottom: 20px;
}

.progress-bar {
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background-color: #1e88e5;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: right;
}

.status-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  flex: 1;
  min-width: 150px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  padding: 10px 15px;
}

.detail-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.error-list {
  margin-bottom: 20px;
  border: 1px solid #f8d7da;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff5f5;
}

.error-list h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #721c24;
  font-size: 1rem;
}

.error-list ul {
  padding-left: 20px;
  margin: 0;
}

.error-list li {
  color: #721c24;
  margin-bottom: 5px;
}

.status-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.back-to-list, .close-status {
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  border: none;
}

.back-to-list {
  background-color: #1e88e5;
  color: white;
}

.back-to-list:hover {
  background-color: #1976d2;
}

.close-status {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.close-status:hover {
  background-color: #e9ecef;
  color: #495057;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .import-panel {
    flex-direction: column;
    gap: 20px;
  }
  
  .panel-description {
    max-width: none;
  }
}
</style>