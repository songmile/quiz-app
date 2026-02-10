<template>
  <div class="stats-wrong-questions">
    <h1 class="page-title">错题统计</h1>
    
    <div class="loading-state" v-if="isLoading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载数据中...</span>
    </div>
    
    <div class="empty-state" v-else-if="!hasWrongQuestions">
      <i class="fas fa-check-circle"></i>
      <p>太棒了！目前没有错题记录。</p>
      <button class="quiz-button" @click="goToQuiz">
        去答题
      </button>
    </div>
    
    <div class="stats-container" v-else>
      <div class="summary-row">
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ wrongQuestions.count || 0 }}</div>
            <div class="card-label">错题总数</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ wrongQuestions.wrongRate || 0 }}%</div>
            <div class="card-label">错题率</div>
          </div>
        </div>
      </div>
      
      <div class="chart-row">
        <div class="chart-card">
          <div class="card-header">
            <h3>错题类型分布</h3>
          </div>
          <div class="card-body">
            <div class="type-distribution">
              <div class="distribution-chart">
                <canvas ref="pieChart"></canvas>
              </div>
              <div class="distribution-legend">
                <div 
                  v-for="(count, type) in wrongTypeDistribution" 
                  :key="type"
                  class="legend-item"
                >
                  <div 
                    class="color-indicator"
                    :style="{ backgroundColor: getTypeColor(type, Object.keys(wrongTypeDistribution).indexOf(type)) }"
                  ></div>
                  <div class="type-name">{{ type }}</div>
                  <div class="type-count">{{ count }} 题</div>
                  <div class="type-percentage">{{ getTypePercentage(count) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-row">
        <button class="review-button" @click="startReview">
          <i class="fas fa-history"></i> 开始错题复习
        </button>
      </div>
      
      <div class="questions-list">
        <h2>错题列表</h2>
        
        <div class="filter-bar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索错题..." 
              @input="filterQuestions"
            >
            <i class="fas fa-search"></i>
          </div>
          
          <div class="type-filter">
            <select v-model="selectedType" @change="filterQuestions">
              <option value="">所有题型</option>
              <option value="单选题">单选题</option>
              <option value="多选题">多选题</option>
              <option value="判断题">判断题</option>
              <option value="填空题">填空题</option>
              <option value="简答题">简答题</option>
            </select>
          </div>
        </div>
        
        <div class="questions-grid">
          <div 
            v-for="question in filteredQuestions" 
            :key="question.id"
            class="question-item"
            @click="viewQuestionDetail(question.id)"
          >
            <div class="question-header">
              <div class="question-type">{{ question.type }}</div>
            </div>
            
            <div class="question-text">
              {{ truncateText(question.text, 100) }}
            </div>
            
            <div class="question-footer">
              <div class="question-id">ID: {{ truncateText(question.id, 8) }}</div>
              <button class="review-now" @click.stop="reviewQuestion(question.id)">
                <i class="fas fa-redo"></i> 复习此题
              </button>
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
  name: 'StatsWrongQuestions',
  data() {
    return {
      searchQuery: '',
      selectedType: '',
      filteredQuestions: [],
      pieChart: null
    };
  },
  computed: {
    wrongQuestions() {
      return this.$store.getters['stats/wrongQuestions'] || {};
    },
    isLoading() {
      return this.$store.getters['stats/isLoading'];
    },
    hasWrongQuestions() {
      return this.wrongQuestions && 
             this.wrongQuestions.questions && 
             this.wrongQuestions.questions.length > 0;
    },
    wrongTypeDistribution() {
      return this.wrongQuestions.wrongTypes || {};
    }
  },
  methods: {
    async fetchWrongQuestions() {
      await this.$store.dispatch('stats/fetchWrongQuestions');
      
      if (this.hasWrongQuestions) {
        this.filteredQuestions = [...this.wrongQuestions.questions];
        this.$nextTick(() => {
          this.initPieChart();
        });
      }
    },
    initPieChart() {
      if (!this.$refs.pieChart || !this.wrongTypeDistribution) return;
      
      // Destroy existing chart if any
      if (this.pieChart) {
        this.pieChart.destroy();
      }
      
      // Prepare data
      const types = Object.keys(this.wrongTypeDistribution);
      const counts = Object.values(this.wrongTypeDistribution);
      const colors = types.map((type, index) => this.getTypeColor(type, index));
      
      // Create chart
      this.pieChart = new Chart(this.$refs.pieChart, {
        type: 'pie',
        data: {
          labels: types,
          datasets: [{
            data: counts,
            backgroundColor: colors,
            borderColor: colors.map(color => this.darkenColor(color, 10)),
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
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const percentage = this.getTypePercentage(value);
                  return `${label}: ${value} 题 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    getTypeColor(type, index) {
      // Predefined colors for different question types
      const colorMap = {
        '单选题': '#4caf50',
        '多选题': '#2196f3',
        '判断题': '#ff9800',
        '填空题': '#9c27b0',
        '简答题': '#e91e63'
      };
      
      // Return mapped color or generate one based on index
      return colorMap[type] || this.getColorFromIndex(index);
    },
    getColorFromIndex(index) {
      // Generate color based on index
      const colors = [
        '#3f51b5', '#00bcd4', '#009688', '#8bc34a', 
        '#cddc39', '#ffc107', '#795548', '#607d8b'
      ];
      return colors[index % colors.length];
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
    getTypePercentage(count) {
      const total = this.wrongQuestions.count || 0;
      if (total === 0) return 0;
      return ((count / total) * 100).toFixed(1);
    },
    filterQuestions() {
      if (!this.hasWrongQuestions) return;
      
      this.filteredQuestions = this.wrongQuestions.questions.filter(question => {
        const matchesSearch = !this.searchQuery || 
                             question.text.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesType = !this.selectedType || question.type === this.selectedType;
        
        return matchesSearch && matchesType;
      });
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      
      if (text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    },
    viewQuestionDetail(questionId) {
      this.$router.push(`/questions/${questionId}`);
    },
    reviewQuestion(questionId) {
      // Start review mode focused on this specific question
      this.$store.dispatch('quiz/jumpToQuestion', {
        index: this.wrongQuestions.wrongIds.indexOf(questionId),
        mode: 'review'
      }).then(() => {
        this.$router.push('/review');
      });
    },
    startReview() {
      this.$router.push('/review');
    },
    goToQuiz() {
      this.$router.push('/quiz');
    }
  },
  mounted() {
    this.fetchWrongQuestions();
  },
  beforeUnmount() {
    // Cleanup chart when component unmounts
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  },
  watch: {
    // Redraw chart when wrong questions data changes
    'wrongQuestions.count'() {
      this.$nextTick(() => {
        this.initPieChart();
      });
    }
  }
};
</script>

<style scoped>
.stats-wrong-questions {
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

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 15px;
  color: #6c757d;
}

.loading-state i, .empty-state i {
  font-size: 2rem;
}

.empty-state i {
  color: #4caf50;
}

.empty-state p {
  font-size: 1.2rem;
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

.summary-row {
  display: flex;
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
  flex: 1;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffebee;
  color: #e53935;
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
  margin-bottom: 25px;
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

.type-distribution {
  display: flex;
  gap: 30px;
}

.distribution-chart {
  flex: 1;
  height: 300px;
  position: relative;
}

.distribution-legend {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.type-name {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
}

.type-count, .type-percentage {
  font-size: 0.9rem;
  color: #6c757d;
}

.action-row {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.review-button {
  padding: 12px 24px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.review-button:hover {
  background-color: #d32f2f;
}

.questions-list {
  margin-bottom: 30px;
}

.questions-list h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  padding-left: 40px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.type-filter select {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 150px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.type-filter select:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.question-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.question-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.question-header {
  margin-bottom: 15px;
}

.question-type {
  display: inline-block;
  background-color: #ffebee;
  color: #e53935;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-text {
  flex: 1;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #333;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-id {
  font-size: 0.8rem;
  color: #6c757d;
}

.review-now {
  padding: 6px 10px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.review-now:hover {
  background-color: #d32f2f;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .summary-row {
    flex-direction: column;
  }
  
  .type-distribution {
    flex-direction: column;
  }
  
  .distribution-legend {
    width: 100%;
  }
  
  .distribution-chart {
    height: 250px;
  }
}
</style>
