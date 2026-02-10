<template>
  <div class="flashcard-page">
    <!-- Setup Screen -->
    <div v-if="!sessionActive && !sessionEnded" class="setup-screen">
      <h2><i class="fas fa-clone"></i> 快速闪卡模式</h2>
      <p class="setup-desc">快速翻卡复习，高效巩固知识点</p>

      <div class="setup-form">
        <div class="form-group">
          <label>题目来源</label>
          <select v-model="source" class="form-select">
            <option value="all">全部题目</option>
            <option value="bookmark">收藏题</option>
            <option value="wrong">错题</option>
          </select>
        </div>
        <div class="form-group">
          <label>数量限制（0=不限）</label>
          <input v-model.number="cardLimit" type="number" min="0" max="200" class="form-input" />
        </div>
        <button class="btn-start" @click="startSession" :disabled="loading">
          <i class="fas fa-play"></i> 开始闪卡
        </button>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>

    <!-- Flashcard Session -->
    <div v-if="sessionActive && currentCard" class="session-screen">
      <div class="session-header">
        <span class="progress-text">{{ currentIndex + 1 }} / {{ totalCards }}</span>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <div class="flashcard-container" @click="flipCard">
        <div class="flashcard" :class="{ flipped: flipped }">
          <div class="flashcard-front">
            <div class="card-type">{{ currentCard.type }}</div>
            <div class="card-text">{{ currentCard.text }}</div>
            <div class="card-options" v-if="currentCard.options && currentCard.options.length">
              <div v-for="opt in currentCard.options" :key="opt.letter" class="card-option">
                <span class="opt-letter">{{ opt.letter }}</span>
                <span>{{ opt.text }}</span>
              </div>
            </div>
            <div class="flip-hint"><i class="fas fa-sync-alt"></i> 点击翻转查看答案</div>
          </div>
          <div class="flashcard-back">
            <div class="answer-section">
              <div class="answer-label">正确答案</div>
              <div class="answer-value">{{ currentCard.answer }}</div>
            </div>
            <div class="explanation-section" v-if="currentCard.explanation">
              <div class="explanation-label">解析</div>
              <div class="explanation-text">{{ currentCard.explanation }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rating-buttons" v-if="flipped">
        <button class="rate-btn again" @click.stop="rate('again')">
          <i class="fas fa-redo"></i> Again
        </button>
        <button class="rate-btn hard" @click.stop="rate('hard')">
          <i class="fas fa-frown"></i> Hard
        </button>
        <button class="rate-btn good" @click.stop="rate('good')">
          <i class="fas fa-smile"></i> Good
        </button>
        <button class="rate-btn easy" @click.stop="rate('easy')">
          <i class="fas fa-grin-stars"></i> Easy
        </button>
      </div>
    </div>

    <!-- Summary Screen -->
    <div v-if="sessionEnded" class="summary-screen">
      <h2><i class="fas fa-flag-checkered"></i> 闪卡完成</h2>
      <div class="summary-stats">
        <div class="summary-item">
          <div class="summary-num">{{ summary.total }}</div>
          <div class="summary-label">总卡片数</div>
        </div>
        <div class="summary-item easy-color">
          <div class="summary-num">{{ summary.counts.easy }}</div>
          <div class="summary-label">Easy</div>
        </div>
        <div class="summary-item good-color">
          <div class="summary-num">{{ summary.counts.good }}</div>
          <div class="summary-label">Good</div>
        </div>
        <div class="summary-item hard-color">
          <div class="summary-num">{{ summary.counts.hard }}</div>
          <div class="summary-label">Hard</div>
        </div>
        <div class="summary-item again-color">
          <div class="summary-num">{{ summary.counts.again }}</div>
          <div class="summary-label">Again</div>
        </div>
      </div>
      <button class="btn-start" @click="resetSession">
        <i class="fas fa-redo"></i> 再来一轮
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlashcardMode',
  data() {
    return {
      source: 'all',
      cardLimit: 0
    };
  },
  computed: {
    currentCard() {
      return this.$store.getters['flashcards/currentCard'];
    },
    currentIndex() {
      return this.$store.getters['flashcards/currentIndex'];
    },
    totalCards() {
      return this.$store.getters['flashcards/totalCards'];
    },
    flipped() {
      return this.$store.getters['flashcards/flipped'];
    },
    sessionActive() {
      return this.$store.getters['flashcards/sessionActive'];
    },
    loading() {
      return this.$store.getters['flashcards/isLoading'];
    },
    error() {
      return this.$store.getters['flashcards/error'];
    },
    summary() {
      return this.$store.getters['flashcards/summary'];
    },
    sessionEnded() {
      return !this.sessionActive && this.summary.total > 0;
    },
    progressPercent() {
      if (this.totalCards === 0) return 0;
      return ((this.currentIndex + 1) / this.totalCards) * 100;
    }
  },
  methods: {
    async startSession() {
      const opts = { source: this.source };
      if (this.cardLimit > 0) opts.limit = this.cardLimit;
      await this.$store.dispatch('flashcards/startSession', opts);
    },
    flipCard() {
      this.$store.dispatch('flashcards/flip');
    },
    rate(rating) {
      this.$store.dispatch('flashcards/rateCard', rating);
    },
    resetSession() {
      this.$store.commit('flashcards/END_SESSION');
      this.$store.commit('flashcards/SET_CARDS', []);
    }
  }
};
</script>

