<template>
  <div class="question-card" :class="{ 'answered': isAnswered }">
    <div class="question-header">
      <div class="question-meta">
        <span class="question-type">{{ question.type }}</span>
        <span class="question-id">ID: {{ question.id }}</span>
        <button
          class="bookmark-btn"
          :class="{ 'bookmarked': isBookmarked }"
          @click="toggleBookmark"
          :title="isBookmarked ? '取消收藏' : '收藏'"
        >
          <i :class="isBookmarked ? 'fas fa-star' : 'far fa-star'"></i>
        </button>
      </div>
      <div class="question-navigation" v-if="showNavigation">
        <span class="question-index">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
        <div class="question-nav-buttons">
          <button class="nav-button" @click="previous" :disabled="isFirst">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="nav-button" @click="next" :disabled="isLast">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="question-content" :style="{ fontSize: `${questionFontSize}px` }">
      {{ question.text }}
    </div>
    
    <div class="question-options" v-if="hasOptions">
      <div
        v-for="option in question.options"
        :key="option.letter"
        class="option"
        :class="{
          'selected': userAnswer.includes(option.letter),
          'correct': isAnswered && isOptionCorrect(option.letter),
          'incorrect': isAnswered && isOptionIncorrect(option.letter)
        }"
        @click="selectOption(option.letter)"
        :style="{ fontSize: `${optionFontSize}px` }"
      >
        <div class="option-marker">{{ option.letter }}</div>
        <div class="option-text">{{ option.text }}</div>
      </div>
    </div>
    
    <div class="fill-in-answer" v-else-if="question.type === '填空题'">
      <textarea
        v-model="fillInAnswer"
        placeholder="请在此输入答案..."
        rows="4"
        :style="{ fontSize: `${optionFontSize}px` }"
        :disabled="isAnswered"
      ></textarea>
    </div>
    
    <div class="true-false-options" v-else-if="question.type === '判断题'">
      <button
        class="tf-option"
        :class="{ 'selected': userAnswer === '对', 
                 'correct': isAnswered && correctAnswer === '对',
                 'incorrect': isAnswered && userAnswer === '对' && correctAnswer !== '对' }"
        @click="selectOption('对')"
        :disabled="isAnswered"
      >
        <i class="fas fa-check"></i> 对
      </button>
      <button
        class="tf-option"
        :class="{ 'selected': userAnswer === '错', 
                 'correct': isAnswered && correctAnswer === '错',
                 'incorrect': isAnswered && userAnswer === '错' && correctAnswer !== '错' }"
        @click="selectOption('错')"
        :disabled="isAnswered"
      >
        <i class="fas fa-times"></i> 错
      </button>
    </div>
    
    <div class="question-actions">
      <button
        class="submit-button"
        @click="submitAnswer"
        :disabled="!canSubmit || isAnswered"
      >
        提交答案
      </button>
      <button
        class="next-button"
        @click="next"
        v-if="isAnswered && !isLast"
      >
        下一题
      </button>
    </div>
    
    <div class="answer-feedback" v-if="isAnswered">
      <div class="feedback-header" :class="isCorrect ? 'correct' : 'incorrect'">
        <i :class="isCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ isCorrect ? '回答正确！' : '回答错误！' }}
      </div>
      
      <div class="correct-answer" v-if="!isCorrect">
        <div class="answer-label">正确答案：</div>
        <div class="answer-value">{{ correctAnswer }}</div>
      </div>
      
      <div class="explanation" v-if="question.explanation">
        <div class="explanation-label">解析：</div>
        <div class="explanation-content" :style="{ fontSize: `${explanationFontSize}px` }">
          {{ question.explanation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionCard',
  props: {
    question: {
      type: Object,
      required: true
    },
    currentIndex: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 1
    },
    isFirst: {
      type: Boolean,
      default: false
    },
    isLast: {
      type: Boolean,
      default: false
    },
    initialAnswer: {
      type: String,
      default: ''
    },
    submittedAnswer: {
      type: String,
      default: null
    },
    correctAnswer: {
      type: String,
      default: ''
    },
    isCorrect: {
      type: Boolean,
      default: null
    },
    showNavigation: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      userAnswer: this.initialAnswer || '', // Can be multiple answers for multiple choice
      fillInAnswer: this.initialAnswer || ''
    };
  },
  watch: {
    // Reset answer when question changes
    question(newQuestion, oldQuestion) {
      if (newQuestion.id !== oldQuestion.id) {
        this.userAnswer = this.initialAnswer || '';
        this.fillInAnswer = this.initialAnswer || '';
      }
    },
    // Update userAnswer when initialAnswer changes
    initialAnswer(newValue) {
      this.userAnswer = newValue || '';
      this.fillInAnswer = newValue || '';
    },
    // For fill-in questions, update userAnswer from fillInAnswer
    fillInAnswer(newValue) {
      if (this.question.type === '填空题') {
        this.userAnswer = newValue;
        this.$emit('update:answer', newValue);
      }
    }
  },
  computed: {
    hasOptions() {
      return this.question.type === '单选题' || this.question.type === '多选题';
    },
    isAnswered() {
      return this.submittedAnswer !== null;
    },
    canSubmit() {
      return this.userAnswer && this.userAnswer.length > 0;
    },
    isBookmarked() {
      return this.$store.getters['bookmarks/isBookmarked'](this.question.id);
    },
    // Font sizes from store
    questionFontSize() {
      return this.$store.getters['settings/questionFontSize'] || 14;
    },
    optionFontSize() {
      return this.$store.getters['settings/optionFontSize'] || 13;
    },
    explanationFontSize() {
      return this.$store.getters['settings/explanationFontSize'] || 13;
    }
  },
  methods: {
    selectOption(letter) {
      if (this.isAnswered) return;
      
      if (this.question.type === '单选题' || this.question.type === '判断题') {
        // Single choice questions
        this.userAnswer = letter;
      } else if (this.question.type === '多选题') {
        // Multiple choice questions
        if (this.userAnswer.includes(letter)) {
          // Remove option if already selected
          this.userAnswer = this.userAnswer.split(',').filter(opt => opt !== letter).join(',');
        } else {
          // Add option
          const options = this.userAnswer ? this.userAnswer.split(',') : [];
          options.push(letter);
          // Sort options alphabetically for consistency
          this.userAnswer = options.sort().join(',');
        }
      }
      
      // Emit answer update event
      this.$emit('update:answer', this.userAnswer);
    },
    isOptionCorrect(letter) {
      const correctAnswers = this.correctAnswer ? this.correctAnswer.split(',') : [];
      return correctAnswers.includes(letter);
    },
    isOptionIncorrect(letter) {
      // An option is incorrect if it's selected but not correct, or not selected but correct
      const correctAnswers = this.correctAnswer ? this.correctAnswer.split(',') : [];
      const userAnswers = this.submittedAnswer ? this.submittedAnswer.split(',') : [];
      
      return (userAnswers.includes(letter) && !correctAnswers.includes(letter)) ||
             (!userAnswers.includes(letter) && correctAnswers.includes(letter));
    },
    submitAnswer() {
      if (!this.canSubmit || this.isAnswered) return;
      this.$emit('submit', this.userAnswer);
    },
    next() {
      this.$emit('next');
    },
    previous() {
      this.$emit('previous');
    },
    toggleBookmark() {
      this.$store.dispatch('bookmarks/toggleBookmark', this.question.id);
    }
  }
};
</script>

