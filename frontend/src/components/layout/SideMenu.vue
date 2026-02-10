<template>
  <aside class="side-menu">
    <!-- Show different menu items based on current route -->
    
    <!-- Question Manager Menu -->
    <template v-if="$route.path.includes('/questions')">
      <h3 class="menu-heading">题库管理</h3>
      <router-link to="/questions" class="menu-item" active-class="active" exact>
        <i class="fas fa-list"></i> 题目列表
      </router-link>
      <router-link to="/questions/banks" class="menu-item" active-class="active">
        <i class="fas fa-layer-group"></i> 题库分组
      </router-link>
      <router-link to="/questions/import" class="menu-item" active-class="active">
        <i class="fas fa-file-import"></i> 导入题目
      </router-link>
      <router-link to="/questions/backup" class="menu-item" active-class="active">
        <i class="fas fa-save"></i> 备份恢复
      </router-link>
    </template>
    
    <!-- Statistics Menu -->
    <template v-else-if="$route.path.includes('/stats')">
      <h3 class="menu-heading">学习统计</h3>
      <router-link to="/stats/overview" class="menu-item" active-class="active">
        <i class="fas fa-chart-pie"></i> 统计概览
      </router-link>
      <router-link to="/stats/wrong-questions" class="menu-item" active-class="active">
        <i class="fas fa-exclamation-circle"></i> 错题统计
      </router-link>
      <router-link to="/stats/advisor" class="menu-item" active-class="active">
        <i class="fas fa-user-graduate"></i> 智能顾问
      </router-link>
      <router-link to="/stats/trends" class="menu-item" active-class="active">
        <i class="fas fa-chart-line"></i> 学习趋势
      </router-link>
      
     <router-link to="/stats/timeline" class="menu-item" active-class="active">
         <i class="fas fa-calendar-alt"></i> 时间段统计
        </router-link>
      <router-link to="/stats/progress" class="menu-item" active-class="active">
        <i class="fas fa-tasks"></i> 学习进度
      </router-link>
    </template>
    
    <!-- Settings Menu -->
    <template v-else-if="$route.path.includes('/settings')">
      <h3 class="menu-heading">系统设置</h3>
      <router-link to="/settings/general" class="menu-item" active-class="active">
        <i class="fas fa-cog"></i> 通用设置
      </router-link>
      <router-link to="/settings/api" class="menu-item" active-class="active">
        <i class="fas fa-plug"></i> API设置
      </router-link>
      <router-link to="/settings/font" class="menu-item" active-class="active">
        <i class="fas fa-font"></i> 字体设置
      </router-link>
      <router-link to="/settings/backup" class="menu-item" active-class="active">
        <i class="fas fa-database"></i> 备份恢复
      </router-link>
    </template>
    
    <!-- Home Menu (Default) -->
    <template v-else>
      <h3 class="menu-heading">学习模式</h3>
      <router-link to="/quiz" class="menu-item">
        <i class="fas fa-pen"></i> 开始答题
      </router-link>
      <router-link to="/review" class="menu-item">
        <i class="fas fa-redo"></i> 错题复习
      </router-link>
      <router-link to="/flashcards" class="menu-item">
        <i class="fas fa-clone"></i> 闪卡模式
      </router-link>
      <router-link to="/drill" class="menu-item">
        <i class="fas fa-crosshairs"></i> 智能组卷
      </router-link>
      <h3 class="menu-heading">更多功能</h3>
      <router-link to="/bookmarks" class="menu-item">
        <i class="fas fa-star"></i> 我的收藏
      </router-link>
      <router-link to="/questions" class="menu-item">
        <i class="fas fa-folder-open"></i> 题库管理
      </router-link>
      <router-link to="/notes" class="menu-item">
        <i class="fas fa-sticky-note"></i> 我的笔记
      </router-link>
      <router-link to="/stats/overview" class="menu-item">
        <i class="fas fa-chart-bar"></i> 查看统计
      </router-link>
    </template>
    
    <!-- Stats Summary -->
    <div class="stats-summary" v-if="overview">
      <h3 class="menu-heading">学习进度</h3>
      <div class="stats-item">
        <span>总题数</span>
        <span>{{ overview.totalQuestions || 0 }}</span>
      </div>
      <div class="stats-item">
        <span>已答题</span>
        <span>{{ overview.totalAnswered || 0 }}</span>
      </div>
      <div class="stats-item">
        <span>正确率</span>
        <span>{{ overview.correctRate || '0.0' }}%</span>
      </div>
      <div class="stats-item">
        <span>错题数</span>
        <span>{{ overview.wrongQuestionCount || 0 }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${overview.completionRate || 0}%` }"></div>
      </div>
      <div class="progress-text">
        完成率: {{ overview.completionRate || 0 }}%
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SideMenu',
  computed: {
    overview() {
      return this.$store.getters['stats/overview'];
    }
  },
  created() {
    // Load stats data for the sidebar
    this.$store.dispatch('stats/fetchOverview');
  }
};
</script>

<style scoped>
.side-menu {
  width: 240px;
  background-color: #f8f9fa;
  height: calc(100vh - 60px); /* Subtract navbar height */
  padding: 20px 0;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
}

.menu-heading {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  margin: 15px 20px 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #495057;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s;
}

.menu-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #1e88e5;
}

.menu-item.active {
  background-color: #e3f2fd;
  color: #1e88e5;
  font-weight: 500;
  border-left: 3px solid #1e88e5;
}

.stats-summary {
  margin-top: 30px;
  padding: 0 20px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #495057;
}

.progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  margin: 10px 0;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #1e88e5;
  border-radius: 3px;
  transition: width 0.5s;
}

.progress-text {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
}

@media (max-width: 768px) {
  .side-menu {
    display: none;
  }
}
</style>