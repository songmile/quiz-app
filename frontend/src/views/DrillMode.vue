<template>
  <div class="drill-page">
    <!-- Setup Screen -->
    <div v-if="!sessionActive && !sessionEnded" class="setup-screen">
      <h2><i class="fas fa-crosshairs"></i> 薄弱点智能组卷</h2>
      <p class="setup-desc">根据答题数据自动分析弱项，针对性练习</p>

      <div class="analysis-panel" v-if="Object.keys(analysis).length > 0">
        <h3>弱项分析</h3>
        <div class="analysis-list">
          <div v-for="(data, type) in analysis" :key="type" class="analysis-item">
            <span class="analysis-type">{{ type }}</span>
            <div class="analysis-bar-wrap">
              <div class="analysis-bar-fill" :style="{ width: data.rate + '%' }"></div>
            </div>
            <span class="analysis-rate">{{ data.rate }}%</span>
          </div>
        </div>
      </div>

      <div class="setup-form">
        <div class="form-group">
          <label>组卷题数</label>
          <input v-model.number="drillCount" type="number" min="5" max="50" class="form-input" />
        </div>
        <button class="btn-start" @click="startDrill" :disabled="loading">
          <i class="fas fa-play"></i> 开始智能练习
        </button>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>

    <!-- Quiz Session -->
    <div v-if="sessionActive && currentQuestion" class="session-screen">
      <div class="session-header">
        <span class="progress-text">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <QuestionCard
        :question="currentQuestion"
        :currentIndex="currentIndex"
        :totalQuestions="totalQuestions"
        :isFirst="currentIndex === 0"
        :isLast="currentIndex === totalQuestions - 1"
        :submittedAnswer="submittedAnswer"
        :correctAnswer="currentQuestion.answer"
        :isCorrect="isCorrect"
        :showNavigation="false"
        @submit="onSubmit"
        @next="onNext"
        @update:answer="onAnswerUpdate"
      />
    </div>

    <!-- Summary Screen -->
    <div v-if="sessionEnded" class="summary-screen">
      <h2><i class="fas fa-flag-checkered"></i> 练习完成</h2>
      <div class="summary-stats">
        <div class="summary-item">
          <div class="summary-num">{{ summary.total }}</div>
          <div class="summary-label">总题数</div>
        </div>
        <div class="summary-item correct-color">
          <div class="summary-num">{{ summary.correct }}</div>
          <div class="summary-label">正确</div>
        </div>
        <div class="summary-item">
          <div class="summary-num">{{ summary.rate }}%</div>
          <div class="summary-label">正确率</div>
        </div>
      </div>
      <button class="btn-start" @click="resetDrill">
        <i class="fas fa-redo"></i> 再来一轮
      </button>
    </div>
  </div>
</template>

<script>
import QuestionCard from '@/components/quiz/QuestionCard.vue';

export default {
  name: 'DrillMode',
  components: { QuestionCard },
  data() {
    return {
      drillCount: 20
    };
  },
  computed: {
    currentQuestion() {
      return this.$store.getters['drill/currentQuestion'];
    },
    currentIndex() {
      return this.$store.getters['drill/currentIndex'];
    },
    totalQuestions() {
      return this.$store.getters['drill/totalQuestions'];
    },
    submittedAnswer() {
      return this.$store.getters['drill/submittedAnswer'];
    },
    isCorrect() {
      return this.$store.getters['drill/isCorrect'];
    },
    sessionActive() {
      return this.$store.getters['drill/sessionActive'];
    },
    analysis() {
      return this.$store.getters['drill/analysis'];
    },
    summary() {
      return this.$store.getters['drill/summary'];
    },
    loading() {
      return this.$store.getters['drill/isLoading'];
    },
    error() {
      return this.$store.getters['drill/error'];
    },
    sessionEnded() {
      return !this.sessionActive && this.summary.total > 0;
    },
    progressPercent() {
      if (this.totalQuestions === 0) return 0;
      return ((this.currentIndex + 1) / this.totalQuestions) * 100;
    }
  },
  methods: {
    async startDrill() {
      await this.$store.dispatch('drill/startDrill', this.drillCount);
    },
    onAnswerUpdate(answer) {
      this.$store.dispatch('drill/setUserAnswer', answer);
    },
    async onSubmit() {
      await this.$store.dispatch('drill/submitAnswer');
    },
    onNext() {
      this.$store.dispatch('drill/nextQuestion');
    },
    resetDrill() {
      this.$store.commit('drill/END_SESSION');
      this.$store.commit('drill/SET_DRILL', { questions: [], analysis: this.analysis });
    }
  },
  created() {
    this.$store.dispatch('drill/fetchAnalysis');
  }
};
</script>

<style scoped>
.drill-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.setup-screen, .summary-screen {
  text-align: center;
  padding: 40px 20px;
}
.setup-screen h2, .summary-screen h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
}
.setup-screen h2 i { color: #00897b; }
.summary-screen h2 i { color: #43a047; }
.setup-desc {
  color: #6c757d;
  margin-bottom: 30px;
}
.setup-form {
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.95rem;
}
.btn-start {
  display: block;
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
.error-msg {
  color: #e53935;
  margin-top: 15px;
  font-size: 0.9rem;
}

/* Analysis panel */
.analysis-panel {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: left;
}
.analysis-panel h3 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  color: #333;
}
.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.analysis-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.analysis-type {
  min-width: 70px;
  font-size: 0.85rem;
  color: #495057;
}
.analysis-bar-wrap {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}
.analysis-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #e53935, #43a047);
  border-radius: 4px;
}
.analysis-rate {
  min-width: 40px;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

/* Session header */
.session-header {
  margin-bottom: 20px;
}
.progress-text {
  display: block;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}
.progress-bar-wrap {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00897b, #26a69a);
  transition: width 0.3s;
}

/* Summary */
.summary-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  flex-wrap: wrap;
}
.summary-item {
  background: white;
  border-radius: 10px;
  padding: 20px 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.summary-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}
.summary-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 4px;
}
.correct-color .summary-num { color: #43a047; }

@media (max-width: 768px) {
  .drill-page {
    padding: 10px;
  }

  .setup-screen,
  .summary-screen {
    padding: 20px 10px;
  }

  .setup-screen h2 {
    font-size: 1.4rem;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }

  .analysis-item {
    font-size: 0.8rem;
  }
}
</style>
