<template>
  <div class="stats-timeline">
    <h1 class="page-title">学习统计时间线</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载数据中...</span>
    </div>
    
    <div class="stats-container" v-else>
      <!-- 筛选区域 -->
      <div class="filter-card">
        <div class="filter-header">
          <h3>筛选条件</h3>
        </div>
        <div class="filter-body">
          <div class="filter-row">
            <div class="filter-group">
              <label>时间周期</label>
              <select v-model="selectedPeriod" @change="applyFilters">
                <option value="daily">每日统计</option>
                <option value="weekly">每周统计</option>
                <option value="monthly">每月统计</option>
                <option value="yearly">每年统计</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>题目类型</label>
              <select v-model="selectedCategory" @change="applyFilters">
                <option value="">所有类型</option>
                <option value="单选题">单选题</option>
                <option value="多选题">多选题</option>
                <option value="判断题">判断题</option>
                <option value="填空题">填空题</option>
                <option value="简答题">简答题</option>
              </select>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group">
              <label>开始日期</label>
              <input
                type="date"
                v-model="startDate"
                @change="applyFilters"
              >
            </div>
            
            <div class="filter-group">
              <label>结束日期</label>
              <input
                type="date"
                v-model="endDate"
                @change="applyFilters"
              >
            </div>
          </div>
          
          <div class="filter-actions">
            <button class="reset-button" @click="resetFilters">重置筛选</button>
          </div>
        </div>
      </div>
      
      <!-- 概览统计卡片 -->
      <div class="summary-card" v-if="timelineStats">
        <div class="summary-header">
          <h3>{{ getPeriodTitle() }} 统计概览</h3>
          <div class="date-range">
            {{ formatDate(timelineStats.summary.startDate) }} 至 {{ formatDate(timelineStats.summary.endDate) }}
          </div>
        </div>
        
        <div class="summary-body">
          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">{{ timelineStats.summary.totalAnswered }}</div>
              <div class="stat-label">已答题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ timelineStats.summary.totalCorrect }}</div>
              <div class="stat-label">答对题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ timelineStats.summary.correctRate }}%</div>
              <div class="stat-label">正确率</div>
            </div>
          </div>
          
          <div class="category-breakdown">
            <h4>题型分布</h4>
            <div
              v-for="(stats, category) in timelineStats.summary.categories"
              :key="category"
              class="category-item"
            >
              <div class="category-name">{{ category }}</div>
              <div class="category-bar">
                <div class="category-progress">
                  <div
                    class="progress-fill"
                    :style="{ width: `${getCategoryPercentage(stats.total, timelineStats.summary.totalAnswered)}%` }"
                  ></div>
                </div>
                <div class="category-count">{{ stats.total }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 时间线图表 -->
      <div class="chart-card" v-if="timelineStats && timelineStats.timeline.length > 0">
        <div class="chart-header">
          <h3>{{ getPeriodTitle() }} 答题趋势</h3>
        </div>
        <div class="chart-body">
          <canvas ref="timelineChart"></canvas>
        </div>
      </div>
      
      <!-- 无数据提示 -->
      <div class="no-data" v-else-if="timelineStats && timelineStats.timeline.length === 0">
        <i class="fas fa-search"></i>
        <p>该时间段内没有答题记录</p>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'StatsTimeline',
  data() {
    return {
      selectedPeriod: 'daily',
      selectedCategory: '',
      startDate: '',
      endDate: '',
      chart: null
    };
  },
  computed: {
    timelineStats() {
      return this.$store.getters['stats/timelineStats'];
    },
    isLoading() {
      return this.$store.getters['stats/isLoading'];
    }
  },
  methods: {
    applyFilters() {
      this.fetchTimelineStats();
    },
    resetFilters() {
      this.selectedPeriod = 'daily';
      this.selectedCategory = '';
      this.startDate = '';
      this.endDate = '';
      this.fetchTimelineStats();
    },
    async fetchTimelineStats() {
      const filters = {
        period: this.selectedPeriod
      };
      
      if (this.startDate) filters.startDate = this.startDate;
      if (this.endDate) filters.endDate = this.endDate;
      if (this.selectedCategory) filters.category = this.selectedCategory;
      
      await this.$store.dispatch('stats/fetchTimelineStats', filters);
      
      this.$nextTick(() => {
        this.renderChart();
      });
    },
    renderChart() {
      if (!this.timelineStats || !this.timelineStats.timeline.length) return;
      
      const canvas = this.$refs.timelineChart;
      if (!canvas) return;
      
      // 销毁已存在的图表
      if (this.chart) {
        this.chart.destroy();
      }
      
      const data = this.timelineStats.timeline;
      const labels = data.map(item => this.formatPeriodLabel(item.period));
      const totalDataset = data.map(item => item.total);
      const correctDataset = data.map(item => item.correct);
      
      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: '总答题数',
              data: totalDataset,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: '答对题数',
              data: correctDataset,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: false
            },
            tooltip: {
              callbacks: {
                afterBody: (tooltipItems) => {
                  const idx = tooltipItems[0].dataIndex;
                  const item = data[idx];
                  const correctRate = item.total > 0 ? (item.correct / item.total * 100).toFixed(1) : 0;
                  return `正确率: ${correctRate}%`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '题目数量'
              }
            }
          }
        }
      });
    },
    formatPeriodLabel(period) {
      if (this.selectedPeriod === 'daily') {
        // 将 YYYY-MM-DD 转换为 MM-DD
        return period.substring(5);
      } else if (this.selectedPeriod === 'weekly') {
        // 将 YYYY-WXX 转换为 YYYY年第XX周
        const parts = period.split('-W');
        return `${parts[0]}年第${parts[1]}周`;
      } else if (this.selectedPeriod === 'monthly') {
        // 将 YYYY-MM 转换为 YYYY年MM月
        const parts = period.split('-');
        return `${parts[0]}年${parts[1]}月`;
      } else {
        // 年度
        return `${period}年`;
      }
    },
    getPeriodTitle() {
      const titleMap = {
        daily: '每日',
        weekly: '每周',
        monthly: '每月',
        yearly: '每年'
      };
      return titleMap[this.selectedPeriod] || '';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },
    getCategoryPercentage(categoryCount, totalCount) {
      if (!totalCount) return 0;
      return (categoryCount / totalCount * 100).toFixed(1);
    }
  },
  mounted() {
    this.fetchTimelineStats();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.stats-timeline {
  max-width: 1000px;
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

.filter-card, .summary-card, .chart-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  overflow: hidden;
}

.filter-header, .summary-header, .chart-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header h3, .summary-header h3, .chart-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.filter-body, .summary-body, .chart-body {
  padding: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.filter-group select, .filter-group input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.filter-group select:focus, .filter-group input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.reset-button {
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: #e9ecef;
  color: #495057;
}

.date-range {
  font-size: 0.9rem;
  color: #6c757d;
}

.summary-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e88e5;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.category-breakdown h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1rem;
  color: #333;
}

.category-item {
  margin-bottom: 10px;
}

.category-name {
  font-size: 0.9rem;
  color: #495057;
  margin-bottom: 5px;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-progress {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1e88e5;
}

.category-count {
  font-size: 0.9rem;
  color: #6c757d;
  min-width: 30px;
  text-align: right;
}

.chart-body {
  height: 400px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 15px;
  color: #6c757d;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-data i {
  font-size: 2rem;
}

.no-data p {
  font-size: 1.1rem;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>