const Statistics = require('../models/Statistics');
const Question = require('../models/Question');
const UserAnswer = require('../models/UserAnswer');
const { formatDateTime } = require('../utils/helpers');

/**
 * 开始学习会话
 * @param {String} mode 会话模式 (normal或review)
 * @returns {Object} 会话信息
 */
const startStudySession = async (mode = 'normal') => {
  // 查询统计数据
  let stats = await Statistics.findOne();
  
  // 如果不存在统计数据，创建一个新的
  if (!stats) {
    stats = await Statistics.create({
      total_answered: 0,
      correct: 0,
      sessions: [],
      study_time: 0,
      wrong_questions: []
    });
  }
  
  // 创建新会话
  const session = {
    start_time: formatDateTime(),
    questions_answered: 0,
    correct_answers: 0,
    mode
  };
  
  // 添加到会话列表
  stats.sessions.push(session);
  await stats.save();
  
  return session;
};

/**
 * 结束学习会话
 * @returns {Number} 会话持续时间（分钟）
 */
const endStudySession = async () => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats || stats.sessions.length === 0) {
    return 0;
  }
  
  // 获取最后一个会话
  const lastSession = stats.sessions[stats.sessions.length - 1];
  
  // 如果没有开始时间，返回0
  if (!lastSession.start_time) {
    return 0;
  }
  
  // 计算会话持续时间
  const startTime = new Date(lastSession.start_time);
  const endTime = new Date();
  const durationMinutes = (endTime - startTime) / (1000 * 60);
  
  // 更新学习时间统计
  stats.study_time += durationMinutes;
  await stats.save();
  
  return durationMinutes;
};

/**
 * 更新统计数据（回答题目后）
 * @param {String} questionId 题目ID
 * @param {Boolean} isCorrect 是否正确
 * @param {String} questionType 题目类型
 */
const updateStatsAfterAnswer = async (questionId, isCorrect, questionType) => {
  // 查询统计数据
  let stats = await Statistics.findOne();
  


  // 如果不存在统计数据，创建一个新的
  if (!stats) {
    stats = await Statistics.create({
      total_answered: 0,
      correct: 0,
      sessions: [],
      study_time: 0,
      wrong_questions: []
    });
  }
  
  // 更新总计数
  stats.total_answered += 1;
  if (isCorrect) {
    stats.correct += 1;
  }
  


    // 更新分类统计
    if (!stats.category_stats || !stats.category_stats.stats) {
      stats.category_stats = { stats: new Map() };
    }
    
    // 检查stats是否是一个Map对象
    if (!(stats.category_stats.stats instanceof Map)) {
      stats.category_stats.stats = new Map();
    }
      
    // 获取该类型的统计，如果不存在则创建
    let categoryStats = stats.category_stats.stats.get(questionType);
    if (!categoryStats) {
      categoryStats = { total: 0, correct: 0 };
      stats.category_stats.stats.set(questionType, categoryStats);
    }

  console.log('Updating stats for question type:', questionType);
  console.log('Category stats before update:', stats.category_stats);

  console.log('Category stats after update:', stats.category_stats);
  categoryStats.total += 1;
  if (isCorrect) {
    categoryStats.correct += 1;
  }
  stats.category_stats.stats.set(questionType, categoryStats);
  
  // 更新最后一个会话的统计
  if (stats.sessions.length > 0) {
    const lastSession = stats.sessions[stats.sessions.length - 1];
    lastSession.questions_answered += 1;
    if (isCorrect) {
      lastSession.correct_answers += 1;
    }
  }
  
  await stats.save();
};

/**
 * 添加题目到错题集
 * @param {String} questionId 题目ID
 */
const addToWrongQuestions = async (questionId) => {
  // 查询统计数据
  let stats = await Statistics.findOne();
  
  // 如果不存在统计数据，创建一个新的
  if (!stats) {
    stats = await Statistics.create({
      total_answered: 0,
      correct: 0,
      sessions: [],
      study_time: 0,
      wrong_questions: []
    });
  }
  
  // 如果题目不在错题集中，添加它
  if (!stats.wrong_questions.includes(questionId)) {
    stats.wrong_questions.push(questionId);
    await stats.save();
  }
};

