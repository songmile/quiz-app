const mongoose = require('mongoose');

const KnowledgeTreeSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Question'
  },
  // 使用Mixed类型来存储复杂的树状结构
  treeData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // 如果API生成失败，可能会以纯文本形式保存
  rawText: {
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
    default: 2  // 默认使用专门的知识树API
  }
});

// 创建索引
KnowledgeTreeSchema.index({ questionId: 1 });

module.exports = mongoose.model('KnowledgeTree', KnowledgeTreeSchema);