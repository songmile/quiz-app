const mongoose = require('mongoose');

const DesignProcessSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Question'
  },
  // 使用Mixed类型来存储复杂的设计流程数据
  processData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // 如果API生成失败，可能会以纯文本形式保存
  rawText: {
    type: String,
    default: ''
  },
  // Mermaid流程图代码
  flowcharts: [{
    title: String,
    description: String,
    mermaidCode: String
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  // 记录使用了哪个API生成
  apiIndex: {
    type: Number,
    default: 3  // 默认使用专门的设计流程API
  }
});

// 创建索引
DesignProcessSchema.index({ questionId: 1 });

module.exports = mongoose.model('DesignProcess', DesignProcessSchema);