/**
 * 从错题集中移除题目
 * @param {String} questionId 题目ID
 */
const removeFromWrongQuestions = async (questionId) => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    return;
  }
  
  // 从错题集中移除题目
  stats.wrong_questions = stats.wrong_questions.filter(id => id !== questionId);
  await stats.save();
};

/**
 * 计算学习趋势
 * @param {Array} sessions 会话记录
 * @returns {Object} 趋势数据
 */
const calculateLearningTrend = async (sessions) => {
  // 需要至少3个会话才能计算趋势
  if (!sessions || sessions.length < 3) {
    return {
      hasTrend: false,
      message: '会话数量不足，无法计算趋势'
    };
  }
  
  // 计算最近3个会话的平均正确率
  const recentSessions = sessions.slice(-3);
  const recentRates = recentSessions.map(session => {
    if (session.questions_answered > 0) {
      return (session.correct_answers / session.questions_answered) * 100;
    }
    return 0;
  });
  const recentAvg = recentRates.reduce((sum, rate) => sum + rate, 0) / recentRates.length;
  
  // 计算早期会话的平均正确率
  const earlierSessions = sessions.slice(0, -3);
  let earlierAvg = 0;
  if (earlierSessions.length > 0) {
    const earlierRates = earlierSessions.map(session => {
      if (session.questions_answered > 0) {
        return (session.correct_answers / session.questions_answered) * 100;
      }
      return 0;
    });
    earlierAvg = earlierRates.reduce((sum, rate) => sum + rate, 0) / earlierRates.length;
  }
  
  // 确定趋势方向
  let trendDirection;
  if (recentAvg > earlierAvg) {
    trendDirection = 'up';
  } else if (recentAvg < earlierAvg) {
    trendDirection = 'down';
  } else {
    trendDirection = 'stable';
  }
  
  // 计算变化百分比
  const changePercentage = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
  
  return {
    hasTrend: true,
    direction: trendDirection,
    recentAverage: recentAvg.toFixed(1),
    earlierAverage: earlierAvg.toFixed(1),
    changePercentage: changePercentage.toFixed(1),
    description: trendDirection === 'up' ? '正确率呈上升趋势' : 
                (trendDirection === 'down' ? '正确率呈下降趋势' : '正确率保持稳定')
  };
};

/**
 * 获取错误类型统计
 * @returns {Array} 错误类型统计数据
 */
const getErrorTypeStats = async () => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats || !stats.wrong_questions || stats.wrong_questions.length === 0) {
    return [];
  }
  
  // 获取错题
  const wrongQuestions = await Question.find({ 
    id: { $in: stats.wrong_questions } 
  });
  
  // 统计错题类型分布
  const wrongTypes = {};
  wrongQuestions.forEach(question => {
    const type = question.type;
    wrongTypes[type] = (wrongTypes[type] || 0) + 1;
  });
  
  // 按错题数量排序
  const sortedTypes = Object.entries(wrongTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
  
  // 计算各类型错题占比
  const totalWrong = stats.wrong_questions.length;
  sortedTypes.forEach(item => {
    item.percentage = ((item.count / totalWrong) * 100).toFixed(1);
  });
  
  return sortedTypes;
};

/**
 * 生成智能顾问建议
 * @returns {Object} 顾问建议数据
 */
