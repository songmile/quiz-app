<template>
  <div class="settings-font">
    <h1 class="page-title">字体设置</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载设置中...</span>
    </div>
    
    <div class="settings-content" v-else>
      <div class="settings-card">
        <div class="card-header">
          <h3>字体大小设置</h3>
        </div>
        <div class="card-body">
          <p class="card-description">
            调整应用中不同类型内容的字体大小，使其更符合您的阅读习惯。
          </p>
          
          <div class="font-settings">
            <div class="font-setting-item">
              <div class="setting-label">题目内容</div>
              <div class="setting-control">
                <div class="font-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="20" 
                    step="1" 
                    v-model.number="fontSettings.question_font_size"
                    @input="updatePreview"
                  >
                  <div class="font-size-value">{{ fontSettings.question_font_size }}px</div>
                </div>
                <div class="font-preview question-preview" :style="{ fontSize: `${fontSettings.question_font_size}px` }">
                  Spring Boot 的核心特性是什么？
                </div>
              </div>
            </div>
            
            <div class="font-setting-item">
              <div class="setting-label">选项内容</div>
              <div class="setting-control">
                <div class="font-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="18" 
                    step="1" 
                    v-model.number="fontSettings.option_font_size"
                    @input="updatePreview"
                  >
                  <div class="font-size-value">{{ fontSettings.option_font_size }}px</div>
                </div>
                <div class="font-preview option-preview" :style="{ fontSize: `${fontSettings.option_font_size}px` }">
                  <div class="preview-option">A. 自动配置</div>
                  <div class="preview-option">B. 微服务支持</div>
                  <div class="preview-option">C. 分布式事务</div>
                </div>
              </div>
            </div>
            
            <div class="font-setting-item">
              <div class="setting-label">解析内容</div>
              <div class="setting-control">
                <div class="font-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="18" 
                    step="1" 
                    v-model.number="fontSettings.explanation_font_size"
                    @input="updatePreview"
                  >
                  <div class="font-size-value">{{ fontSettings.explanation_font_size }}px</div>
                </div>
                <div class="font-preview explanation-preview" :style="{ fontSize: `${fontSettings.explanation_font_size}px` }">
                  Spring Boot 的核心特性是自动配置（Auto-configuration），它根据应用程序的依赖项自动配置Spring应用程序。
                </div>
              </div>
            </div>
            
            <div class="font-setting-item">
              <div class="setting-label">AI 解析</div>
              <div class="setting-control">
                <div class="font-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="18" 
                    step="1" 
                    v-model.number="fontSettings.ai_font_size"
                    @input="updatePreview"
                  >
                  <div class="font-size-value">{{ fontSettings.ai_font_size }}px</div>
                </div>
                <div class="font-preview ai-preview" :style="{ fontSize: `${fontSettings.ai_font_size}px` }">
                  <div class="preview-section">关键概念：自动配置、条件化配置</div>
                  <div class="preview-section">解析：Spring Boot 通过自动配置减少手动配置的需要，实现"开箱即用"的体验。</div>
                </div>
              </div>
            </div>
            
            <div class="font-setting-item">
              <div class="setting-label">错误分析</div>
              <div class="setting-control">
                <div class="font-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="18" 
                    step="1" 
                    v-model.number="fontSettings.error_font_size"
                    @input="updatePreview"
                  >
                  <div class="font-size-value">{{ fontSettings.error_font_size }}px</div>
                </div>
                <div class="font-preview error-preview" :style="{ fontSize: `${fontSettings.error_font_size}px` }">
                  <div class="preview-section">错误类型：概念混淆</div>
                  <div class="preview-section">易错原因：容易将自动配置与其他特性混淆</div>
                </div>
              </div>
            </div>
            
            <div class="font-setting-item">
              <div class="setting-label">变种题</div>
              <div class="setting-control">
                <div class="font-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="18" 
                    step="1" 
                    v-model.number="fontSettings.variant_font_size"
                    @input="updatePreview"
                  >
                  <div class="font-size-value">{{ fontSettings.variant_font_size }}px</div>
                </div>
                <div class="font-preview variant-preview" :style="{ fontSize: `${fontSettings.variant_font_size}px` }">
                  Spring Boot 的哪项特性能够根据 classpath 上存在的依赖自动配置 Spring 应用程序？
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="reset-button" @click="resetToDefaults" :disabled="isSaving">
              <i class="fas fa-undo"></i> 恢复默认
            </button>
            <button 
              class="save-button" 
              @click="saveFontSettings"
              :disabled="isSaving"
            >
              <i class="fas fa-save" v-if="!isSaving"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsFont',
  data() {
    return {
      fontSettings: {
        question_font_size: 14,
        option_font_size: 13,
        answer_font_size: 13,
        explanation_font_size: 13,
        ai_font_size: 13,
        error_font_size: 13,
        variant_font_size: 13
      },
      defaultFontSettings: {
        question_font_size: 14,
        option_font_size: 13,
        answer_font_size: 13,
        explanation_font_size: 13,
        ai_font_size: 13,
        error_font_size: 13,
        variant_font_size: 13
      },
      isSaving: false
    };
  },
  computed: {
    settings() {
      return this.$store.getters['settings/settings'];
    },
    isLoading() {
      return this.$store.getters['settings/isLoading'];
    }
  },
  methods: {
    initializeSettings() {
      if (this.settings && this.settings.font_settings) {
        const fontSettings = this.settings.font_settings;
        
        // Update font settings with values from store
        this.fontSettings = {
          question_font_size: fontSettings.question_font_size || this.defaultFontSettings.question_font_size,
          option_font_size: fontSettings.option_font_size || this.defaultFontSettings.option_font_size,
          answer_font_size: fontSettings.answer_font_size || this.defaultFontSettings.answer_font_size,
          explanation_font_size: fontSettings.explanation_font_size || this.defaultFontSettings.explanation_font_size,
          ai_font_size: fontSettings.ai_font_size || this.defaultFontSettings.ai_font_size,
          error_font_size: fontSettings.error_font_size || this.defaultFontSettings.error_font_size,
          variant_font_size: fontSettings.variant_font_size || this.defaultFontSettings.variant_font_size
        };
        
        // Also update default settings based on initial values
        this.defaultFontSettings = { ...this.fontSettings };
        
        this.updatePreview();
      }
    },
    updatePreview() {
      // This method is called when sliders are moved
      // No-op for now, but could be used for more complex preview updates
    },
    resetToDefaults() {
      this.fontSettings = { ...this.defaultFontSettings };
      this.updatePreview();
    },
    async saveFontSettings() {
      try {
        this.isSaving = true;
        
        await this.$store.dispatch('settings/updateFontSettings', this.fontSettings);
        
        this.$notify({
          type: 'success',
          title: '保存成功',
          text: '字体设置已更新'
        });
      } catch (error) {
        console.error('Error saving font settings:', error);
        this.$notify({
          type: 'error',
          title: '保存失败',
          text: error.message || '无法更新字体设置'
        });
      } finally {
        this.isSaving = false;
      }
    }
  },
  created() {
    this.$store.dispatch('settings/fetchSettings').then(() => {
      this.initializeSettings();
    });
  }
};
</script>

