<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1 class="welcome-title">
        <span>Spring Boot</span>
        <span class="accent">刷题系统</span>
      </h1>
      <p class="welcome-subtitle">提升您的 Spring Boot 技能，掌握核心知识</p>

      <div class="streak-banner" v-if="streakData">
        <div class="streak-fire">
          <i class="fas fa-fire"></i>
          <span class="streak-count">{{ streakData.currentStreak }}</span>
          <span class="streak-label">天连续</span>
        </div>
        <div class="streak-progress">
          <div class="streak-progress-text">
            今日: {{ streakData.todayProgress }} / {{ streakData.dailyGoal }}
          </div>
          <div class="streak-progress-bar">
            <div class="streak-progress-fill" :style="{ width: goalPercent + '%' }"></div>
          </div>
        </div>
        <div class="streak-best" v-if="streakData.longestStreak > 0">
          最长 {{ streakData.longestStreak }} 天
        </div>
      </div>

      <div class="quick-actions">
        <router-link to="/quiz" class="action-card quiz">
          <div class="action-icon">
            <i class="fas fa-pen"></i>
          </div>
          <div class="action-content">
            <h3>开始答题</h3>
            <p>从题库中随机抽题进行答题练习</p>
          </div>
        </router-link>
        
        <router-link to="/review" class="action-card review">
          <div class="action-icon">
            <i class="fas fa-history"></i>
          </div>
          <div class="action-content">
            <h3>错题复习</h3>
            <p>复习之前做错的题目</p>
          </div>
        </router-link>
        
        <router-link to="/questions" class="action-card manage">
          <div class="action-icon">
            <i class="fas fa-folder-open"></i>
          </div>
          <div class="action-content">
            <h3>题库管理</h3>
            <p>浏览、编辑或导入新题目</p>
          </div>
        </router-link>
        
        <router-link to="/bookmarks" class="action-card bookmark">
          <div class="action-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="action-content">
            <h3>我的收藏</h3>
            <p>查看收藏题目，发起专项练习</p>
          </div>
        </router-link>

        <router-link to="/flashcards" class="action-card flashcard">
          <div class="action-icon">
            <i class="fas fa-clone"></i>
          </div>
          <div class="action-content">
            <h3>闪卡模式</h3>
            <p>快速翻卡复习，高效巩固知识</p>
          </div>
        </router-link>

        <router-link to="/drill" class="action-card drill">
          <div class="action-icon">
            <i class="fas fa-crosshairs"></i>
          </div>
          <div class="action-content">
            <h3>智能组卷</h3>
            <p>分析弱项，针对性强化练习</p>
          </div>
        </router-link>

        <router-link to="/stats/overview" class="action-card stats">
          <div class="action-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="action-content">
            <h3>学习统计</h3>
            <p>查看学习进度和统计数据</p>
          </div>
        </router-link>
      </div>
    </div>
    
    <div class="dashboard-section" v-if="overview">
      <div class="dashboard-row">
        <div class="stat-card">
          <div class="stat-header">
            <h3>学习概览</h3>
          </div>
          <div class="stat-body">
            <div class="stat-item">
              <div class="stat-label">完成进度</div>
              <div class="stat-value progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${overview.completionRate}%` }"></div>
                </div>
                <div class="progress-text">{{ overview.completionRate }}%</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">总题数</div>
              <div class="stat-value">{{ overview.totalQuestions }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">已答题</div>
              <div class="stat-value">{{ overview.totalAnswered }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">正确率</div>
              <div class="stat-value">{{ overview.correctRate }}%</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">错题数</div>
              <div class="stat-value">{{ overview.wrongQuestionCount }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">学习时间</div>
              <div class="stat-value">{{ overview.studyTime.formatted }}</div>
            </div>
          </div>
          <div class="stat-footer">
            <router-link to="/stats/overview" class="view-more">查看详情</router-link>
          </div>
        </div>
        
        <div class="stat-card" v-if="wrongQuestions && wrongQuestions.questions?.length > 0">
          <div class="stat-header">
            <h3>最近错题</h3>
          </div>
          <div class="stat-body wrong-questions">
            <div 
              v-for="(question, index) in wrongQuestions.questions.slice(0, 3)" 
              :key="question.id"
              class="wrong-question"
            >
              <div class="question-number">{{ index + 1 }}</div>
              <div class="question-content">
                <div class="question-type">{{ question.type }}</div>
                <div class="question-text">{{ truncateText(question.text, 60) }}</div>
              </div>
            </div>
            
            <div v-if="wrongQuestions.questions.length > 3" class="more-items">
              还有 {{ wrongQuestions.questions.length - 3 }} 道错题...
            </div>
          </div>
          <div class="stat-footer">
            <router-link to="/review" class="view-more primary">开始复习</router-link>
            <router-link to="/stats/wrong-questions" class="view-more">查看全部</router-link>
          </div>
        </div>
      </div>
      
      <div class="dashboard-row" v-if="advisor && advisor.hasEnoughData">
        <div class="stat-card advisor">
          <div class="stat-header">
            <h3>智能顾问建议</h3>
          </div>
          <div class="stat-body">
            <div class="advisor-content">
              <div class="advisor-icon">
                <i class="fas fa-user-graduate"></i>
              </div>
              <div class="advisor-message">
                <p v-for="(advice, index) in advisor.advices.slice(0, 2)" :key="index">
                  {{ advice }}
                </p>
                <div v-if="advisor.advices.length > 2" class="more-items">
                  还有 {{ advisor.advices.length - 2 }} 条建议...
                </div>
              </div>
            </div>
            
            <div class="study-plan" v-if="advisor.plan">
              <h4>学习计划</h4>
              <div class="plan-item">
                <span class="plan-label">每日目标：</span>
                <span>{{ advisor.plan.dailyGoal }} 道题</span>
              </div>
              <div class="plan-item">
                <span class="plan-label">周计划：</span>
                <span>{{ advisor.plan.weeklyPlan }}</span>
              </div>
              <div class="plan-item">
                <span class="plan-label">重点领域：</span>
                <span>{{ advisor.plan.focusAreas }}</span>
              </div>
            </div>
          </div>
          <div class="stat-footer">
            <router-link to="/stats/advisor" class="view-more">查看详情</router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div class="system-features">
      <h2 class="section-title">功能特性</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-database"></i>
          </div>
          <h3>题库管理</h3>
          <p>导入题目、编辑题目、删除题目，支持多种导入方式</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-list-ol"></i>
          </div>
          <h3>多题型支持</h3>
          <p>单选题、多选题、判断题、填空题，全面覆盖</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-robot"></i>
          </div>
          <h3>AI 解析</h3>
          <p>使用 AI 生成详细解析、错误分析和变种题</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <h3>知识图谱</h3>
          <p>自动生成题目相关的知识树，更好地理解知识结构</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-sitemap"></i>
          </div>
          <h3>设计流程</h3>
          <p>分析题目设计思路和流程，理解设计思想</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>学习统计</h3>
          <p>跟踪学习进度、正确率、错题集等学习数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    overview() {
      return this.$store.getters['stats/overview'];
    },
    wrongQuestions() {
      return this.$store.getters['stats/wrongQuestions'];
    },
    advisor() {
      return this.$store.getters['stats/advisor'];
    },
    streakData() {
      return {
        currentStreak: this.$store.getters['streak/currentStreak'],
        longestStreak: this.$store.getters['streak/longestStreak'],
        dailyGoal: this.$store.getters['streak/dailyGoal'],
        todayProgress: this.$store.getters['streak/todayProgress']
      };
    },
    goalPercent() {
      return this.$store.getters['streak/goalPercent'];
    }
  },
  methods: {
    truncateText(text, maxLength) {
      if (!text) return '';
      
      if (text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    }
  },
  created() {
    // Fetch initial data
    this.$store.dispatch('stats/fetchOverview');
    this.$store.dispatch('stats/fetchWrongQuestions');
    this.$store.dispatch('stats/fetchAdvisor');
    this.$store.dispatch('streak/fetchStreak');
    this.$store.dispatch('bookmarks/fetchBookmarkIds');
  }
};
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: #333;
}

.welcome-title .accent {
  color: #1e88e5;
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.streak-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 10px;
  padding: 12px 24px;
  margin-bottom: 25px;
}
.streak-fire {
  display: flex;
  align-items: center;
  gap: 6px;
}
.streak-fire i {
  font-size: 1.5rem;
  color: #ff6d00;
}
.streak-count {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e65100;
}
.streak-label {
  font-size: 0.9rem;
  color: #bf360c;
}
.streak-progress {
  flex: 1;
  max-width: 250px;
}
.streak-progress-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
  text-align: center;
}
.streak-progress-bar {
  height: 8px;
  background: rgba(0,0,0,0.08);
  border-radius: 4px;
  overflow: hidden;
}
.streak-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6d00, #ff9100);
  border-radius: 4px;
  transition: width 0.3s;
}
.streak-best {
  font-size: 0.8rem;
  color: #8d6e63;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.action-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  text-decoration: none;
  color: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.action-card.quiz {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
}

.action-card.review {
  background: linear-gradient(135deg, #e53935, #c62828);
}

.action-card.manage {
  background: linear-gradient(135deg, #8e24aa, #6a1b9a);
}

.action-card.bookmark {
  background: linear-gradient(135deg, #f9a825, #f57f17);
}

.action-card.flashcard {
  background: linear-gradient(135deg, #7b1fa2, #6a1b9a);
}

.action-card.drill {
  background: linear-gradient(135deg, #00897b, #00695c);
}

.action-card.stats {
  background: linear-gradient(135deg, #43a047, #2e7d32);
}

.action-icon {
  font-size: 2rem;
  margin-right: 20px;
}

.action-content h3 {
  font-size: 1.2rem;
  margin: 0 0 5px 0;
}

.action-content p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

.dashboard-section {
  margin-bottom: 40px;
}

.dashboard-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.stat-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.stat-body {
  padding: 20px;
}

.stat-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.view-more {
  font-size: 0.9rem;
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s;
}

.view-more:hover {
  color: #1e88e5;
}

.view-more.primary {
  color: #1e88e5;
  font-weight: 500;
}

.view-more.primary:hover {
  color: #1565c0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.stat-value {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.stat-value.progress {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  margin-left: 15px;
}

.progress-bar {
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

.progress-text {
  font-size: 0.9rem;
  min-width: 45px;
  text-align: right;
}

.wrong-questions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wrong-question {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.question-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e53935;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-type {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 3px;
}

.question-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
}

.more-items {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 5px;
}

.advisor-content {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.advisor-icon {
  font-size: 2.5rem;
  color: #8e24aa;
  flex-shrink: 0;
}

.advisor-message {
  flex: 1;
}

.advisor-message p {
  margin: 0 0 10px 0;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
}

.study-plan {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.study-plan h4 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #333;
}

.plan-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.plan-item:last-child {
  margin-bottom: 0;
}

.plan-label {
  font-weight: 500;
  color: #6c757d;
  margin-right: 5px;
}

.system-features {
  margin-top: 40px;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 30px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #1e88e5;
  border-radius: 3px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.feature-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 25px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  color: #1e88e5;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  color: #333;
}

.feature-card p {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>