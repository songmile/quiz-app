<template>
  <div class="stats-trends">
    <h1 class="page-title">学习趋势</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载数据中...</span>
    </div>
    
    <div class="stats-container" v-else>
      <!-- Learning Trend Card -->
      <div class="chart-card">
        <div class="card-header">
          <h3>学习进度趋势</h3>
        </div>
        <div class="card-body">
          <div class="trend-message" v-if="!hasTrend">
            <i class="fas fa-info-circle"></i>
            <p>{{ trendMessage || '暂无足够的数据来生成趋势图表，请完成更多题目后再查看。' }}</p>
          </div>
          
          <div v-else class="trend-content">
            <div class="trend-indicator">
              <div class="trend-icon" :class="trends.trend.direction">
                <i :class="[
                  'fas', 
                  trends.trend.direction === 'up' ? 'fa-arrow-up' : 
                  trends.trend.direction === 'down' ? 'fa-arrow-down' : 
                  'fa-arrows-alt-h'
                ]"></i>
              </div>
              <div class="trend-description">
                <div class="trend-title">{{ getTrendTitle(trends.trend.direction) }}</div>
                <div class="trend-detail">{{ trends.trend.description }}</div>
              </div>
            </div>
            
            <div class="trend-chart">
              <div class="chart-container">
                <canvas ref="correctRateChart"></canvas>
              </div>
            </div>
            
            <div class="trend-metrics">
              <div class="metric">
                <div class="metric-label">近期平均正确率</div>
                <div class="metric-value">{{ trends.trend.recentAverage }}%</div>
              </div>
              <div class="metric">
                <div class="metric-label">早期平均正确率</div>
                <div class="metric-value">{{ trends.trend.earlierAverage }}%</div>
              </div>
              <div class="metric">
                <div class="metric-label">变化百分比</div>
                <div class="metric-value" :class="{
                  'positive': parseFloat(trends.trend.changePercentage) > 0,
                  'negative': parseFloat(trends.trend.changePercentage) < 0
                }">
                  {{ getChangePercentageText(trends.trend.changePercentage) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error Types Chart Card -->
      <div class="chart-card">
        <div class="card-header">
          <h3>错误类型分布</h3>
        </div>
        <div class="card-body">
          <div class="error-types-message" v-if="!hasErrorTypes">
            <i class="fas fa-info-circle"></i>
            <p>暂无错题数据来生成错误类型分布图表，请回答更多题目后再查看。</p>
          </div>
          
          <div v-else class="error-types-content">
            <div class="error-chart">
              <div class="chart-container">
                <canvas ref="errorTypesChart"></canvas>
              </div>
            </div>
            
            <div class="error-details">
              <div 
                v-for="(item, index) in errorTypesSorted" 
                :key="index"
                class="error-type-item"
              >
                <div class="error-type-color" :style="{ backgroundColor: errorTypeColors[index % errorTypeColors.length] }"></div>
                <div class="error-type-name">{{ item.type }}</div>
                <div class="error-type-count">{{ item.count }} 题</div>
                <div class="error-type-percent">{{ item.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sessions Correct Rate Chart Card -->
      <div class="chart-card">
        <div class="card-header">
          <h3>会话正确率变化</h3>
        </div>
        <div class="card-body">
          <div class="sessions-message" v-if="!hasSessions">
            <i class="fas fa-info-circle"></i>
            <p>暂无足够的会话数据来生成会话正确率变化图表，请完成更多答题会话后再查看。</p>
          </div>
          
          <div v-else class="sessions-content">
            <div class="sessions-chart">
              <div class="chart-container">
                <canvas ref="sessionsChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'StatsTrends',
  data() {
    return {
      charts: {
        correctRate: null,
        errorTypes: null,
        sessions: null
      },
      errorTypeColors: [
        '#1e88e5', // Blue
        '#e53935', // Red
        '#43a047', // Green
        '#fb8c00', // Orange
        '#8e24aa', // Purple
        '#00acc1', // Cyan
        '#ffb300', // Amber
        '#5c6bc0', // Indigo
        '#26a69a', // Teal
        '#ec407a'  // Pink
      ]
    };
  },
  computed: {
    trends() {
      return this.$store.getters['stats/trends'] || { trend: {}, errorTypes: [] };
    },
    sessions() {
      return this.$store.getters['stats/sessions'] || [];
    },
    isLoading() {
      return this.$store.getters['stats/isLoading'];
    },
    hasTrend() {
      return this.trends && this.trends.trend && this.trends.trend.hasTrend;
    },
    trendMessage() {
      return this.trends && this.trends.trend ? this.trends.trend.message : '';
    },
    hasErrorTypes() {
      return this.trends && this.trends.errorTypes && this.trends.errorTypes.length > 0;
    },
    errorTypesSorted() {
      return this.trends && this.trends.errorTypes ? 
        [...this.trends.errorTypes].sort((a, b) => b.count - a.count) : [];
    },
    hasSessions() {
      return this.sessions && this.sessions.length >= 3;
    }
  },
  methods: {
    getTrendTitle(direction) {
      switch (direction) {
        case 'up':
          return '正确率上升中';
        case 'down':
          return '正确率下降中';
        case 'stable':
          return '正确率保持稳定';
        default:
          return '学习趋势';
      }
    },
    getChangePercentageText(percentage) {
      const value = parseFloat(percentage);
      if (value > 0) {
        return `+${percentage}%`;
      } else if (value < 0) {
        return `${percentage}%`;
      } else {
        return '0.0%';
      }
    },
    createCorrectRateChart() {
      if (!this.hasTrend) return;
      
      const ctx = this.$refs.correctRateChart.getContext('2d');
      
      // Destroy existing chart if it exists
      if (this.charts.correctRate) {
        this.charts.correctRate.destroy();
      }
      
      // Mock data for correct rate trend (replace with real data from API)
      const recentAverage = parseFloat(this.trends.trend.recentAverage);
      const earlierAverage = parseFloat(this.trends.trend.earlierAverage);
      
      // Create a simple chart to visualize the change
      this.charts.correctRate = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['早期', '近期'],
          datasets: [{
            label: '平均正确率',
            data: [earlierAverage, recentAverage],
            backgroundColor: 'rgba(30, 136, 229, 0.2)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            pointBackgroundColor: 'rgba(30, 136, 229, 1)',
            pointRadius: 5,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `正确率: ${context.parsed.y.toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: Math.max(0, Math.min(earlierAverage, recentAverage) - 20),
              max: Math.min(100, Math.max(earlierAverage, recentAverage) + 20),
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    },
    createErrorTypesChart() {
      if (!this.hasErrorTypes) return;
      
      const ctx = this.$refs.errorTypesChart.getContext('2d');
      
      // Destroy existing chart if it exists
      if (this.charts.errorTypes) {
        this.charts.errorTypes.destroy();
      }
      
      const errorTypes = this.errorTypesSorted;
      
      // Create a pie chart for error types distribution
      this.charts.errorTypes = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: errorTypes.map(item => item.type),
          datasets: [{
            data: errorTypes.map(item => item.count),
            backgroundColor: errorTypes.map((_, index) => 
              this.errorTypeColors[index % this.errorTypeColors.length]
            ),
            borderWidth: 1,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const index = context.dataIndex;
                  const count = context.parsed;
                  const percentage = errorTypes[index].percentage;
                  return `${errorTypes[index].type}: ${count} 题 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    createSessionsChart() {
      if (!this.hasSessions) return;
      
      const ctx = this.$refs.sessionsChart.getContext('2d');
      
      // Destroy existing chart if it exists
      if (this.charts.sessions) {
        this.charts.sessions.destroy();
      }
      
      // Process sessions data
      const sessionsData = [...this.sessions]
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(-10); // Get last 10 sessions
      
      const correctRates = sessionsData.map(session => {
        if (session.questions_answered > 0) {
          return (session.correct_answers / session.questions_answered) * 100;
        }
        return 0;
      });
      
      const sessionLabels = sessionsData.map((session, index) => {
        const date = new Date(session.start_time);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
      });
      
      // Create the line chart
      this.charts.sessions = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sessionLabels,
          datasets: [{
            label: '会话正确率',
            data: correctRates,
            backgroundColor: 'rgba(67, 160, 71, 0.2)',
            borderColor: 'rgba(67, 160, 71, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(67, 160, 71, 1)',
            pointRadius: 4,
            tension: 0.2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  const index = context[0].dataIndex;
                  return `会话 ${sessionLabels[index]}`;
                },
                label: function(context) {
                  return `正确率: ${context.parsed.y.toFixed(1)}%`;
                },
                afterLabel: function(context) {
                  const index = context.dataIndex;
                  const session = sessionsData[index];
                  return `${session.correct_answers}/${session.questions_answered} 题正确`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: Math.max(0, Math.min(...correctRates) - 20),
              max: Math.min(100, Math.max(...correctRates) + 20),
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    },
    async fetchData() {
      try {
        // Fetch trends data
        await this.$store.dispatch('stats/fetchTrends');
        
        // Fetch sessions
        await this.$store.dispatch('stats/fetchSessions');
        
        // Initialize charts after data loaded
        this.$nextTick(() => {
          if (this.hasTrend) {
            this.createCorrectRateChart();
          }
          
          if (this.hasErrorTypes) {
            this.createErrorTypesChart();
          }
          
          if (this.hasSessions) {
            this.createSessionsChart();
          }
        });
      } catch (error) {
        console.error('Error fetching trends data:', error);
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  beforeUnmount() {
    // Destroy all charts when component is unmounted
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  },
  watch: {
    // Recreate charts when data changes
    trends() {
      this.$nextTick(() => {
        if (this.hasTrend) {
          this.createCorrectRateChart();
        }
        
        if (this.hasErrorTypes) {
          this.createErrorTypesChart();
        }
      });
    },
    sessions() {
      this.$nextTick(() => {
        if (this.hasSessions) {
          this.createSessionsChart();
        }
      });
    }
  }
};
</script>

<style scoped>
.stats-trends {
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

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.chart-card {
  background-color: white;
  border-radius: 10px;
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

.trend-message, .error-types-message, .sessions-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
  color: #6c757d;
  gap: 10px;
}

.trend-message i, .error-types-message i, .sessions-message i {
  font-size: 2rem;
  color: #1e88e5;
}

.trend-message p, .error-types-message p, .sessions-message p {
  font-size: 1rem;
  max-width: 500px;
  margin: 0;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.trend-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.trend-icon.up {
  background-color: #e8f5e9;
  color: #4caf50;
}

.trend-icon.down {
  background-color: #ffebee;
  color: #f44336;
}

.trend-icon.stable {
  background-color: #e3f2fd;
  color: #1e88e5;
}

.trend-description {
  flex: 1;
}

.trend-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.trend-detail {
  font-size: 0.9rem;
  color: #6c757d;
}

.trend-chart {
  height: 200px;
  position: relative;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.trend-metrics {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 15px;
}

.metric {
  flex: 1;
  min-width: 150px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.metric-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.metric-value.positive {
  color: #4caf50;
}

.metric-value.negative {
  color: #f44336;
}

.error-types-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-chart {
  height: 250px;
  position: relative;
}

.error-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.error-type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.error-type-color {
  width: 15px;
  height: 15px;
  border-radius: 4px;
  flex-shrink: 0;
}

.error-type-name {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
}

.error-type-count {
  font-size: 0.9rem;
  color: #6c757d;
  margin-right: 5px;
}

.error-type-percent {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e88e5;
}

.sessions-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sessions-chart {
  height: 250px;
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .trend-metrics {
    flex-direction: column;
  }
  
  .error-details {
    grid-template-columns: 1fr;
  }
}
</style>