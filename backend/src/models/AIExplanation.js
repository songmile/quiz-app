const mongoose = require('mongoose');

const AIExplanationSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Question'
  },
  explanation: {
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

// 创建索引以优化查询
AIExplanationSchema.index({ questionId: 1 });

module.exports = mongoose.model('AIExplanation', AIExplanationSchema);