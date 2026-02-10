<template>
  <div class="settings">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-subtitle">配置应用参数和个性化选项</p>
    </div>
    
    <div class="settings-container">
      <div class="settings-sidebar">
        <router-link to="/settings/general" class="sidebar-item" active-class="active">
          <i class="fas fa-cog"></i> 通用设置
        </router-link>
        <router-link to="/settings/api" class="sidebar-item" active-class="active">
          <i class="fas fa-plug"></i> API 设置
        </router-link>
        <router-link to="/settings/font" class="sidebar-item" active-class="active">
          <i class="fas fa-font"></i> 字体设置
        </router-link>
        <router-link to="/settings/backup" class="sidebar-item" active-class="active">
          <i class="fas fa-database"></i> 备份恢复
        </router-link>
        
        <div class="settings-actions">
          <button class="reset-button" @click="showResetConfirm = true">
            <i class="fas fa-undo"></i> 重置所有设置
          </button>
        </div>
      </div>
      
      <div class="settings-content">
        <router-view />
      </div>
    </div>
    
    <!-- Reset Confirmation Modal -->
    <div class="modal" v-if="showResetConfirm">
      <div class="modal-overlay" @click="showResetConfirm = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>确认重置设置</h3>
          <button class="close-button" @click="showResetConfirm = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="confirm-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>确定要将所有设置重置为默认值吗？此操作不可撤销，将清空所有自定义配置，包括API密钥、字体设置等。</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" @click="showResetConfirm = false">取消</button>
          <button 
            class="confirm-button" 
            @click="resetSettings"
            :disabled="isResetting"
          >
            <i class="fas fa-spinner fa-spin" v-if="isResetting"></i>
            确认重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      showResetConfirm: false,
      isResetting: false
    };
  },
  methods: {
    async resetSettings() {
      try {
        this.isResetting = true;
        
        await this.$store.dispatch('settings/resetSettings');
        
        this.$notify({
          type: 'success',
          title: '重置成功',
          text: '所有设置已恢复为默认值'
        });
        
        this.showResetConfirm = false;
      } catch (error) {
        this.$notify({
          type: 'error',
          title: '重置失败',
          text: error.message || '无法重置设置'
        });
      } finally {
        this.isResetting = false;
      }
    }
  },
  created() {
    // If accessing the base settings route, redirect to general settings
    if (this.$route.path === '/settings') {
      this.$router.replace({ name: 'SettingsGeneral' });
    }
  },
  beforeMount() {
    // Fetch settings when component is created
    this.$store.dispatch('settings/fetchSettings');
  }
};
</script>

<style scoped>
.settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

.settings-container {
  display: flex;
  gap: 30px;
  min-height: calc(100vh - 200px);
}

.settings-sidebar {
  width: 250px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #495057;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background-color: #f8f9fa;
  color: #1e88e5;
}

.sidebar-item.active {
  background-color: #e3f2fd;
  color: #1e88e5;
  font-weight: 500;
  border-left: 3px solid #1e88e5;
}

.settings-actions {
  margin-top: 30px;
  padding: 0 20px;
}

.reset-button {
  width: 100%;
  padding: 10px;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background-color: #fff5f5;
  color: #dc3545;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: #dc3545;
  color: white;
}

.settings-content {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
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
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-message {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.confirm-message i {
  font-size: 1.5rem;
  color: #dc3545;
  flex-shrink: 0;
  margin-top: 3px;
}

.confirm-message p {
  font-size: 1rem;
  color: #333;
  margin: 0;
  line-height: 1.5;
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
  background-color: #dc3545;
  color: white;
}

.confirm-button:hover:not(:disabled) {
  background-color: #c82333;
}

.confirm-button:disabled {
  background-color: #e9afb5;
  cursor: not-allowed;
}

/* Responsive layout */
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
  }
}
</style>
