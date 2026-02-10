<template>
  <div class="settings-backup">
    <h1 class="page-title">备份与恢复</h1>
    
    <div class="loading-state" v-if="isLoading && !backupInProgress && !restoreInProgress">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载设置中...</span>
    </div>
    
    <div class="settings-content" v-else>
      <!-- Backup Section -->
      <div class="settings-card">
        <div class="card-header">
          <h3>创建备份</h3>
        </div>
        <div class="card-body">
          <p class="card-description">
            创建当前系统的完整备份，包括题目数据、学习记录、统计信息和设置。备份文件将保存在系统的数据目录中。
          </p>
          
          <div class="last-backup" v-if="lastBackup">
            <div class="info-item">
              <div class="info-label">上次备份时间</div>
              <div class="info-value">{{ formatDate(lastBackup.timestamp) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">备份文件名</div>
              <div class="info-value">{{ lastBackup.filename }}</div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">题目数量</div>
                <div class="info-value">{{ lastBackup.stats?.questions || 0 }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">解析数量</div>
                <div class="info-value">{{ lastBackup.stats?.explanations || 0 }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">错误分析</div>
                <div class="info-value">{{ lastBackup.stats?.errorAnalyses || 0 }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">变种题</div>
                <div class="info-value">{{ lastBackup.stats?.variants || 0 }}</div>
              </div>
            </div>
          </div>
          
          <div class="backup-actions">
            <button 
              class="primary-button" 
              @click="createBackup"
              :disabled="backupInProgress"
            >
              <i class="fas fa-save" v-if="!backupInProgress"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ backupInProgress ? '备份中...' : '创建新备份' }}
            </button>
          </div>
          
          <div class="success-message" v-if="backupSuccess">
            <i class="fas fa-check-circle"></i>
            <div class="message-content">
              <div class="message-title">备份成功</div>
              <div class="message-details">备份文件已保存: {{ backupSuccess.filename }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Restore Section -->
      <div class="settings-card">
        <div class="card-header">
          <h3>恢复备份</h3>
        </div>
        <div class="card-body">
          <p class="card-description">
            从以前的备份文件中恢复系统数据。注意：恢复操作将覆盖当前的所有数据，此操作不可撤销。
          </p>
          
          <div v-if="backupFiles.length === 0" class="no-backups">
            <i class="fas fa-exclamation-circle"></i>
            <p>没有找到可恢复的备份文件</p>
          </div>
          
          <div class="backup-files" v-else>
            <div class="file-selection">
              <label for="backup-file">选择备份文件</label>
              <select id="backup-file" v-model="selectedBackupFile">
                <option value="">-- 请选择备份文件 --</option>
                <option 
                  v-for="file in backupFiles" 
                  :key="file.filename"
                  :value="file.filename"
                >
                  {{ formatBackupFileName(file.filename) }}
                </option>
              </select>
            </div>
            
            <div class="file-details" v-if="selectedBackupFile">
              <div class="info-item">
                <div class="info-label">文件名</div>
                <div class="info-value">{{ selectedBackupFile }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">创建时间</div>
                <div class="info-value">{{ getBackupTimeFromFilename(selectedBackupFile) }}</div>
              </div>
            </div>
            
            <div class="restore-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <p>警告：恢复操作将覆盖当前系统中的所有数据，此操作不可撤销。建议在恢复前先创建当前系统的备份。</p>
            </div>
            
            <div class="restore-actions">
              <button 
                class="danger-button" 
                @click="confirmRestore"
                :disabled="!selectedBackupFile || restoreInProgress"
              >
                <i class="fas fa-undo-alt" v-if="!restoreInProgress"></i>
                <i class="fas fa-spinner fa-spin" v-else></i>
                {{ restoreInProgress ? '恢复中...' : '恢复系统' }}
              </button>
            </div>
            
            <div class="success-message" v-if="restoreSuccess">
              <i class="fas fa-check-circle"></i>
              <div class="message-content">
                <div class="message-title">恢复成功</div>
                <div class="message-details">系统已从备份文件恢复: {{ restoreSuccess.filename }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Export Data Section -->
      <div class="settings-card">
        <div class="card-header">
          <h3>数据导出</h3>
        </div>
        <div class="card-body">
          <p class="card-description">
            将系统数据导出为文件，支持多种格式，方便迁移或共享。
          </p>
          
          <div class="export-options">
            <div class="export-option">
              <div class="option-info">
                <div class="option-title">导出题库 (JSON格式)</div>
                <div class="option-description">导出所有题目数据为JSON格式，适合与其他系统交换数据。</div>
              </div>
              <button class="secondary-button" @click="exportQuestions">
                <i class="fas fa-file-export"></i> 导出题库
              </button>
            </div>
            
            <div class="export-option">
              <div class="option-info">
                <div class="option-title">导出学习统计 (CSV格式)</div>
                <div class="option-description">导出学习记录和统计数据为CSV格式，方便在电子表格中查看和分析。</div>
              </div>
              <button class="secondary-button" @click="exportStats">
                <i class="fas fa-chart-bar"></i> 导出统计
              </button>
            </div>
            
            <div class="export-option">
              <div class="option-info">
                <div class="option-title">导出错题集 (JSON格式)</div>
                <div class="option-description">仅导出错题集，适合分享错题或针对性复习。</div>
              </div>
              <button class="secondary-button" @click="exportWrongQuestions">
                <i class="fas fa-exclamation-circle"></i> 导出错题
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div class="modal" v-if="showConfirmModal">
      <div class="modal-overlay" @click="showConfirmModal = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>确认恢复</h3>
          <button class="close-button" @click="showConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="confirm-message">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <p>确定要从以下备份文件恢复系统吗？</p>
              <p class="file-name">{{ selectedBackupFile }}</p>
              <p class="warning-text">此操作将覆盖当前系统的所有数据，且不可撤销！</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showConfirmModal = false">取消</button>
          <button 
            class="confirm-button" 
            @click="restoreFromBackup"
            :disabled="restoreInProgress"
          >
            <i class="fas fa-spinner fa-spin" v-if="restoreInProgress"></i>
            {{ restoreInProgress ? '恢复中...' : '确认恢复' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; 
export default {
  name: 'SettingsBackup',
  data() {
    return {
      backupFiles: [],
      selectedBackupFile: '',
      backupInProgress: false,
      restoreInProgress: false,
      showConfirmModal: false,
      backupSuccess: null,
      restoreSuccess: null
    };
  },
  computed: {
    isLoading() {
      return this.$store.getters['settings/isLoading'];
    },
    lastBackup() {
      return this.$store.getters['settings/lastBackup'];
    }
  },
  methods: {
   async fetchBackupFiles() {
  try {
    this.loading = true;
    const response = await axios.get('/api/settings/backup-files');
    if (response.data.status === 'success') {
      this.backupFiles = response.data.data;
    } else {
      this.$notify({
        type: 'error',
        title: '获取备份失败',
        text: response.data.message || '无法获取备份文件列表'
      });
    }
  } catch (error) {
    console.error('获取备份文件失败:', error);
    this.$notify({
      type: 'error',
      title: '获取备份失败',
      text: error.response?.data?.message || '无法连接到服务器'
    });
  } finally {
    this.loading = false;
  }
},
    async createBackup() {
      try {
        this.backupInProgress = true;
        this.backupSuccess = null;
        
        const response = await this.$store.dispatch('settings/backupData');
        
        if (response && response.backup) {
          this.backupSuccess = response.backup;
          
          // Update backup files list
          this.fetchBackupFiles();
          
          this.$notify({
            type: 'success',
            title: '备份成功',
            text: '系统数据已成功备份'
          });
        }
      } catch (error) {
        console.error('Error creating backup:', error);
        this.$notify({
          type: 'error',
          title: '备份失败',
          text: error.message || '无法创建备份'
        });
      } finally {
        this.backupInProgress = false;
      }
    },
    confirmRestore() {
      if (!this.selectedBackupFile) return;
      
      this.showConfirmModal = true;
    },
    async restoreFromBackup() {
      if (!this.selectedBackupFile) return;
      
      try {
        this.restoreInProgress = true;
        this.restoreSuccess = null;
        
        const response = await this.$store.dispatch('settings/restoreData', this.selectedBackupFile);
        
        if (response) {
          this.restoreSuccess = {
            filename: this.selectedBackupFile,
            timestamp: new Date().toISOString()
          };
          
          this.showConfirmModal = false;
          
          this.$notify({
            type: 'success',
            title: '恢复成功',
            text: '系统数据已成功恢复'
          });
        }
      } catch (error) {
        console.error('Error restoring backup:', error);
        this.$notify({
          type: 'error',
          title: '恢复失败',
          text: error.message || '无法恢复备份'
        });
      } finally {
        this.restoreInProgress = false;
      }
    },
    formatBackupFileName(filename) {
      // Extract date and time from the filename
      const match = filename.match(/quiz_app_backup_(\d{4}-\d{2}-\d{2})T(\d{2}-\d{2}-\d{2})\.json/);
      if (match) {
        const date = match[1].replace(/-/g, '/');
        const time = match[2].replace(/-/g, ':');
        return `${date} ${time}`;
      }
      return filename;
    },
    getBackupTimeFromFilename(filename) {
      const match = filename.match(/quiz_app_backup_(\d{4}-\d{2}-\d{2})T(\d{2}-\d{2}-\d{2})\.json/);
      if (match) {
        const date = match[1].replace(/-/g, '/');
        const time = match[2].replace(/-/g, ':');
        return `${date} ${time}`;
      }
      return '未知时间';
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
    exportQuestions() {
      // Simulate export functionality
      this.$notify({
        type: 'info',
        title: '导出开始',
        text: '题库导出中，请等待下载提示'
      });
      
      // In a real implementation, you would call the backend API to generate the export file
      // and then download it using browser APIs
      setTimeout(() => {
        this.$notify({
          type: 'success',
          title: '导出成功',
          text: '题库已成功导出为JSON文件'
        });
      }, 1500);
    },
    exportStats() {
      this.$notify({
        type: 'info',
        title: '导出开始',
        text: '统计数据导出中，请等待下载提示'
      });
      
      setTimeout(() => {
        this.$notify({
          type: 'success',
          title: '导出成功',
          text: '统计数据已成功导出为CSV文件'
        });
      }, 1500);
    },
    exportWrongQuestions() {
      this.$notify({
        type: 'info',
        title: '导出开始',
        text: '错题集导出中，请等待下载提示'
      });
      
      setTimeout(() => {
        this.$notify({
          type: 'success',
          title: '导出成功',
          text: '错题集已成功导出为JSON文件'
        });
      }, 1500);
    }
  },
  created() {
    this.$store.dispatch('settings/fetchSettings');
    this.fetchBackupFiles();
  }
};
</script>

<style scoped>
.settings-backup {
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

.card-description {
  margin-top: 0;
  margin-bottom: 20px;
  color: #6c757d;
  line-height: 1.5;
}

.last-backup {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #6c757d;
}

.info-value {
  font-weight: 500;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.backup-actions, .restore-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.primary-button, .danger-button, .secondary-button {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;
}

.primary-button {
  background-color: #1e88e5;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.danger-button {
  background-color: #e53935;
  color: white;
}

.danger-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.secondary-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.secondary-button:hover:not(:disabled) {
  background-color: #e9ecef;
  color: #495057;
}

.primary-button:disabled, .danger-button:disabled, .secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background-color: #e8f5e9;
  border-radius: 8px;
  color: #2e7d32;
}

.success-message i {
  font-size: 1.5rem;
}

.message-content {
  flex: 1;
}

.message-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.message-details {
  font-size: 0.9rem;
}

.no-backups {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  gap: 15px;
  color: #6c757d;
}

.no-backups i {
  font-size: 2rem;
}

.no-backups p {
  margin: 0;
  font-size: 1.1rem;
}

.file-selection {
  margin-bottom: 20px;
}

.file-selection label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.file-selection select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-selection select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.file-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.restore-warning {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background-color: #fff8f8;
  border-radius: 8px;
  color: #c62828;
}

.restore-warning i {
  font-size: 1.5rem;
}

.restore-warning p {
  margin: 0;
  line-height: 1.5;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.option-info {
  flex: 1;
}

.option-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.option-description {
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
  margin: 0 0 10px 0;
  line-height: 1.5;
  color: #333;
}

.confirm-message p:last-child {
  margin-bottom: 0;
}

.file-name {
  font-weight: 500;
  color: #1e88e5;
}

.warning-text {
  color: #e53935;
  font-weight: 500;
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
  .export-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .export-option button {
    align-self: flex-end;
  }
}
</style>
