const mongoose = require('mongoose');

// 复用选项模式
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

const VariantQuestionSchema = new mongoose.Schema({
  originalQuestionId: {
    type: String,
    required: true,
    ref: 'Question'
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
  explanation: {
    type: String,
    default: ''
  },
  // 与原题的关系说明
  relation: {
    type: String,
    default: ''
  },
  // 原始生成内容，以防解析失败时保存
  rawContent: {
    type: String,
    default: ''
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

// 创建索引
VariantQuestionSchema.index({ originalQuestionId: 1 });

module.exports = mongoose.model('VariantQuestion', VariantQuestionSchema);