const Statistics = require('../models/Statistics');
const Question = require('../models/Question');
const UserAnswer = require('../models/UserAnswer');
const ReviewCard = require('../models/ReviewCard');
const QuestionBank = require('../models/QuestionBank');
const { AppError } = require('../middleware/errorHandler');
const statsService = require('../services/statsService');
const { formatDateTime } = require('../utils/helpers');

/**
 * 获取所有统计数据
 * @route GET /api/stats
 */
const getStats = async (req, res) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  res.status(200).json({
    status: 'success',
    data: stats
  });
};

/**
 * 获取概览统计数据
 * @route GET /api/stats/overview
 */
const getOverview = async (req, res) => {
  // 查询题目总数
  const totalQuestions = await Question.countDocuments();
  
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  // 计算正确率
  let correctRate = 0;
  if (stats.total_answered > 0) {
    correctRate = (stats.correct / stats.total_answered) * 100;
  }

  // 计算完成进度
  let completionRate = 0;
  if (totalQuestions > 0) {
    completionRate = (stats.total_answered / totalQuestions) * 100;
  }

  // 获取错题数量
  const wrongQuestionCount = stats.wrong_questions.length;

  // 转换学习时间
  const studyHours = Math.floor(stats.study_time / 60);
  const studyMinutes = Math.floor(stats.study_time % 60);

  res.status(200).json({
    status: 'success',
    data: {
      totalQuestions,
      totalAnswered: stats.total_answered,
      correct: stats.correct,
      correctRate: correctRate.toFixed(1),
      completionRate: completionRate.toFixed(1),
      wrongQuestionCount,
      studyTime: {
        total: stats.study_time,
        hours: studyHours,
        minutes: studyMinutes,
        formatted: `${studyHours}小时${studyMinutes}分钟`
      },
      lastUpdated: stats.lastUpdated
    }
  });
};

/**
 * 获取分类统计数据
 * @route GET /api/stats/categories
 */
const getCategoryStats = async (req, res) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  // 查询每种题型的总数
  const questionTypes = await Question.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // 转换为更易读的格式
  const categories = {};
  
  // 初始化各分类统计
  questionTypes.forEach(type => {
    categories[type._id] = {
      total: type.count,
      answered: 0,
      correct: 0,
      correctRate: '0.0'
    };
  });

  // 添加统计数据中的分类统计
  const categoryStats = stats.category_stats;
  if (categoryStats && categoryStats.stats) {
    for (const [category, data] of categoryStats.stats.entries()) {
      if (categories[category]) {
        categories[category].answered = data.total || 0;
        categories[category].correct = data.correct || 0;
        
        // 计算正确率
        if (data.total > 0) {
          categories[category].correctRate = ((data.correct / data.total) * 100).toFixed(1);
        }
      }
    }
  }

  res.status(200).json({
    status: 'success',
    data: categories
  });
};

/**
 * 获取错题统计
 * @route GET /api/stats/wrong-questions
 */
const getWrongQuestions = async (req, res) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  // 获取错题ID列表
  const wrongIds = stats.wrong_questions;

  // 查询错题详细信息
  const wrongQuestions = await Question.find({ 
    id: { $in: wrongIds } 
  });

  // 统计错题类型分布
  const wrongTypes = {};
  wrongQuestions.forEach(question => {
    const type = question.type;
    wrongTypes[type] = (wrongTypes[type] || 0) + 1;
  });

  // 计算错题率
  const totalQuestions = await Question.countDocuments();
  const wrongRate = totalQuestions > 0 ? (wrongIds.length / totalQuestions) * 100 : 0;

  res.status(200).json({
    status: 'success',
    count: wrongIds.length,
    wrongRate: wrongRate.toFixed(1),
    wrongTypes,
    wrongIds,
    questions: wrongQuestions.map(q => ({
      id: q.id,
      type: q.type,
      text: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '')
    }))
  });
};

/**
 * 获取会话记录
 * @route GET /api/stats/sessions
 */
