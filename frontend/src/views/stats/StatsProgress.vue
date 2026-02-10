<template>
  <div class="stats-progress">
    <h1 class="page-title">学习进度</h1>

    <div class="loading-state" v-if="loading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载中...</span>
    </div>

    <template v-else>
      <!-- 总体掌握度 -->
      <div class="mastery-overview" v-if="mastery">
        <div class="mastery-card">
          <div class="mastery-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e88e5" stroke-width="10"
                :stroke-dasharray="314"
                :stroke-dashoffset="314 - (314 * (mastery.masteryRate || 0) / 100)"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"/>
            </svg>
            <div class="mastery-percent">{{ mastery.masteryRate }}%</div>
          </div>
          <div class="mastery-label">总体掌握度</div>
        </div>

        <div class="mastery-stats">
          <div class="mastery-stat-item">
            <div class="stat-number mastered">{{ mastery.masteredCount }}</div>
            <div class="stat-desc">已掌握</div>
          </div>
          <div class="mastery-stat-item">
            <div class="stat-number learning">{{ mastery.learningCount }}</div>
            <div class="stat-desc">学习中</div>
          </div>
          <div class="mastery-stat-item">
            <div class="stat-number new-q">{{ mastery.newCount }}</div>
            <div class="stat-desc">未学习</div>
          </div>
          <div class="mastery-stat-item">
            <div class="stat-number due">{{ mastery.dueCount }}</div>
            <div class="stat-desc">待复习</div>
          </div>
        </div>
      </div>

      <!-- 题库进度 -->
      <div class="section" v-if="bankProgress && bankProgress.length > 0">
        <h2 class="section-title">题库进度</h2>
        <div class="progress-grid">
          <div class="progress-card" v-for="bank in bankProgress" :key="bank.bankId || 'ungrouped'">
            <div class="progress-card-header">
              <h3>{{ bank.bankName }}</h3>
              <span class="badge">{{ bank.totalQuestions }} 题</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: completionPercent(bank) + '%' }"></div>
              </div>
              <span class="progress-text">{{ completionPercent(bank) }}%</span>
            </div>
            <div class="progress-details">
              <span>已答: {{ bank.answeredCount }}</span>
              <span>正确率: {{ bank.correctRate }}%</span>
              <span>掌握: {{ bank.masteryRate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签进度 -->
      <div class="section" v-if="tagProgress && tagProgress.length > 0">
        <h2 class="section-title">标签进度</h2>
        <div class="tag-progress-list">
          <div class="tag-progress-item" v-for="tag in tagProgress" :key="tag.tag">
            <div class="tag-info">
              <span class="tag-name">{{ tag.tag }}</span>
              <span class="tag-count">{{ tag.totalQuestions }} 题</span>
            </div>
            <div class="tag-bar-container">
              <div class="tag-bar">
                <div class="tag-bar-fill mastery" :style="{ width: tag.masteryRate + '%' }"></div>
                <div class="tag-bar-fill correct" :style="{ width: tag.correctRate + '%' }"></div>
              </div>
            </div>
            <div class="tag-stats">
              <span>正确率 {{ tag.correctRate }}%</span>
              <span>掌握 {{ tag.masteryRate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="(!bankProgress || bankProgress.length === 0) && (!tagProgress || tagProgress.length === 0) && !mastery">
        <i class="fas fa-chart-bar"></i>
        <p>暂无进度数据，开始做题后将显示学习进度</p>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'StatsProgress',
  computed: {
    mastery() { return this.$store.getters['stats/mastery']; },
    bankProgress() { return this.$store.getters['stats/bankProgress']; },
    tagProgress() { return this.$store.getters['stats/tagProgress']; },
    loading() { return this.$store.getters['stats/isLoading']; }
  },
  methods: {
    completionPercent(bank) {
      if (!bank.totalQuestions) return 0;
      return ((bank.answeredCount / bank.totalQuestions) * 100).toFixed(0);
    }
  },
  created() {
    this.$store.dispatch('stats/fetchMastery');
    this.$store.dispatch('stats/fetchBankProgress');
    this.$store.dispatch('stats/fetchTagProgress');
  }
};
</script>
