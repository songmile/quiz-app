<template>
  <div class="stats-advisor">
    <h1 class="page-title">智能顾问</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>生成顾问建议中...</span>
    </div>
    
    <div class="not-enough-data" v-else-if="!hasEnoughData">
      <i class="fas fa-info-circle"></i>
      <p>{{ advisorMessage }}</p>
      <button class="quiz-button" @click="goToQuiz">
        继续答题
      </button>
    </div>
    
    <div class="advisor-container" v-else>
      <div class="advisor-header">
        <div class="advisor-avatar">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="advisor-intro">
          <h2>学习顾问</h2>
          <p>基于您的学习数据，为您提供个性化的学习建议和计划。</p>
        </div>
      </div>
      
      <div class="advisor-content">
        <div class="analysis-section">
          <div class="section-header">
            <h3>学习情况分析</h3>
          </div>
          <div class="section-content">
            <div class="analysis-cards">
              <div class="analysis-card">
                <div class="card-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ advisor.analysis.correctRate }}%</div>
                  <div class="card-label">正确率</div>
                </div>
              </div>
              
              <div class="analysis-card">
                <div class="card-icon">
                  <i class="fas fa-tasks"></i>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ advisor.analysis.totalAnswered }}</div>
                  <div class="card-label">已答题数</div>
                </div>
              </div>
              
              <div class="analysis-card">
                <div class="card-icon">
                  <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ advisor.analysis.wrongQuestionCount }}</div>
                  <div class="card-label">错题数</div>
                </div>
              </div>
              
              <div class="analysis-card">
                <div class="card-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ formatStudyTime }}</div>
                  <div class="card-label">学习时间</div>
                </div>
              </div>
            </div>
            
            <div class="error-types" v-if="hasErrorTypes">
              <h4>错误类型分布</h4>
              <div class="error-chart">
                <canvas ref="errorChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div class="advice-section">
          <div class="section-header">
            <h3>学习建议</h3>
          </div>
          <div class="section-content">
            <div class="advice-messages">
              <div 
                v-for="(advice, index) in advisor.advices" 
                :key="index"
                class="advice-message"
              >
                <div class="advice-icon">
                  <i class="fas fa-lightbulb"></i>
                </div>
                <div class="advice-text">{{ advice }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="plan-section">
          <div class="section-header">
            <h3>学习计划</h3>
          </div>
          <div class="section-content">
            <div class="plan-details">
              <div class="plan-card">
                <div class="plan-header">
                  <i class="fas fa-calendar-alt"></i>
                  <h4>每日目标</h4>
                </div>
                <div class="plan-body">
                  <div class="plan-number">{{ advisor.plan.dailyGoal }}</div>
                  <div class="plan-unit">题/天</div>
                </div>
              </div>
              
              <div class="plan-card">
                <div class="plan-header">
                  <i class="fas fa-calendar-week"></i>
                  <h4>周计划</h4>
                </div>
                <div class="plan-body">
                  <div class="plan-text">{{ advisor.plan.weeklyPlan }}</div>
                </div>
              </div>
              
              <div class="plan-card">
                <div class="plan-header">
                  <i class="fas fa-bullseye"></i>
                  <h4>重点领域</h4>
                </div>
                <div class="plan-body">
                  <div class="plan-text">{{ advisor.plan.focusAreas }}</div>
                </div>
              </div>
              
              <div class="plan-card" v-if="advisor.plan.specialTraining">
                <div class="plan-header">
                  <i class="fas fa-dumbbell"></i>
                  <h4>专项训练</h4>
                </div>
                <div class="plan-body">
                  <div class="plan-text">{{ advisor.plan.specialTraining }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="action-button quiz" @click="goToQuiz">
          <i class="fas fa-pen"></i> 开始答题
        </button>
        <button class="action-button review" @click="goToReview">
          <i class="fas fa-redo"></i> 错题复习
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'StatsAdvisor',
  data() {
    return {
      errorChart: null
    };
  },
  computed: {
    advisor() {
      return this.$store.getters['stats/advisor'] || {};
    },
    isLoading() {
      return this.$store.getters['stats/isLoading'];
    },
    hasEnoughData() {
      return this.advisor && this.advisor.hasEnoughData;
    },
    advisorMessage() {
      return this.advisor?.message || '需要更多学习数据才能提供个性化建议。请至少完成10道题目后再来查看。';
    },
    hasErrorTypes() {
      return this.advisor && 
             this.advisor.errorTypes && 
             this.advisor.errorTypes.length > 0;
    },
    formatStudyTime() {
      if (!this.advisor || !this.advisor.analysis) return '0小时0分钟';
      
      const hours = this.advisor.analysis.studyTimeHours || 0;
      const minutes = this.advisor.analysis.studyTimeMinutes || 0;
      
      return `${hours}小时${minutes}分钟`;
    }
  },
  methods: {
    async fetchAdvisor() {
      await this.$store.dispatch('stats/fetchAdvisor');
      
      if (this.hasEnoughData && this.hasErrorTypes) {
        this.$nextTick(() => {
          this.initErrorChart();
        });
      }
    },
    initErrorChart() {
      if (!this.$refs.errorChart || !this.hasErrorTypes) return;
      
      // Destroy existing chart if any
      if (this.errorChart) {
        this.errorChart.destroy();
      }
      
      // Prepare data
      const errorTypes = this.advisor.errorTypes.map(type => type.type);
      const errorCounts = this.advisor.errorTypes.map(type => type.count);
      const colors = this.generateColors(errorTypes.length);
      
      // Create chart
      this.errorChart = new Chart(this.$refs.errorChart, {
        type: 'bar',
        data: {
          labels: errorTypes,
          datasets: [{
            label: '错题数量',
            data: errorCounts,
            backgroundColor: colors,
            borderColor: colors.map(color => this.darkenColor(color, 20)),
            borderWidth: 1
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
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  const percentage = ((value / this.advisor.analysis.wrongQuestionCount) * 100).toFixed(1);
                  return `${label}: ${value} 题 (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    },
    generateColors(count) {
      // Generate colors for chart
      const baseColors = [
        '#e53935', '#d81b60', '#8e24aa', '#5e35b1', 
        '#3949ab', '#1e88e5', '#039be5', '#00acc1',
        '#00897b', '#43a047', '#7cb342', '#c0ca33',
        '#fdd835', '#ffb300', '#fb8c00', '#f4511e'
      ];
      
      return Array(count).fill().map((_, i) => baseColors[i % baseColors.length]);
    },
    darkenColor(color, amount) {
      // Darken color by converting to RGB, reducing values, and converting back
      let rgb = color.replace(/^#/, '');
      let r = parseInt(rgb.substr(0, 2), 16);
      let g = parseInt(rgb.substr(2, 2), 16);
      let b = parseInt(rgb.substr(4, 2), 16);
      
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
    goToQuiz() {
      this.$router.push('/quiz');
    },
    goToReview() {
      this.$router.push('/review');
    }
  },
  mounted() {
    this.fetchAdvisor();
  },
  beforeUnmount() {
    // Cleanup chart when component unmounts
    if (this.errorChart) {
      this.errorChart.destroy();
    }
  }
};
</script>

<style scoped>
.stats-advisor {
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

.loading-state, .not-enough-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 15px;
  color: #6c757d;
}

.loading-state i, .not-enough-data i {
  font-size: 2rem;
}

.not-enough-data p {
  font-size: 1.2rem;
  max-width: 600px;
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.quiz-button {
  padding: 10px 20px;
  background-color: #1e88e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quiz-button:hover {
  background-color: #1976d2;
}

.advisor-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.advisor-header {
  padding: 30px;
  background-color: #f0f7ff;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #d1e6ff;
}

.advisor-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #1e40af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.advisor-intro {
  flex: 1;
}

.advisor-intro h2 {
  font-size: 1.5rem;
  color: #1e40af;
  margin: 0 0 10px 0;
}

.advisor-intro p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.advisor-content {
  padding: 30px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 1.3rem;
  color: #333;
  margin: 0;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
}

.section-header h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-color: #1e40af;
  border-radius: 3px;
}

.section-content {
  margin-bottom: 40px;
}

.analysis-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.analysis-card {
  background-color: #f8f9fa;
  border-radius: 10px;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.card-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.error-types {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
}

.error-types h4 {
  font-size: 1.1rem;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
}

.error-chart {
  height: 300px;
  position: relative;
}

.advice-messages {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.advice-message {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.advice-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff9c4;
  color: #fbc02d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.advice-text {
  flex: 1;
  line-height: 1.5;
  color: #333;
}

.plan-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.plan-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plan-header i {
  color: #1e40af;
  font-size: 1.2rem;
}

.plan-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.plan-body {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.plan-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1e40af;
}

.plan-unit {
  font-size: 1rem;
  color: #6c757d;
}

.plan-text {
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 10px;
}

.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-button.quiz {
  background-color: #1e88e5;
  color: white;
}

.action-button.quiz:hover {
  background-color: #1976d2;
}

.action-button.review {
  background-color: #e53935;
  color: white;
}

.action-button.review:hover {
  background-color: #d32f2f;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .advisor-header {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