const getSessions = async (req, res) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  // 获取会话记录
  const sessions = stats.sessions;

  // 添加计算字段
  const enhancedSessions = sessions.map(session => {
    let correctRate = 0;
    if (session.questions_answered > 0) {
      correctRate = (session.correct_answers / session.questions_answered) * 100;
    }

    return {
      ...session.toObject(),
      correctRate: correctRate.toFixed(1)
    };
  });

  res.status(200).json({
    status: 'success',
    count: enhancedSessions.length,
    data: enhancedSessions
  });
};

/**
 * 获取学习趋势数据
 * @route GET /api/stats/trends
 */
const getTrends = async (req, res) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  // 获取会话记录
  const sessions = stats.sessions;

  // 会话数小于3个，无法计算趋势
  if (sessions.length < 3) {
    return res.status(200).json({
      status: 'success',
      message: '会话数量不足，无法计算趋势',
      hasTrend: false
    });
  }

  // 计算趋势数据
  const trendData = await statsService.calculateLearningTrend(sessions);

  // 获取易错题型数据
  const errorTypeData = await statsService.getErrorTypeStats();

  res.status(200).json({
    status: 'success',
    hasTrend: true,
    data: {
      trend: trendData,
      errorTypes: errorTypeData
    }
  });
};

/**
 * 开始新的学习会话
 * @route POST /api/stats/sessions/start
 */
const startSession = async (req, res) => {
  const { mode = 'normal' } = req.body;
  
  // 开始新会话
  const session = await statsService.startStudySession(mode);

  res.status(200).json({
    status: 'success',
    message: '学习会话已开始',
    session
  });
};

/**
 * 结束学习会话
 * @route POST /api/stats/sessions/end
 */
const endSession = async (req, res) => {
  // 结束当前学习会话
  const duration = await statsService.endStudySession();

  res.status(200).json({
    status: 'success',
    message: '学习会话已结束',
    durationMinutes: duration
  });
};

/**
 * 重置统计数据
 * @route POST /api/stats/reset
 */
const resetStats = async (req, res) => {
  // 重置统计数据
  await statsService.resetStatistics();

  res.status(200).json({
    status: 'success',
    message: '统计数据已重置'
  });
};

/**
 * 获取智能顾问建议
 * @route GET /api/stats/advisor
 */
const getAdvisorSuggestions = async (req, res) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    throw new AppError('统计数据不存在', 404);
  }

  // 如果数据不足，无法提供建议
  if (stats.total_answered < 10) {
    return res.status(200).json({
      status: 'success',
      message: '学习数据不足，需要完成至少10道题目才能提供个性化建议',
      hasEnoughData: false
    });
  }

  // 生成智能顾问建议
  const advisorData = await statsService.generateAdvisorSuggestions();

  res.status(200).json({
    status: 'success',
    hasEnoughData: true,
    data: advisorData
  });
};

/**
 * 更新界面历史记录
 * @route POST /api/stats/view-history
 */
const updateViewHistory = async (req, res) => {
  const { view, currentIndex } = req.body;
  
  if (!view || currentIndex === undefined) {
    throw new AppError('请提供视图名称和当前题目索引', 400);
  }

  // 更新界面历史记录
  await statsService.updateViewHistory(view, currentIndex);

  res.status(200).json({
    status: 'success',
    message: '界面历史记录已更新'
  });
};

/**
 * 获取标签进度
 * @route GET /api/stats/tag-progress
 */
const getTagProgress = async (req, res) => {
  const allTags = await Question.distinct('tags');
  const progress = [];

  for (const tag of allTags.filter(t => t)) {
    const totalQuestions = await Question.countDocuments({ tags: tag });
    const questionIds = await Question.find({ tags: tag }).distinct('id');

    const answered = await UserAnswer.aggregate([
      { $match: { questionId: { $in: questionIds } } },
      { $group: { _id: '$questionId', latest: { $last: '$isCorrect' } } }
    ]);

    const correctCount = answered.filter(a => a.latest).length;
    const masteredCount = await ReviewCard.countDocuments({
      questionId: { $in: questionIds },
      repetitions: { $gte: 3 }
    });

    progress.push({
      tag,
      totalQuestions,
      answeredCount: answered.length,
      correctCount,
      correctRate: answered.length > 0 ? ((correctCount / answered.length) * 100).toFixed(1) : '0.0',
      masteredCount,
      masteryRate: totalQuestions > 0 ? ((masteredCount / totalQuestions) * 100).toFixed(1) : '0.0'
    });
  }

  res.status(200).json({ status: 'success', data: progress });
};