<style scoped>
.settings-font {
  max-width: 800px;
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

.settings-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.card-body {
  padding: 20px;
}

.card-description {
  margin-top: 0;
  margin-bottom: 20px;
  color: #6c757d;
  line-height: 1.5;
}

.font-settings {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.font-setting-item {
  display: flex;
  gap: 20px;
}

.setting-label {
  width: 100px;
  font-weight: 500;
  color: #495057;
  padding-top: 5px;
}

.setting-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.font-slider {
  display: flex;
  align-items: center;
  gap: 15px;
}

.font-slider input[type="range"] {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e9ecef;
  border-radius: 4px;
  outline: none;
}

.font-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1e88e5;
  cursor: pointer;
}

.font-slider input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1e88e5;
  cursor: pointer;
}

.font-size-value {
  width: 50px;
  text-align: center;
  font-size: 0.9rem;
  color: #495057;
}

.font-preview {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  line-height: 1.5;
}

.preview-option {
  margin-bottom: 5px;
}

.preview-option:last-child {
  margin-bottom: 0;
}

.preview-section {
  margin-bottom: 8px;
}

.preview-section:last-child {
  margin-bottom: 0;
}

.question-preview {
  font-weight: 500;
  color: #333;
}

.option-preview {
  color: #495057;
}

.explanation-preview {
  color: #1e88e5;
}

.ai-preview {
  color: #1e88e5;
  border-left: 3px solid #1e88e5;
}

.error-preview {
  color: #e53935;
  border-left: 3px solid #e53935;
}

.variant-preview {
  color: #d81b60;
  border-left: 3px solid #d81b60;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.reset-button, .save-button {
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.reset-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.reset-button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.save-button {
  background-color: #1e88e5;
  color: white;
  border: none;
}

.save-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.reset-button:disabled, .save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .font-setting-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .setting-label {
    width: auto;
    padding-top: 0;
  }
}
</style>
