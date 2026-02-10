const mongoose = require('mongoose');

const ErrorAnalysisSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    ref: 'Question'
  },
  userAnswer: {
    type: String,
    required: true
  },
  analysis: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  // 记录使用了哪个API生成
  apiIndex: {
    type: Number,
    default: 0
  }
});

// 创建复合索引，因为对于同一题目可能有不同的错误分析（基于不同错误答案）
ErrorAnalysisSchema.index({ questionId: 1, userAnswer: 1 }, { unique: true });

module.exports = mongoose.model('ErrorAnalysis', ErrorAnalysisSchema);