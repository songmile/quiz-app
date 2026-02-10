<template>
  <div class="settings-api">
    <h1 class="page-title">API 设置</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载设置中...</span>
    </div>
    
    <div class="settings-content" v-else>
      <div class="api-description">
        <div class="info-card">
          <h2>API 配置说明</h2>
          <p>本应用使用 AI 模型 API 来生成题目解析、错误分析、知识树等内容。您需要配置 AI API 密钥才能使用这些功能。</p>
          <p>支持的 API 类型：</p>
          <ul>
            <li>通义千问 API (支持各种模型，如 Qwen/Qwen2.5-7B-Instruct 等)</li>
            <li>OpenAI API (支持 gpt-3.5-turbo, gpt-4 等)</li>
            <li>其他兼容 OpenAI 格式的 API</li>
          </ul>
          <div class="tips">
            <h3>使用提示</h3>
            <p>1. 您可以配置多个 API，系统会自动调度使用</p>
            <p>2. 主要 API 用于生成解析和错误分析</p>
            <p>3. 知识树 API 用于生成知识图谱</p>
            <p>4. 设计流程 API 用于生成设计思路分析</p>
          </div>
        </div>
      </div>
      
      <div class="api-configs">
        <div 
          v-for="(config, index) in apiConfigs" 
          :key="index"
          class="api-config-card"
        >
          <div class="config-header">
            <h2>API 配置 {{ index + 1 }}</h2>
            <div class="config-actions">
              <button 
                class="test-button" 
                @click="testConnection(index)"
                :disabled="isApiTesting[index] || !config.api_key"
                title="测试连接"
              >
                <i class="fas fa-plug" :class="{ 'fa-spin': isApiTesting[index] }"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="api-name">API 名称</label>
            <input 
              type="text" 
              :id="`api-name-${index}`" 
              v-model="editedConfigs[index].name"
              placeholder="为该API配置命名，例如：主要API"
            >
          </div>
          
          <div class="form-group">
            <label for="api-key">API 密钥</label>
            <div class="api-key-input">
              <input 
                :type="showApiKey[index] ? 'text' : 'password'" 
                :id="`api-key-${index}`" 
                v-model="editedConfigs[index].api_key"
                placeholder="输入API密钥..."
              >
              <button 
                class="toggle-visibility" 
                @click="toggleApiKeyVisibility(index)"
                type="button"
              >
                <i :class="showApiKey[index] ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="api-url">API 地址</label>
            <input 
              type="text" 
              :id="`api-url-${index}`" 
              v-model="editedConfigs[index].api_url"
              placeholder="输入API地址..."
            >
          </div>
          
          <div class="form-group">
            <label for="api-model">模型名称</label>
            <input 
              type="text" 
              :id="`api-model-${index}`" 
              v-model="editedConfigs[index].model"
              placeholder="输入模型名称..."
            >
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="chunk-size">块大小</label>
              <input 
                type="number" 
                :id="`chunk-size-${index}`" 
                v-model.number="editedConfigs[index].chunk_size"
                min="100"
                step="100"
              >
            </div>
            
            <div class="form-group half">
              <label for="max-tokens">最大 Token 数</label>
              <input 
                type="number" 
                :id="`max-tokens-${index}`" 
                v-model.number="editedConfigs[index].max_tokens"
                min="100"
                step="100"
              >
            </div>
          </div>
          
          <div class="config-actions">
            <button 
              class="save-button" 
              @click="saveApiConfig(index)"
              :disabled="isSaving"
            >
              <i class="fas fa-save"></i> 保存配置
            </button>
          </div>
          
          <div class="test-result" v-if="testResults[index]">
            <div 
              class="result-content"
              :class="{ 
                success: testResults[index].success, 
                error: !testResults[index].success 
              }"
            >
              <div class="result-icon">
                <i :class="testResults[index].success ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              </div>
              <div class="result-message">
                {{ testResults[index].message }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="assignment-card">
          <h2>功能分配</h2>
          <p>指定使用哪个 API 配置用于特定功能</p>
          
          <div class="form-group">
            <label for="explanation-api">解析和错误分析</label>
            <select id="explanation-api" v-model="functionAssignments.explanation_api_index">
              <option 
                v-for="(config, index) in apiConfigs" 
                :key="`explanation-${index}`"
                :value="index"
                :disabled="!config.api_key"
              >
                {{ config.name || `API 配置 ${index + 1}` }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="knowledge-tree-api">知识树</label>
            <select id="knowledge-tree-api" v-model="functionAssignments.knowledge_tree_api_index">
              <option 
                v-for="(config, index) in apiConfigs" 
                :key="`knowledge-${index}`"
                :value="index"
                :disabled="!config.api_key"
              >
                {{ config.name || `API 配置 ${index + 1}` }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="design-process-api">设计流程</label>
            <select id="design-process-api" v-model="functionAssignments.design_process_api_index">
              <option 
                v-for="(config, index) in apiConfigs" 
                :key="`design-${index}`"
                :value="index"
                :disabled="!config.api_key"
              >
                {{ config.name || `API 配置 ${index + 1}` }}
              </option>
            </select>
          </div>
          
          <div class="config-actions">
            <button 
              class="save-button" 
              @click="saveFunctionAssignments"
              :disabled="isSaving"
            >
              <i class="fas fa-save"></i> 保存分配
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsApi',
  data() {
    return {
      editedConfigs: [],
      showApiKey: {},
      isApiTesting: {},
      testResults: {},
      functionAssignments: {
        explanation_api_index: 0,
        knowledge_tree_api_index: 0,
        design_process_api_index: 0
      },
      isSaving: false
    };
  },
  computed: {
    settings() {
      return this.$store.getters['settings/settings'];
    },
    apiConfigs() {
      return this.$store.getters['settings/apiConfigs'] || [];
    },
    isLoading() {
      return this.$store.getters['settings/isLoading'];
    }
  },
  methods: {
    initializeData() {
      // Copy API configs for editing
      this.editedConfigs = JSON.parse(JSON.stringify(this.apiConfigs || []));
      
      // Initialize visibility state for API keys
      this.showApiKey = {};
      this.isApiTesting = {};
      this.testResults = {};
      
      this.apiConfigs.forEach((_, index) => {
        this.showApiKey[index] = false;
        this.isApiTesting[index] = false;
        this.testResults[index] = null;
      });
      
      // Initialize function assignments
      if (this.settings) {
        this.functionAssignments = {
          explanation_api_index: this.settings.explanation_api_index || 0,
          knowledge_tree_api_index: this.settings.knowledge_tree_api_index || 0,
          design_process_api_index: this.settings.design_process_api_index || 0
        };
      }
    },
    toggleApiKeyVisibility(index) {
      this.showApiKey[index] = !this.showApiKey[index];
    },
    async testConnection(index) {
      if (this.isApiTesting[index] || !this.editedConfigs[index].api_key) {
        return;
      }
      
      try {
        this.isApiTesting[index] = true;
        this.testResults[index] = null;
        
        // Test API connection
        const response = await this.$store.dispatch('ai/testApiConnection', index);
        
        if (response) {
          this.testResults[index] = {
            success: response.status === 'success',
            message: response.message,
            data: response.data
          };
        } else {
          this.testResults[index] = {
            success: false,
            message: '测试连接失败，未收到响应'
          };
        }
      } catch (error) {
        console.error('Error testing API connection:', error);
        this.testResults[index] = {
          success: false,
          message: error.message || '测试连接失败'
        };
      } finally {
        this.isApiTesting[index] = false;
      }
    },
    async saveApiConfig(index) {
      if (this.isSaving) return;
      
      try {
        this.isSaving = true;
        
        // Save API configuration
        await this.$store.dispatch('settings/updateApiConfig', {
          index,
          config: this.editedConfigs[index]
        });
        
        this.$notify({
          type: 'success',
          title: '保存成功',
          text: 'API 配置已更新'
        });
      } catch (error) {
        console.error('Error saving API config:', error);
        this.$notify({
          type: 'error',
          title: '保存失败',
          text: error.message || '无法更新 API 配置'
        });
      } finally {
        this.isSaving = false;
      }
    },
    async saveFunctionAssignments() {
      if (this.isSaving) return;
      
      try {
        this.isSaving = true;
        
        // Save function assignments
        await this.$store.dispatch('settings/updateSettings', this.functionAssignments);
        
        this.$notify({
          type: 'success',
          title: '保存成功',
          text: '功能分配已更新'
        });
      } catch (error) {
        console.error('Error saving function assignments:', error);
        this.$notify({
          type: 'error',
          title: '保存失败',
          text: error.message || '无法更新功能分配'
        });
      } finally {
        this.isSaving = false;
      }
    }
  },
  created() {
    this.$store.dispatch('settings/fetchSettings').then(() => {
      this.initializeData();
    });
  },
  watch: {
    apiConfigs: {
      handler(newValue) {
        if (newValue) {
          this.initializeData();
        }
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.settings-api {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 25px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 15px;
  color: #6c757d;
}

.loading-state i {
  font-size: 2rem;
}

.settings-content {
  display: flex;
  gap: 30px;
}

.api-description {
  flex: 1;
  max-width: 350px;
}

.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: sticky;
  top: 80px;
}

.info-card h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  color: #333;
}

.info-card p {
  margin-bottom: 15px;
  line-height: 1.5;
  color: #495057;
}

.info-card ul {
  padding-left: 20px;
  margin-bottom: 20px;
}

.info-card li {
  margin-bottom: 8px;
  color: #495057;
}

.tips {
  background-color: #e3f2fd;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
}

.tips h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #1976d2;
}

.tips p {
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: #333;
}

.api-configs {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.api-config-card, .assignment-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.assignment-card h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.3rem;
  color: #333;
}

.assignment-card p {
  margin-bottom: 20px;
  color: #6c757d;
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

.form-group input, .form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

.api-key-input {
  display: flex;
  align-items: center;
}

.api-key-input input {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.toggle-visibility {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-left: none;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
}

.toggle-visibility:hover {
  background-color: #e9ecef;
  color: #495057;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-button, .test-button {
  padding: 8px 15px;
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

.test-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.test-button:hover:not(:disabled) {
  background-color: #e9ecef;
  color: #495057;
}

.test-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
}

.result-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.result-content.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.result-content.error {
  background-color: #ffebee;
  color: #c62828;
}

.result-icon {
  font-size: 1.5rem;
}

.result-message {
  flex: 1;
  line-height: 1.4;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .settings-content {
    flex-direction: column;
  }
  
  .api-description {
    max-width: none;
  }
  
  .info-card {
    position: static;
    margin-bottom: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
}
</style>