const Question = require('../models/Question');
const UserAnswer = require('../models/UserAnswer');
const Statistics = require('../models/Statistics');

/**
 * 分析薄弱点，返回弱项数据
 */
const analyzeWeakness = async () => {
  // 1. 按questionId聚合每题正确率
  const questionStats = await UserAnswer.aggregate([
    {
      $group: {
        _id: '$questionId',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
      }
    }
  ]);

  const questionAccuracy = {};
  questionStats.forEach(q => {
    questionAccuracy[q._id] = q.total > 0 ? q.correct / q.total : 0;
  });

  // 2. 获取分类统计
  const stats = await Statistics.findOne();
  const categoryWeakness = {};

  if (stats && stats.category_stats && stats.category_stats.stats) {
    const catStats = stats.category_stats.stats;
    for (const [type, data] of catStats.entries()) {
      const rate = data.total > 0 ? data.correct / data.total : 0;
      categoryWeakness[type] = {
        total: data.total,
        correct: data.correct,
        rate: Math.round(rate * 100)
      };
    }
  }

  return { questionAccuracy, categoryWeakness };
};

/**
 * 智能选题算法
 * drillPriority = (1 - questionAccuracy) * typeWeaknessWeight * recencyWeight
 */
const selectDrillQuestions = async (count = 20) => {
  const { questionAccuracy, categoryWeakness } = await analyzeWeakness();
  const allQuestions = await Question.find();

  // 获取最近答题记录用于recency计算
  const recentAnswers = await UserAnswer.find()
    .sort({ answeredAt: -1 })
    .limit(500)
    .select('questionId answeredAt');

  const lastAnsweredMap = {};
  recentAnswers.forEach(a => {
    if (!lastAnsweredMap[a.questionId]) {
      lastAnsweredMap[a.questionId] = a.answeredAt;
    }
  });

  const now = Date.now();

  const scored = allQuestions.map(q => {
    // 题目正确率（未答过的题默认0.5）
    const accuracy = questionAccuracy[q.id] !== undefined ? questionAccuracy[q.id] : 0.5;

    // 类型弱项权重
    const catData = categoryWeakness[q.type];
    const typeWeight = catData ? (1 - catData.rate / 100) : 0.5;

    // 时间衰减权重（越久没答优先级越高）
    let recencyWeight = 1.0;
    if (lastAnsweredMap[q.id]) {
      const daysSince = (now - new Date(lastAnsweredMap[q.id]).getTime()) / (1000 * 60 * 60 * 24);
      recencyWeight = Math.min(1.0, daysSince / 30);
    }

    const priority = (1 - accuracy) * (0.5 + typeWeight * 0.5) * (0.3 + recencyWeight * 0.7);

    return { question: q, priority };
  });

  // 按优先级降序排列，取top N
  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, count);
};

/**
 * 启动智能组卷会话
 */
const startDrill = async (count = 20) => {
  const scored = await selectDrillQuestions(count);

  if (scored.length === 0) {
    return { totalQuestions: 0, questions: [], analysis: {} };
  }

  const { categoryWeakness } = await analyzeWeakness();

  const questions = scored.map(s => s.question);

  return {
    totalQuestions: questions.length,
    questions: questions.map(q => ({
      id: q.id,
      type: q.type,
      text: q.text,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation
    })),
    analysis: categoryWeakness
  };
};

module.exports = { analyzeWeakness, selectDrillQuestions, startDrill };
