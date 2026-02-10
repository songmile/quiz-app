const mongoose = require('mongoose');

// API配置模式
const ApiConfigSchema = new mongoose.Schema({
  api_key: {
    type: String,
    default: ''
  },
  api_url: {
    type: String,
    default: 'https://api.siliconflow.cn/v1/chat/completions'
  },
  model: {
    type: String,
    default: 'Qwen/Qwen2.5-7B-Instruct'
  },
  chunk_size: {
    type: Number,
    default: 1000
  },
  max_tokens: {
    type: Number,
    default: 4096
  },
  name: {
    type: String,
    default: '未命名API'
  }
});

// 字体设置模式
const FontSettingsSchema = new mongoose.Schema({
  question_font_size: {
    type: Number,
    default: 12
  },
  option_font_size: {
    type: Number,
    default: 11
  },
  answer_font_size: {
    type: Number,
    default: 11
  },
  explanation_font_size: {
    type: Number,
    default: 11
  },
  ai_font_size: {
    type: Number,
    default: 11
  },
  error_font_size: {
    type: Number,
    default: 11
  },
  variant_font_size: {
    type: Number,
    default: 11
  }
});

// 应用设置模式
const SettingsSchema = new mongoose.Schema({
  api_configs: {
    type: [ApiConfigSchema],
    default: []
  },
  font_settings: {
    type: FontSettingsSchema,
    default: () => ({})
  },
  import_max_concurrent: {
    type: Number,
    default: 2
  },
  import_batch_delay: {
    type: Number,
    default: 2
  },
  explanation_api_index: {
    type: Number,
    default: 0
  },
  autosave_interval: {
    type: Number,
    default: 5
  },
  knowledge_tree_api_index: {
    type: Number,
    default: 2
  },
  design_process_api_index: {
    type: Number,
    default: 3
  },
  // 记录上次更新时间
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  // 强制使用设置的模式，便于未来添加字段时的保护
  strict: true
});

// 更新 lastUpdated 字段的中间件
SettingsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// 创建单例模型，因为全系统只有一份设置
module.exports = mongoose.model('Settings', SettingsSchema);