<style scoped>
.flashcard-page {
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
.setup-screen h2 i { color: #7b1fa2; }
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
.form-select, .form-input {
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
  background: linear-gradient(135deg, #7b1fa2, #6a1b9a);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
.error-msg {
  color: #e53935;
  margin-top: 15px;
  font-size: 0.9rem;
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
  background: linear-gradient(90deg, #7b1fa2, #ab47bc);
  transition: width 0.3s;
}

/* Flashcard 3D flip */
.flashcard-container {
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 24px;
}
.flashcard {
  position: relative;
  min-height: 350px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.flashcard.flipped {
  transform: rotateY(180deg);
}
.flashcard-front,
.flashcard-back {
  position: absolute;
  top: 0; left: 0; right: 0;
  min-height: 350px;
  backface-visibility: hidden;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.flashcard-front {
  background: white;
  display: flex;
  flex-direction: column;
}
.flashcard-back {
  background: #f8f9fa;
  transform: rotateY(180deg);
}
.card-type {
  display: inline-block;
  background: #7b1fa2;
  color: white;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 15px;
  align-self: flex-start;
}
.card-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
  flex: 1;
}
.card-options {
  margin-top: 15px;
}
.card-option {
  padding: 6px 0;
  font-size: 0.95rem;
  color: #495057;
}
.opt-letter {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e9ecef;
  text-align: center;
  line-height: 24px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-right: 8px;
}
.flip-hint {
  text-align: center;
  color: #adb5bd;
  font-size: 0.85rem;
  margin-top: 20px;
}

/* Back card */
.answer-section {
  margin-bottom: 20px;
}
.answer-label, .explanation-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 6px;
  font-weight: 500;
}
.answer-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e88e5;
}
.explanation-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #7b1fa2;
}

/* Rating buttons */
.rating-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.rate-btn {
  flex: 1;
  max-width: 140px;
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.rate-btn:hover { opacity: 0.9; }
.rate-btn:active { transform: scale(0.97); }
.rate-btn.again { background: #e53935; }
.rate-btn.hard { background: #f57c00; }
.rate-btn.good { background: #43a047; }
.rate-btn.easy { background: #1e88e5; }

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
  padding: 20px 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  min-width: 90px;
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
.easy-color .summary-num { color: #1e88e5; }
.good-color .summary-num { color: #43a047; }
.hard-color .summary-num { color: #f57c00; }
.again-color .summary-num { color: #e53935; }

@media (max-width: 768px) {
  .flashcard-page {
    padding: 10px;
  }

  .flashcard-container {
    min-height: 260px;
  }

  .flashcard {
    min-height: 260px;
  }

  .flashcard-front,
  .flashcard-back {
    padding: 20px;
    min-height: 260px;
  }

  .rating-buttons {
    flex-direction: column;
    gap: 8px;
    max-width: 100%;
  }

  .rate-btn {
    padding: 10px;
    font-size: 0.85rem;
    max-width: 100%;
  }

  .setup-screen h2 {
    font-size: 1.4rem;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