<style scoped>
.question-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

.question-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-type {
  background-color: #1e88e5;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-id {
  font-size: 0.8rem;
  color: #6c757d;
}

.bookmark-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #dee2e6;
  cursor: pointer;
  padding: 2px 6px;
  transition: color 0.2s, transform 0.2s;
}
.bookmark-btn:hover {
  color: #f9a825;
  transform: scale(1.15);
}
.bookmark-btn.bookmarked {
  color: #f9a825;
}

.question-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.question-index {
  font-size: 0.9rem;
  color: #6c757d;
}

.question-nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-button {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-content {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 20px;
  white-space: pre-line; /* Preserves line breaks */
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: flex-start;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover:not(.selected):not(.correct):not(.incorrect) {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.option.selected {
  background-color: #e3f2fd;
  border-color: #90caf9;
}

.option.correct {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
}

.option.incorrect {
  background-color: #ffebee;
  border-color: #ef9a9a;
}

.option-marker {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 10px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.option.selected .option-marker {
  background-color: #1e88e5;
  color: white;
}

.option.correct .option-marker {
  background-color: #4caf50;
  color: white;
}

.option.incorrect .option-marker {
  background-color: #f44336;
  color: white;
}

.option-text {
  flex-grow: 1;
  line-height: 1.4;
}

.fill-in-answer {
  margin-bottom: 20px;
}

.fill-in-answer textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.fill-in-answer textarea:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.fill-in-answer textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.true-false-options {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.tf-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tf-option:hover:not(.selected):not(.correct):not(.incorrect):not(:disabled) {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.tf-option.selected {
  background-color: #e3f2fd;
  border-color: #90caf9;
  font-weight: 500;
}

.tf-option.correct {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
  font-weight: 500;
}

.tf-option.incorrect {
  background-color: #ffebee;
  border-color: #ef9a9a;
  font-weight: 500;
}

.tf-option:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.question-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-button, .next-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button {
  background-color: #1e88e5;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.submit-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.next-button {
  background-color: #4caf50;
  color: white;
}

.next-button:hover {
  background-color: #43a047;
}

.answer-feedback {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 6px;
}

.feedback-header.correct {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.feedback-header.incorrect {
  background-color: #ffebee;
  color: #c62828;
}

.feedback-header i {
  font-size: 1.3rem;
}

.correct-answer {
  display: flex;
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.answer-label {
  font-weight: 500;
  margin-right: 10px;
  color: #495057;
}

.answer-value {
  color: #1e88e5;
  font-weight: 500;
}

.explanation {
  margin-top: 15px;
}

.explanation-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #495057;
}

.explanation-content {
  line-height: 1.5;
  white-space: pre-line; /* Preserves line breaks */
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #1e88e5;
}
</style>