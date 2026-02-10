<template>
  <div class="settings-general">
    <h1 class="page-title">通用设置</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载设置中...</span>
    </div>
    
    <div class="settings-content" v-else>
      <!-- Import Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>导入设置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="import-concurrent">最大并发请求数</label>
            <div class="input-with-info">
              <input
                type="number"
                id="import-concurrent"
                v-model.number="importSettings.import_max_concurrent"
                min="1"
                max="10"
              >
              <div class="input-info">
                使用AI导入题目时的最大并发请求数，建议值：2-5
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="import-delay">批次间延迟（秒）</label>
            <div class="input-with-info">
              <input
                type="number"
                id="import-delay"
                v-model.number="importSettings.import_batch_delay"
                min="1"
                max="10"
                step="0.5"
              >
              <div class="input-info">
                导入批次之间的延迟时间，建议值：1-3秒
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              class="save-button" 
              @click="saveImportSettings"
              :disabled="isSaving"
            >
              <i class="fas fa-save"></i>
              保存导入设置
            </button>
          </div>
        </div>
      </div>
      
      <!-- AI Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>AI功能设置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="autosave-interval">自动保存间隔（分钟）</label>
            <div class="input-with-info">
              <input
                type="number"
                id="autosave-interval"
                v-model.number="aiSettings.autosave_interval"
                min="1"
                max="60"
              >
              <div class="input-info">
                自动保存学习进度的时间间隔
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              class="save-button" 
              @click="saveAISettings"
              :disabled="isSaving"
            >
              <i class="fas fa-save"></i>
              保存AI设置
            </button>
          </div>
        </div>
      </div>
      
      <!-- Data Path Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>数据存储设置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="data-path">数据存储路径</label>
            <div class="input-with-info">
              <input
                type="text"
                id="data-path"
                v-model="dataPath"
                placeholder="例如：/path/to/data"
              >
              <div class="input-info">
                应用数据（备份、日志等）存储路径，留空使用默认路径
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              class="save-button" 
              @click="saveDataPath"
              :disabled="isSaving"
            >
              <i class="fas fa-save"></i>
              保存存储路径
            </button>
          </div>
        </div>
      </div>
      
      <!-- Reset Settings -->
      <div class="settings-card danger-zone">
        <div class="card-header">
          <h3>危险操作</h3>
        </div>
        <div class="card-body">
          <div class="danger-action">
            <div class="danger-info">
              <div class="danger-title">重置所有设置</div>
              <div class="danger-description">
                将所有设置恢复为默认值，此操作不可撤销。
              </div>
            </div>
            <button 
              class="danger-button" 
              @click="confirmResetSettings"
              :disabled="isSaving"
            >
              <i class="fas fa-exclamation-triangle"></i>
              重置设置
            </button>
          </div>
          
          <div class="danger-action">
            <div class="danger-info">
              <div class="danger-title">重置统计数据</div>
              <div class="danger-description">
                删除所有学习统计数据，包括答题记录、正确率等信息，此操作不可撤销。
              </div>
            </div>
            <button 
              class="danger-button" 
              @click="confirmResetStats"
              :disabled="isSaving"
            >
              <i class="fas fa-exclamation-triangle"></i>
              重置统计
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div class="modal" v-if="showConfirmModal">
      <div class="modal-overlay" @click="showConfirmModal = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ confirmModal.title }}</h3>
          <button class="close-button" @click="showConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="confirm-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ confirmModal.message }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showConfirmModal = false">取消</button>
          <button 
            class="confirm-button" 
            @click="executeConfirmedAction"
            :disabled="isSaving"
          >
            <i class="fas fa-spinner fa-spin" v-if="isSaving"></i>
            {{ confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsGeneral',
  data() {
    return {
      importSettings: {
        import_max_concurrent: 2,
        import_batch_delay: 2
      },
      aiSettings: {
        autosave_interval: 5
      },
      dataPath: '',
      showConfirmModal: false,
      confirmModal: {
        title: '',
        message: '',
        confirmText: '',
        action: null
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
      if (this.settings) {
        // Initialize import settings
        this.importSettings = {
          import_max_concurrent: this.settings.import_max_concurrent || 2,
          import_batch_delay: this.settings.import_batch_delay || 2
        };
        
        // Initialize AI settings
        this.aiSettings = {
          autosave_interval: this.settings.autosave_interval || 5
        };
        
        // Initialize data path
        // In a real implementation, you would get this from the settings
        this.dataPath = this.settings.data_path || '';
      }
    },
    async saveImportSettings() {
      try {
        this.isSaving = true;
        
        await this.$store.dispatch('settings/updateImportSettings', this.importSettings);
        
        this.$notify({
          type: 'success',
          title: '保存成功',
          text: '导入设置已更新'
        });
      } catch (error) {
        console.error('Error saving import settings:', error);
        this.$notify({
          type: 'error',
          title: '保存失败',
          text: error.message || '无法更新导入设置'
        });
      } finally {
        this.isSaving = false;
      }
    },
    async saveAISettings() {
      try {
        this.isSaving = true;
        
        await this.$store.dispatch('settings/updateSettings', this.aiSettings);
        
        this.$notify({
          type: 'success',
          title: '保存成功',
          text: 'AI设置已更新'
        });
      } catch (error) {
        console.error('Error saving AI settings:', error);
        this.$notify({
          type: 'error',
          title: '保存失败',
          text: error.message || '无法更新AI设置'
        });
      } finally {
        this.isSaving = false;
      }
    },
    async saveDataPath() {
      if (!this.dataPath) {
        this.$notify({
          type: 'warning',
          title: '输入有误',
          text: '请输入有效的数据存储路径'
        });
        return;
      }
      
      try {
        this.isSaving = true;
        
        await this.$store.dispatch('settings/updateDataPath', this.dataPath);
        
        this.$notify({
          type: 'success',
          title: '保存成功',
          text: '数据存储路径已更新'
        });
      } catch (error) {
        console.error('Error saving data path:', error);
        this.$notify({
          type: 'error',
          title: '保存失败',
          text: error.message || '无法更新数据存储路径'
        });
      } finally {
        this.isSaving = false;
      }
    },
    confirmResetSettings() {
      this.confirmModal = {
        title: '确认重置设置',
        message: '确定要将所有设置恢复为默认值吗？此操作不可撤销。',
        confirmText: '确认重置',
        action: this.resetSettings
      };
      this.showConfirmModal = true;
    },
    confirmResetStats() {
      this.confirmModal = {
        title: '确认重置统计数据',
        message: '确定要删除所有学习统计数据吗？包括答题记录、正确率等信息，此操作不可撤销。',
        confirmText: '确认重置',
        action: this.resetStats
      };
      this.showConfirmModal = true;
    },
    async resetSettings() {
      try {
        this.isSaving = true;
        
        await this.$store.dispatch('settings/resetSettings');
        
        // Refresh settings data
        this.initializeSettings();
        
        this.$notify({
          type: 'success',
          title: '重置成功',
          text: '所有设置已恢复为默认值'
        });
        
        this.showConfirmModal = false;
      } catch (error) {
        console.error('Error resetting settings:', error);
        this.$notify({
          type: 'error',
          title: '重置失败',
          text: error.message || '无法重置设置'
        });
      } finally {
        this.isSaving = false;
      }
    },
    async resetStats() {
      try {
        this.isSaving = true;
        
        await this.$store.dispatch('stats/resetStats');
        
        this.$notify({
          type: 'success',
          title: '重置成功',
          text: '所有统计数据已重置'
        });
        
        this.showConfirmModal = false;
      } catch (error) {
        console.error('Error resetting stats:', error);
        this.$notify({
          type: 'error',
          title: '重置失败',
          text: error.message || '无法重置统计数据'
        });
      } finally {
        this.isSaving = false;
      }
    },
    executeConfirmedAction() {
      if (this.confirmModal.action) {
        this.confirmModal.action();
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
.settings-general {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.input-with-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group input {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.input-info {
  font-size: 0.85rem;
  color: #6c757d;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.save-button {
  padding: 8px 15px;
  background-color: #1e88e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.save-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.danger-zone .card-header {
  background-color: #fff5f5;
  border-bottom: 1px solid #ffe0e0;
}

.danger-zone .card-header h3 {
  color: #e53935;
}

.danger-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.danger-action:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.danger-info {
  flex: 1;
}

.danger-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.danger-description {
  font-size: 0.9rem;
  color: #6c757d;
}

.danger-button {
  padding: 8px 15px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  margin-left: 20px;
}

.danger-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.danger-button:disabled {
  background-color: #ef9a9a;
  cursor: not-allowed;
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
  max-width: 500px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
}

.confirm-message {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.confirm-message i {
  font-size: 1.5rem;
  color: #e53935;
}

.confirm-message p {
  margin: 0;
  line-height: 1.5;
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button, .confirm-button {
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

.cancel-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

.confirm-button {
  background-color: #e53935;
  color: white;
}

.confirm-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.confirm-button:disabled {
  background-color: #ef9a9a;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .danger-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .danger-button {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