/**
 * 获取掌握度概览
 * @route GET /api/stats/mastery
 */
const getMasteryOverview = async (req, res) => {
  const totalQuestions = await Question.countDocuments();
  const totalCards = await ReviewCard.countDocuments();
  const masteredCount = await ReviewCard.countDocuments({ repetitions: { $gte: 3 } });
  const learningCount = await ReviewCard.countDocuments({ repetitions: { $gt: 0, $lt: 3 } });
  const newCount = totalQuestions - totalCards;
  const dueCount = await ReviewCard.countDocuments({ nextReviewDate: { $lte: new Date() } });

  res.status(200).json({
    status: 'success',
    data: {
      totalQuestions,
      masteredCount,
      learningCount,
      newCount: newCount > 0 ? newCount : 0,
      dueCount,
      masteryRate: totalQuestions > 0 ? ((masteredCount / totalQuestions) * 100).toFixed(1) : '0.0'
    }
  });
};

/**
 * 获取题库进度
 * @route GET /api/stats/bank-progress
 */
const getBankProgress = async (req, res) => {
  const banks = await QuestionBank.find();
  const progress = [];

  for (const bank of banks) {
    const totalQuestions = await Question.countDocuments({ bankId: bank.id });
    const questionIds = await Question.find({ bankId: bank.id }).distinct('id');

    const answered = await UserAnswer.aggregate([
      { $match: { questionId: { $in: questionIds } } },
      { $group: { _id: '$questionId', latest: { $last: '$isCorrect' } } }
    ]);

    const correctCount = answered.filter(a => a.latest).length;
    const masteredCount = await ReviewCard.countDocuments({
      questionId: { $in: questionIds },
      repetitions: { $gte: 3 }
    });

    progress.push({
      bankId: bank.id,
      bankName: bank.name,
      totalQuestions,
      answeredCount: answered.length,
      correctCount,
      correctRate: answered.length > 0 ? ((correctCount / answered.length) * 100).toFixed(1) : '0.0',
      masteredCount,
      masteryRate: totalQuestions > 0 ? ((masteredCount / totalQuestions) * 100).toFixed(1) : '0.0'
    });
  }

  // 未分组题目
  const ungroupedTotal = await Question.countDocuments({ bankId: null });
  if (ungroupedTotal > 0) {
    const ungroupedIds = await Question.find({ bankId: null }).distinct('id');
    const ungroupedAnswered = await UserAnswer.aggregate([
      { $match: { questionId: { $in: ungroupedIds } } },
      { $group: { _id: '$questionId', latest: { $last: '$isCorrect' } } }
    ]);
    const ungroupedCorrect = ungroupedAnswered.filter(a => a.latest).length;
    const ungroupedMastered = await ReviewCard.countDocuments({
      questionId: { $in: ungroupedIds },
      repetitions: { $gte: 3 }
    });

    progress.push({
      bankId: null,
      bankName: '未分组',
      totalQuestions: ungroupedTotal,
      answeredCount: ungroupedAnswered.length,
      correctCount: ungroupedCorrect,
      correctRate: ungroupedAnswered.length > 0 ? ((ungroupedCorrect / ungroupedAnswered.length) * 100).toFixed(1) : '0.0',
      masteredCount: ungroupedMastered,
      masteryRate: ungroupedTotal > 0 ? ((ungroupedMastered / ungroupedTotal) * 100).toFixed(1) : '0.0'
    });
  }

  res.status(200).json({ status: 'success', data: progress });
};

module.exports = {
  getStats,
  getOverview,
  getCategoryStats,
  getWrongQuestions,
  getSessions,
  getTrends,
  startSession,
  endSession,
  resetStats,
  getAdvisorSuggestions,
  updateViewHistory,
  getBankProgress,
  getTagProgress,
  getMasteryOverview
};