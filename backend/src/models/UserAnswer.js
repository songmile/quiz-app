const mongoose = require('mongoose');

const UserAnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    ref: 'Question'
  },
  userAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  answeredAt: {
    type: Date,
    default: Date.now
  },
  // 用于存储会话信息，比如是正常答题还是错题复习
  sessionType: {
    type: String,
    enum: ['normal', 'review', 'spaced_review', 'flashcard', 'bookmark', 'drill'],
    default: 'normal'
  }
});

// 创建复合索引，优化按问题ID查询
UserAnswerSchema.index({ questionId: 1, answeredAt: -1 });

module.exports = mongoose.model('UserAnswer', UserAnswerSchema);