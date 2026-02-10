<template>
  <div class="stats-overview">
    <h1 class="page-title">统计概览</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载数据中...</span>
    </div>
    
    <div class="stats-container" v-else>
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overview.totalAnswered || 0 }}</div>
            <div class="card-label">已答题数</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overview.correct || 0 }}</div>
            <div class="card-label">答对题数</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-bullseye"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overview.correctRate || 0 }}%</div>
            <div class="card-label">正确率</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overview.wrongQuestionCount || 0 }}</div>
            <div class="card-label">错题数</div>
          </div>
        </div>
      </div>
      
      <!-- Progress Chart -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="card-header">
            <h3>学习进度</h3>
          </div>
          <div class="card-body">
            <div class="progress-container">
              <div class="progress-circle">
                <svg width="150" height="150" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e9ecef"
                    stroke-width="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1e88e5"
                    stroke-width="10"
                    stroke-dasharray="283"
                    :stroke-dashoffset="progressOffset"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div class="progress-text">
                  <div class="percentage">{{ overview.completionRate || 0 }}%</div>
                  <div class="label">完成率</div>
                </div>
              </div>
              
              <div class="progress-info">
                <div class="info-item">
                  <div class="info-label">总题数</div>
                  <div class="info-value">{{ overview.totalQuestions || 0 }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">已答题</div>
                  <div class="info-value">{{ overview.totalAnswered || 0 }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">待答题</div>
                  <div class="info-value">{{ 
                    (overview.totalQuestions || 0) - (overview.totalAnswered || 0) 
                  }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-card">
          <div class="card-header">
            <h3>学习时间</h3>
          </div>
          <div class="card-body">
            <div class="study-time-container">
              <div class="time-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="time-details">
                <div class="time-total">
                  {{ overview.studyTime?.formatted || '0小时0分钟' }}
                </div>
                <div class="time-breakdown">
                  <div class="breakdown-item">
                    <div class="breakdown-value">{{ overview.studyTime?.hours || 0 }}</div>
                    <div class="breakdown-label">小时</div>
                  </div>
                  <div class="breakdown-item">
                    <div class="breakdown-value">{{ overview.studyTime?.minutes || 0 }}</div>
                    <div class="breakdown-label">分钟</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Category Stats -->
      <div class="chart-row">
        <div class="chart-card full-width">
          <div class="card-header">
            <h3>分类正确率</h3>
          </div>
          <div class="card-body">
            <div class="category-stats">
              <div 
                v-for="(stats, category) in categoryStats" 
                :key="category"
                class="category-item"
              >
                <div class="category-header">
                  <div class="category-name">{{ getCategoryName(category) }}</div>
                  <div class="category-count">{{ stats.answered }} / {{ stats.total }}</div>
                </div>
                <div class="category-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      :style="{ width: `${getAnsweredPercentage(stats)}%` }"
                    ></div>
                  </div>
                </div>
                <div class="category-accuracy">
                  <div class="accuracy-bar">
                    <div 
                      class="accuracy-fill"
                      :style="{ 
                        width: `${stats.correctRate}%`, 
                        backgroundColor: getAccuracyColor(stats.correctRate)
                      }"
                    ></div>
                  </div>
                  <div class="accuracy-text">正确率: {{ stats.correctRate }}%</div>
                </div>
              </div>
              
              <div class="no-data" v-if="!hasCategoryStats">
                暂无分类统计数据
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Sessions -->
      <div class="chart-row">
        <div class="chart-card full-width">
          <div class="card-header">
            <h3>最近学习记录</h3>
          </div>
          <div class="card-body">
            <div class="sessions-list">
              <div 
                v-for="(session, index) in recentSessions" 
                :key="index"
                class="session-item"
              >
                <div class="session-icon">
                  <i :class="[
                    'fas', 
                    session.mode === 'review' ? 'fa-history' : 'fa-pen'
                  ]"></i>
                </div>
                <div class="session-content">
                  <div class="session-header">
                    <div class="session-time">{{ session.start_time }}</div>
                    <div class="session-mode">
                      {{ session.mode === 'review' ? '错题复习' : '正常答题' }}
                    </div>
                  </div>
                  <div class="session-stats">
                    <div class="session-stat">
                      <span class="stat-label">答题数:</span>
                      <span class="stat-value">{{ session.questions_answered }}</span>
                    </div>
                    <div class="session-stat">
                      <span class="stat-label">正确数:</span>
                      <span class="stat-value">{{ session.correct_answers }}</span>
                    </div>
                    <div class="session-stat">
                      <span class="stat-label">正确率:</span>
                      <span class="stat-value">{{ getSessionCorrectRate(session) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="no-data" v-if="!hasSessions">
                暂无学习记录
              </div>
            </div>
          </div>
          <div class="card-footer" v-if="hasSessions">
            <router-link to="/stats/sessions" class="view-more">查看全部学习记录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsOverview',
  data() {
    return {
      recentSessions: []
    };
  },
  computed: {
    overview() {
      return this.$store.getters['stats/overview'] || {};
    },
    originalCategoryStats() {
      return this.$store.getters['stats/categoryStats'] || {};
    },
    sessions() {
      return this.$store.getters['stats/sessions'] || [];
    },
    isLoading() {
      return this.$store.getters['stats/isLoading'];
    },
    progressOffset() {
      // Calculate circle progress offset (circle circumference * (1 - progress%))
      const completionRate = this.overview.completionRate || 0;
      return 283 * (1 - completionRate / 100);
    },
    categoryStats() {
      const stats = {};
      
      if (this.originalCategoryStats) {
        Object.entries(this.originalCategoryStats).forEach(([category, data]) => {
          stats[category] = {
            total: data.total || 0,
            answered: data.answered || 0,
            correct: data.correct || 0,
            correctRate: parseFloat(data.correctRate || 0)
          };
        });
      }
      
      return stats;
    },
    hasCategoryStats() {
      return Object.keys(this.categoryStats).length > 0;
    },
    hasSessions() {
      return this.recentSessions.length > 0;
    }
  },
  methods: {
    getCategoryName(category) {
      // Convert category keys to display names if needed
      return category;
    },
    getAnsweredPercentage(stats) {
      if (!stats.total) return 0;
      return (stats.answered / stats.total) * 100;
    },
    getAccuracyColor(rate) {
      // Color gradient based on correctness rate
      if (rate >= 90) return '#4caf50'; // Green
      if (rate >= 70) return '#8bc34a'; // Light green
      if (rate >= 50) return '#ffc107'; // Yellow
      if (rate >= 30) return '#ff9800'; // Orange
      return '#f44336'; // Red
    },
    getSessionCorrectRate(session) {
      if (!session.questions_answered) return 0;
      return ((session.correct_answers / session.questions_answered) * 100).toFixed(1);
    },
    async fetchData() {
      try {
        // Fetch overview stats
        await this.$store.dispatch('stats/fetchOverview');
        
        // Fetch category stats
        await this.$store.dispatch('stats/fetchCategoryStats');
        
        // Fetch sessions
        await this.$store.dispatch('stats/fetchSessions');
        
        // Process the most recent sessions
        if (this.sessions && this.sessions.length > 0) {
          // Sort sessions by date (newest first) and take the most recent 5
          this.recentSessions = [...this.sessions]
            .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
            .slice(0, 5);
        }
      } catch (error) {
        console.error('Error fetching stats data:', error);
      }
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>
.stats-overview {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.summary-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #1e88e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.card-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.chart-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-card.full-width {
  grid-column: 1 / -1;
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

.card-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.view-more {
  font-size: 0.9rem;
  color: #1e88e5;
  text-decoration: none;
  transition: color 0.2s;
}

.view-more:hover {
  color: #1565c0;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
}

.progress-circle {
  position: relative;
  width: 150px;
  height: 150px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e88e5;
  line-height: 1.2;
}

.label {
  font-size: 0.9rem;
  color: #6c757d;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.study-time-container {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.time-icon {
  font-size: 3.5rem;
  color: #1e88e5;
}

.time-details {
  flex: 1;
}

.time-total {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.time-breakdown {
  display: flex;
  gap: 20px;
}

.breakdown-item {
  text-align: center;
}

.breakdown-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e88e5;
}

.breakdown-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.category-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.category-item {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.category-count {
  font-size: 0.9rem;
  color: #6c757d;
}

.category-progress, .category-accuracy {
  margin-bottom: 10px;
}

.progress-bar, .accuracy-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background-color: #6c757d;
}

.accuracy-fill {
  height: 100%;
}

.accuracy-text {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: right;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.session-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #e9ecef;
}

.session-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #1e88e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.session-content {
  flex: 1;
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.session-time {
  font-size: 0.9rem;
  color: #6c757d;
}

.session-mode {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e88e5;
}

.session-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.session-stat {
  font-size: 0.9rem;
}

.stat-label {
  color: #6c757d;
  margin-right: 5px;
}

.stat-value {
  font-weight: 500;
  color: #333;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-size: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .progress-container {
    flex-direction: column;
  }
  
  .session-stats {
    flex-direction: column;
    gap: 5px;
  }
}
</style>