const generateAdvisorSuggestions = async () => {
  // 查询统计数据
  const stats = await Statistics.findOne();
  
  if (!stats) {
    return {
      hasEnoughData: false,
      message: '没有足够的学习数据'
    };
  }
  
  // 如果答题数不足，无法提供建议
  if (stats.total_answered < 10) {
    return {
      hasEnoughData: false,
      message: '需要更多学习数据才能提供个性化建议。请至少完成10道题目后再来查看。'
    };
  }
  
  // 计算正确率
  const correctRate = stats.total_answered > 0 ? 
    (stats.correct / stats.total_answered) * 100 : 0;
  
  // 生成学习建议
  const advices = [];
  
  // 根据正确率给出建议
  if (correctRate < 60) {
    advices.push("您的正确率较低，建议先复习基础知识，然后重点关注错题。");
  } else if (correctRate < 80) {
    advices.push("您的正确率中等，建议专注于错题复习，并尝试变种题来巩固知识点。");
  } else {
    advices.push("您的正确率很高，建议尝试更难的题目来挑战自己，关注变种题和错误分析。");
  }
  
  // 根据学习时间给出建议
  const studyTime = stats.study_time || 0;
  if (studyTime < 60) { // 不到1小时
    advices.push("您的总学习时间较短，建议增加学习时间，每天保持稳定的学习节奏。");
  } else if (studyTime < 180) { // 不到3小时
    advices.push("您已经投入了一定的学习时间，建议使用番茄工作法，每25分钟休息5分钟，提高学习效率。");
  } else {
    advices.push("您已经投入了大量学习时间，建议注重知识点的系统化整理，建立知识体系。");
  }
  
  // 错题分析建议
  if (stats.wrong_questions.length > 0) {
    advices.push(
      `您有${stats.wrong_questions.length}道错题，建议定期进行错题复习，特别关注错误分析中的难点和易错点。`
    );
  }
  
  // 计算学习计划
  const totalQuestions = await Question.countDocuments();
  const remaining = totalQuestions - stats.total_answered;
  const dailyGoal = Math.min(20, Math.max(5, Math.floor(remaining / 7))) || 10;
  
  // 学习计划建议
  const plan = {
    dailyGoal,
    weeklyPlan: '5天新题学习 + 2天错题复习',
    focusAreas: '错误率高的题型和知识点'
  };
  
  // 如果错题较多，添加专项训练建议
  if (stats.wrong_questions.length > 10) {
    plan.specialTraining = '每天额外复习3-5道错题，并学习相关变种题';
  }
  
  return {
    hasEnoughData: true,
    analysis: {
      correctRate: correctRate.toFixed(1),
      totalAnswered: stats.total_answered,
      wrongQuestionCount: stats.wrong_questions.length,
      studyTimeHours: Math.floor(studyTime / 60),
      studyTimeMinutes: Math.floor(studyTime % 60)
    },
    advices,
    plan,
    errorTypes: await getErrorTypeStats()
  };
};

/**
 * 更新界面历史记录
 * @param {String} view 视图名称 (quiz或review)
 * @param {Number} currentIndex 当前题目索引
 */
const updateViewHistory = async (view, currentIndex) => {
  // 查询统计数据
  let stats = await Statistics.findOne();
  
  // 如果不存在统计数据，创建一个新的
  if (!stats) {
    stats = await Statistics.create({
      total_answered: 0,
      correct: 0,
      sessions: [],
      study_time: 0,
      wrong_questions: [],
      view_history: new Map()
    });
  }
  
  // 如果没有视图历史记录，创建一个新的
  if (!stats.view_history) {
    stats.view_history = new Map();
  }
  
  // 更新视图历史记录
  stats.view_history.set(view, {
    current_question_index: currentIndex,
    timestamp: new Date().toISOString()
  });
  
  await stats.save();
};

/**
 * 重置统计数据
 */
const resetStatistics = async () => {
  // 删除现有统计数据
  await Statistics.deleteMany({});
  
  // 创建新的统计数据
  await Statistics.create({
    total_answered: 0,
    correct: 0,
    sessions: [],
    study_time: 0,
    wrong_questions: []
  });
};

/**
 * 获取时间段统计数据
 * @param {String} period - 时间周期："daily", "weekly", "monthly", "yearly"
 * @param {Date} startDate - 开始日期（可选）
 * @param {Date} endDate - 结束日期（可选）
 * @param {String} category - 题目类型（可选）
 * @returns {Object} 时间段统计数据
 */
 
