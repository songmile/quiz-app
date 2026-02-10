const mongoose = require('mongoose');

// 学习会话模式
const SessionSchema = new mongoose.Schema({
  start_time: {
    type: String,
    required: true
  },
  questions_answered: {
    type: Number,
    default: 0
  },
  correct_answers: {
    type: Number,
    default: 0
  }
});

// 分类统计模式
const CategoryStatsSchema = new mongoose.Schema({
  // 使用Map类型来存储不同分类的统计
  stats: {
    type: Map,
    of: {
      total: {
        type: Number,
        default: 0
      },
      correct: {
        type: Number,
        default: 0
      }
    }
  }
});

// 错误模式分析
const ErrorPatternSchema = new mongoose.Schema({
  // 使用Map类型来存储不同错误模式的统计
  patterns: {
    type: Map,
    of: Number
  }
});

// 统计数据模式
const StatisticsSchema = new mongoose.Schema({
  total_answered: {
    type: Number,
    default: 0
  },
  correct: {
    type: Number,
    default: 0
  },
  sessions: {
    type: [SessionSchema],
    default: []
  },
  // 按分类的统计
  category_stats: {
    type: CategoryStatsSchema,
    default: () => ({})
  },
  // 错误模式分析
  error_patterns: {
    type: ErrorPatternSchema,
    default: () => ({})
  },
  // 学习时间（分钟）
  study_time: {
    type: Number,
    default: 0
  },
  // 错题ID集合
  wrong_questions: {
    type: [String],
    default: []
  },
  // 用于维护界面状态记录
  view_history: {
    type: Map,
    of: {
      current_question_index: Number,
      timestamp: String
    },
    default: new Map()
  },
  // 上次更新时间
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// 更新 lastUpdated 字段的中间件
StatisticsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// 创建单例模型，因为全系统只有一份统计数据
module.exports = mongoose.model('Statistics', StatisticsSchema);