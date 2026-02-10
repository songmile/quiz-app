<template>
  <div class="question-backup">
    <div class="backup-header">
      <h1 class="page-title">备份与恢复</h1>
      <router-link to="/questions" class="back-button">
        <i class="fas fa-arrow-left"></i> 返回题目列表
      </router-link>
    </div>
    
    <div class="backup-container">
      <div class="backup-section">
        <div class="section-header">
          <h2><i class="fas fa-save"></i> 创建备份</h2>
        </div>
        
        <div class="section-content">
          <p class="section-description">
            创建题库备份可以保护您的数据安全。建议在导入大量题目或进行重要操作前先创建备份。
          </p>
          
          <div class="action-panel">
            <button 
              class="create-backup-button" 
              @click="createBackup"
              :disabled="isCreatingBackup"
            >
              <i class="fas fa-save" :class="{ 'fa-spin': isCreatingBackup }"></i>
              创建备份
            </button>
            
            <div class="backup-info" v-if="lastBackup">
              <div class="info-title">上次备份信息</div>
              <div class="info-item">
                <span class="info-label">备份ID:</span>
                <span class="info-value">{{ lastBackup.backupId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件名:</span>
                <span class="info-value">{{ lastBackup.filename }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">时间:</span>
                <span class="info-value">{{ lastBackup.timestamp }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">题目数量:</span>
                <span class="info-value">{{ lastBackup.questionCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="backup-section">
        <div class="section-header">
          <h2><i class="fas fa-undo"></i> 恢复备份</h2>
        </div>
        
        <div class="section-content">
          <p class="section-description">
            从备份文件恢复题库。请注意，恢复操作将覆盖当前题库中的所有题目。
          </p>
          
          <div class="backup-list" v-if="backupList.length > 0">
            <div class="list-header">
              <div class="header-item">文件名</div>
              <div class="header-item">创建时间</div>
              <div class="header-item">题目数量</div>
              <div class="header-item">操作</div>
            </div>
            
            <div 
              v-for="(backup, index) in backupList" 
              :key="index"
              class="backup-item"
            >
              <div class="item-filename">{{ backup.filename }}</div>
              <div class="item-time">{{ formatDate(backup.timestamp) }}</div>
              <div class="item-count">{{ backup.questionCount || '-' }}</div>
              <div class="item-actions">
                <button 
                  class="restore-button"
                  @click="confirmRestore(backup)"
                  :disabled="isRestoringBackup"
                >
                  <i class="fas fa-undo" :class="{ 'fa-spin': isRestoringBackup && selectedBackup === backup.backupId }"></i>
                  恢复
                </button>
              </div>
            </div>
          </div>
          
          <div class="empty-state" v-else>
            <i class="fas fa-folder-open"></i>
            <p>暂无备份记录</p>
          </div>
        </div>
      </div>
      
      <div class="backup-section">
        <div class="section-header">
          <h2><i class="fas fa-file-export"></i> 导出题库</h2>
        </div>
        
        <div class="section-content">
          <p class="section-description">
            导出题库为JSON或文本格式，方便迁移到其他设备或服务器。
          </p>
          
          <div class="export-options">
            <button 
              class="export-button json"
              @click="exportQuestions('json')"
              :disabled="isExporting"
            >
              <i class="fas fa-file-code" :class="{ 'fa-spin': isExporting && exportFormat === 'json' }"></i>
              导出为JSON
            </button>
            
            <button 
              class="export-button text"
              @click="exportQuestions('text')"
              :disabled="isExporting"
            >
              <i class="fas fa-file-alt" :class="{ 'fa-spin': isExporting && exportFormat === 'text' }"></i>
              导出为文本
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
          <h3>确认恢复</h3>
          <button class="close-button" @click="showConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="confirm-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>恢复操作将覆盖当前题库中的所有题目。确定要继续吗？</p>
          </div>
          
          <div class="backup-details" v-if="backupToRestore">
            <div class="detail-item">
              <span class="detail-label">备份文件:</span>
              <span class="detail-value">{{ backupToRestore.filename }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ formatDate(backupToRestore.timestamp) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">题目数量:</span>
              <span class="detail-value">{{ backupToRestore.questionCount || '未知' }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" @click="showConfirmModal = false">取消</button>
          <button 
            class="confirm-button" 
            @click="restoreBackup"
            :disabled="isRestoringBackup"
          >
            <i class="fas fa-spinner fa-spin" v-if="isRestoringBackup"></i>
            确认恢复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionBackup',
  data() {
    return {
      isCreatingBackup: false,
      isRestoringBackup: false,
      isExporting: false,
      exportFormat: null,
      showConfirmModal: false,
      backupToRestore: null,
      selectedBackup: null,
      backupList: [
        // Mock data - in a real app, this would come from an API
        {
          backupId: 'backup1',
          filename: 'questions_backup_2023-04-15.json',
          timestamp: '2023-04-15T14:30:00',
          questionCount: 156
        },
        {
          backupId: 'backup2',
          filename: 'questions_backup_2023-03-20.json',
          timestamp: '2023-03-20T10:15:00',
          questionCount: 142
        }
      ]
    };
  },
  computed: {
    lastBackup() {
      return this.$store.getters['settings/lastBackup'];
    }
  },
  methods: {
    async createBackup() {
      if (this.isCreatingBackup) return;
      
      try {
        this.isCreatingBackup = true;
        
        const response = await this.$store.dispatch('questions/createBackup');
        
        if (response) {
          this.$notify({
            type: 'success',
            title: '备份成功',
            text: `已创建备份: ${response.filename}`
          });
          
          // Refresh backup list
          await this.fetchBackupList();
        }
      } catch (error) {
        console.error('Error creating backup:', error);
        this.$notify({
          type: 'error',
          title: '备份失败',
          text: error.message || '无法创建备份'
        });
      } finally {
        this.isCreatingBackup = false;
      }
    },
    confirmRestore(backup) {
      this.backupToRestore = backup;
      this.showConfirmModal = true;
    },
    async restoreBackup() {
      if (!this.backupToRestore || this.isRestoringBackup) return;
      
      try {
        this.isRestoringBackup = true;
        this.selectedBackup = this.backupToRestore.backupId;
        
        const response = await this.$store.dispatch('questions/restoreBackup', this.backupToRestore.backupId);
        
        if (response) {
          this.$notify({
            type: 'success',
            title: '恢复成功',
            text: `已恢复${response.questionCount}道题目`
          });
          
          // Close modal
          this.showConfirmModal = false;
          this.backupToRestore = null;
        }
      } catch (error) {
        console.error('Error restoring backup:', error);
        this.$notify({
          type: 'error',
          title: '恢复失败',
          text: error.message || '无法恢复备份'
        });
      } finally {
        this.isRestoringBackup = false;
        this.selectedBackup = null;
      }
    },
    async exportQuestions(format) {
      if (this.isExporting) return;
      
      try {
        this.isExporting = true;
        this.exportFormat = format;
        
        // In a real app, this would call an API endpoint to export questions
        // For now, we'll mock the behavior with a timeout
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock success
        this.$notify({
          type: 'success',
          title: '导出成功',
          text: `已导出题库为${format === 'json' ? 'JSON' : '文本'}格式`
        });
      } catch (error) {
        console.error('Error exporting questions:', error);
        this.$notify({
          type: 'error',
          title: '导出失败',
          text: error.message || '无法导出题库'
        });
      } finally {
        this.isExporting = false;
        this.exportFormat = null;
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
        minute: '2-digit'
      });
    },
    async fetchBackupList() {
      // In a real app, this would fetch the backup list from the server
      // For now, we'll use the mock data
    }
  },
  created() {
    this.fetchBackupList();
  }
};
</script>

<style scoped>
.question-backup {
  max-width: 1000px;
  margin: 0 auto;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
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

.backup-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.backup-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.section-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-content {
  padding: 20px;
}

.section-description {
  margin-top: 0;
  margin-bottom: 20px;
  color: #6c757d;
  line-height: 1.5;
}

.action-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.create-backup-button {
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
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  width: 100%;
  max-width: 200px;
}

.create-backup-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.create-backup-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.backup-info {
  background-color: #e3f2fd;
  border-radius: 6px;
  padding: 15px;
}

.info-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #1976d2;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 100px;
  color: #333;
}

.info-value {
  color: #1976d2;
  word-break: break-all;
}

.backup-list {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 10px 15px;
  font-weight: 600;
  color: #495057;
}

.backup-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 15px;
  align-items: center;
  border-top: 1px solid #dee2e6;
}

.backup-item:hover {
  background-color: #f8f9fa;
}

.item-filename {
  font-weight: 500;
  color: #1e88e5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time, .item-count {
  color: #6c757d;
}

.restore-button {
  padding: 6px 12px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.restore-button:hover:not(:disabled) {
  background-color: #f57c00;
}

.restore-button:disabled {
  background-color: #ffcc80;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6c757d;
  gap: 15px;
}

.empty-state i {
  font-size: 3rem;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

.export-options {
  display: flex;
  gap: 15px;
}

.export-button {
  padding: 10px 20px;
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

.export-button.json {
  background-color: #4caf50;
  color: white;
}

.export-button.json:hover:not(:disabled) {
  background-color: #388e3c;
}

.export-button.text {
  background-color: #9e9e9e;
  color: white;
}

.export-button.text:hover:not(:disabled) {
  background-color: #757575;
}

.export-button:disabled {
  opacity: 0.6;
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
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.confirm-message i {
  font-size: 2rem;
  color: #ff9800;
}

.confirm-message p {
  margin: 0;
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
}

.backup-details {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 100px;
  color: #333;
}

.detail-value {
  color: #6c757d;
  word-break: break-all;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button, .confirm-button {
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

.confirm-button {
  background-color: #ff9800;
  color: white;
}

.confirm-button:hover:not(:disabled) {
  background-color: #f57c00;
}

.confirm-button:disabled {
  background-color: #ffcc80;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .backup-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .list-header, .backup-item {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .header-item:nth-child(2), .item-time {
    display: none;
  }
  
  .export-options {
    flex-direction: column;
  }
}
</style>
