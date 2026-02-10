<template>
  <div class="statistics">
    <div class="page-header">
      <h1 class="page-title">学习统计</h1>
      <p class="page-subtitle">追踪您的 Spring Boot 学习进度和表现</p>
    </div>
    
    <div class="stats-tabs">
      <router-link to="/stats/overview" class="tab-item" active-class="active">
        <i class="fas fa-chart-pie"></i> 统计概览
      </router-link>
      <router-link to="/stats/wrong-questions" class="tab-item" active-class="active">
        <i class="fas fa-exclamation-circle"></i> 错题统计
      </router-link>
      <router-link to="/stats/advisor" class="tab-item" active-class="active">
        <i class="fas fa-user-graduate"></i> 智能顾问
      </router-link>
      <router-link to="/stats/trends" class="tab-item" active-class="active">
        <i class="fas fa-chart-line"></i> 学习趋势
          </router-link>
            <!-- 添加新的时间段统计选项卡 -->
      <router-link to="/stats/timeline" class="tab-item">
        <i class="fas fa-calendar-alt"></i> 时间段统计
      </router-link>
    </div>
    
    <div class="stats-actions">
      <button class="action-button" @click="refreshStats">
        <i class="fas fa-sync-alt"></i> 刷新数据
      </button>
      <button class="action-button danger" @click="showResetConfirm = true">
        <i class="fas fa-trash"></i> 重置统计
      </button>
    </div>
    
    <div class="stats-container">
      <router-view />
    </div>
    
    <!-- Reset Confirmation Modal -->
    <div class="modal" v-if="showResetConfirm">
      <div class="modal-overlay" @click="showResetConfirm = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>确认重置统计</h3>
          <button class="close-button" @click="showResetConfirm = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="confirm-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>确定要重置所有统计数据吗？此操作不可撤销，将清空所有学习记录、正确率和进度数据。</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" @click="showResetConfirm = false">取消</button>
          <button 
            class="reset-button" 
            @click="resetStats"
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
  name: 'Statistics',
  data() {
    return {
      showResetConfirm: false,
      isResetting: false
    };
  },
  methods: {
    refreshStats() {
      this.$store.dispatch('stats/fetchAllStats').then(() => {
        this.$notify({
          type: 'success',
          title: '更新成功',
          text: '统计数据已刷新'
        });
      }).catch(error => {
        this.$notify({
          type: 'error',
          title: '更新失败',
          text: error.message || '无法刷新统计数据'
        });
      });
    },
    async resetStats() {
      try {
        this.isResetting = true;
        
        await this.$store.dispatch('stats/resetStats');
        
        this.$notify({
          type: 'success',
          title: '重置成功',
          text: '所有统计数据已重置'
        });
        
        this.showResetConfirm = false;
      } catch (error) {
        this.$notify({
          type: 'error',
          title: '重置失败',
          text: error.message || '无法重置统计数据'
        });
      } finally {
        this.isResetting = false;
      }
    }
  },
  created() {
    // If accessing the base stats route, redirect to overview
    if (this.$route.path === '/stats') {
      this.$router.replace({ name: 'StatsOverview' });
    }
  }
};
</script>

<style scoped>
.statistics {
  max-width: 1100px;
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

.stats-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.tab-item {
  padding: 12px 20px;
  text-decoration: none;
  color: #495057;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-item:hover {
  color: #1e88e5;
  background-color: #f8f9fa;
}

.tab-item.active {
  color: #1e88e5;
  border-bottom-color: #1e88e5;
  font-weight: 500;
}

.stats-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.action-button {
  padding: 8px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.action-button.danger {
  color: #dc3545;
  border-color: #f8d7da;
}

.action-button.danger:hover {
  background-color: #fff5f5;
  border-color: #f5c6cb;
}

.stats-container {
  min-height: calc(100vh - 250px);
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

.cancel-button, .reset-button {
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

.reset-button {
  background-color: #dc3545;
  color: white;
}

.reset-button:hover:not(:disabled) {
  background-color: #c82333;
}

.reset-button:disabled {
  background-color: #e9afb5;
  cursor: not-allowed;
}
</style>