const getTimelineStats = async (period = 'daily', startDate = null, endDate = null, category = null) => {
  // 设置默认日期范围（如果未提供）
  const end = endDate ? new Date(endDate) : new Date();
  let start;
  
  if (startDate) {
    start = new Date(startDate);
  } else {
    // 根据时间周期设置默认的开始日期
    start = new Date(end);
    if (period === 'daily') {
      start.setDate(start.getDate() - 30); // 最近30天
    } else if (period === 'weekly') {
      start.setDate(start.getDate() - 90); // 最近12周
    } else if (period === 'monthly') {
      start.setMonth(start.getMonth() - 12); // 最近12个月
    } else {
      start.setFullYear(start.getFullYear() - 5); // 最近5年
    }
  }
  
  // 在日期范围内查询用户答题记录
  const query = {
    answeredAt: { $gte: start, $lte: end }
  };
  
  // 添加题目类型筛选（如果提供）
  if (category) {
    // 获取特定类型的题目
    const questions = await Question.find({ type: category });
    const questionIds = questions.map(q => q.id);
    
    // 按题目ID筛选答案
    query.questionId = { $in: questionIds };
  }
  
  // 获取日期范围内的所有答题记录
  const answers = await UserAnswer.find(query).sort({ answeredAt: 1 });
  
  // 获取所有答过的题目
  const questionIds = [...new Set(answers.map(a => a.questionId))];
  const questions = await Question.find({ id: { $in: questionIds } });
  
  // 创建题目ID到题目类型的映射
  const questionTypeMap = {};
  questions.forEach(q => {
    questionTypeMap[q.id] = q.type;
  });
  
  // 按时间周期分组答题记录
  const timelineData = {};
  const categoryCounts = {};
  
  answers.forEach(answer => {
    const date = new Date(answer.answeredAt);
    let timeKey;
    
    // 根据时间周期生成时间键
    if (period === 'daily') {
      timeKey = date.toISOString().substring(0, 10); // YYYY-MM-DD
    } else if (period === 'weekly') {
      // 获取周数和年份
      const weekNumber = getWeekNumber(date);
      timeKey = `${date.getFullYear()}-W${weekNumber}`;
    } else if (period === 'monthly') {
      timeKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } else { // yearly
      timeKey = date.getFullYear().toString();
    }
    
    // 如果时间段不存在则初始化
    if (!timelineData[timeKey]) {
      timelineData[timeKey] = {
        period: timeKey,
        total: 0,
        correct: 0,
        categories: {}
      };
    }
    
    // 增加总数和正确数
    timelineData[timeKey].total++;
    if (answer.isCorrect) {
      timelineData[timeKey].correct++;
    }
    
    // 获取题目类型
    const questionType = questionTypeMap[answer.questionId] || 'unknown';
    
    // 更新类别统计
    if (!timelineData[timeKey].categories[questionType]) {
      timelineData[timeKey].categories[questionType] = {
        total: 0,
        correct: 0
      };
    }
    
    timelineData[timeKey].categories[questionType].total++;
    if (answer.isCorrect) {
      timelineData[timeKey].categories[questionType].correct++;
    }
    
    // 更新总体类别统计
    if (!categoryCounts[questionType]) {
      categoryCounts[questionType] = {
        total: 0,
        correct: 0
      };
    }
    categoryCounts[questionType].total++;
    if (answer.isCorrect) {
      categoryCounts[questionType].correct++;
    }
  });
  
  // 转换为数组并按时间排序
  const timeline = Object.values(timelineData).sort((a, b) => a.period.localeCompare(b.period));
  
  // 计算筛选时间范围内的总数
  const totalAnswered = answers.length;
  const totalCorrect = answers.filter(a => a.isCorrect).length;
  
  return {
    timeline,
    summary: {
      period,
      startDate: start,
      endDate: end,
      totalAnswered,
      totalCorrect,
      correctRate: totalAnswered > 0 ? (totalCorrect / totalAnswered * 100).toFixed(1) : 0,
      categories: categoryCounts
    }
  };
};



/**
 * 获取日期的周数
 * @param {Date} date - 日期
 * @returns {Number} 周数 (1-53)
 */
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};


module.exports = {
  startStudySession,
  endStudySession,
  updateStatsAfterAnswer,
  addToWrongQuestions,
  removeFromWrongQuestions,
  calculateLearningTrend,
  getErrorTypeStats,
  generateAdvisorSuggestions,
  updateViewHistory,
  resetStatistics,
  getTimelineStats,  // 新添加的时间线统计函数
  getWeekNumber      // 新添加的辅助函数
};

