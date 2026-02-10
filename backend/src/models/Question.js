const mongoose = require('mongoose');

// 选项模式定义
const OptionSchema = new mongoose.Schema({
  letter: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

// 题目模式定义
const QuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['单选题', '多选题', '判断题', '填空题', '简答题', '未知类型']
  },
  text: {
    type: String,
    required: true
  },
  options: {
    type: [OptionSchema],
    default: []
  },
  answer: {
    type: String,
    required: true
  },
  bankId: {
    type: String,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  explanation: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新 updatedAt 字段的中间件
QuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 更新 updatedAt 字段的中间件（用于 findOneAndUpdate 等操作）
QuestionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 新增索引
QuestionSchema.index({ bankId: 1 });
QuestionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', QuestionSchema);