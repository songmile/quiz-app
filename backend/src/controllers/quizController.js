const Question = require('../models/Question');
const UserAnswer = require('../models/UserAnswer');
const Statistics = require('../models/Statistics');
const { AppError } = require('../middleware/errorHandler');
const { checkAnswer } = require('../utils/helpers');
const quizService = require('../services/quizService');
const statsService = require('../services/statsService');
const reviewService = require('../services/reviewService');
const streakService = require('../services/streakService');

/**
 * 开始新的答题
 * @route POST /api/quiz/start
 */
const startQuiz = async (req, res) => {
  const { bankId, tags } = req.body;
  const filterOptions = {};
  if (bankId) filterOptions.bankId = bankId;
  if (tags) filterOptions.tags = Array.isArray(tags) ? tags : tags.split(',');

  // 初始化刷题会话（打乱并存储顺序）
  const shuffledQuestions = await quizService.initQuizSession('normal', filterOptions);

  if (shuffledQuestions.length === 0) {
    throw new AppError('题库为空，请先导入题目', 400);
  }

  // 创建或更新会话记录
  const session = await statsService.startStudySession();

  res.status(200).json({
    status: 'success',
    message: '开始答题',
    totalQuestions: shuffledQuestions.length,
    currentIndex: 0,
    sessionId: session._id
  });
};

/**
 * 开始错题复习
 * @route POST /api/quiz/review
 */
const startReview = async (req, res) => {
  // 初始化复习会话（自动查询错题、打乱并存储顺序）
  const shuffledWrongQuestions = await quizService.initQuizSession('review');

  if (shuffledWrongQuestions.length === 0) {
    throw new AppError('暂无错题记录，请先进行答题', 400);
  }

  // 创建或更新会话记录 (标记为复习模式)
  const session = await statsService.startStudySession('review');

  res.status(200).json({
    status: 'success',
    message: '开始错题复习',
    totalQuestions: shuffledWrongQuestions.length,
    currentIndex: 0,
    sessionId: session._id
  });
};

/**
 * 获取当前题目
 * @route GET /api/quiz/current
 */
const getCurrentQuestion = async (req, res) => {
  const { index = 0, mode = 'normal' } = req.query;
  
  // 获取当前题目
  const { question, totalQuestions } = await quizService.getCurrentQuestion(parseInt(index), mode);
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否有用户的答案记录
  const userAnswer = await UserAnswer.findOne({ questionId: question.id }).sort({ answeredAt: -1 });

  res.status(200).json({
    status: 'success',
    currentIndex: parseInt(index),
    totalQuestions,
    data: question,
    userAnswer: userAnswer ? {
      answer: userAnswer.userAnswer,
      isCorrect: userAnswer.isCorrect,
      answeredAt: userAnswer.answeredAt
    } : null
  });
};

/**
 * 提交答案
 * @route POST /api/quiz/submit
 */
const submitAnswer = async (req, res) => {
  const { questionId, userAnswer } = req.body;
  
  if (!questionId || !userAnswer) {
    throw new AppError('请提供题目ID和用户答案', 400);
  }

  // 获取题目
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查答案是否正确
  const isCorrect = checkAnswer(question, userAnswer);
  
  // 保存用户答案
  const sessionType = req.body.mode || 'normal';
  const answerRecord = await UserAnswer.create({
    questionId,
    userAnswer,
    isCorrect,
    sessionType
  });

  // 更新统计数据
  await statsService.updateStatsAfterAnswer(questionId, isCorrect, question.type);

  // 如果用户回答错误，添加到错题集
  if (!isCorrect) {
    await statsService.addToWrongQuestions(questionId);
  } else {
    // 如果正确且在复习模式，从错题集中移除
    if (sessionType === 'review') {
      await statsService.removeFromWrongQuestions(questionId);
    }
  }

  // 更新SM-2复习卡片
  try {
    await reviewService.processReview(questionId, isCorrect, sessionType);
  } catch (err) {
    console.error('更新复习卡片失败:', err.message);
  }

  // 更新学习打卡
  try {
    await streakService.recordActivity(isCorrect);
  } catch (err) {
    console.error('更新打卡数据失败:', err.message);
  }

  res.status(200).json({
    status: 'success',
    data: {
      questionId,
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
      userAnswer
    }
  });
};

/**
 * 获取下一题
 * @route GET /api/quiz/next
 */
const nextQuestion = async (req, res) => {
  const { currentIndex, mode = 'normal' } = req.query;
  
  if (!currentIndex) {
    throw new AppError('请提供当前题目索引', 400);
  }

  const index = parseInt(currentIndex);
  
  // 获取下一题
  const { question, totalQuestions, newIndex } = await quizService.getNextQuestion(index, mode);
  
  if (!question) {
    return res.status(200).json({
      status: 'success',
      message: '已经是最后一题',
      currentIndex: index,
      totalQuestions,
      isLast: true
    });
  }

  res.status(200).json({
    status: 'success',
    currentIndex: newIndex,
    totalQuestions,
    data: question
  });
};

/**
 * 获取上一题
 * @route GET /api/quiz/previous
 */
const previousQuestion = async (req, res) => {
  const { currentIndex, mode = 'normal' } = req.query;
  
  if (!currentIndex) {
    throw new AppError('请提供当前题目索引', 400);
  }

  const index = parseInt(currentIndex);
  
  // 获取上一题
  const { question, totalQuestions, newIndex } = await quizService.getPreviousQuestion(index, mode);
  
  if (!question) {
    return res.status(200).json({
      status: 'success',
      message: '已经是第一题',
      currentIndex: index,
      totalQuestions,
      isFirst: true
    });
  }

  res.status(200).json({
    status: 'success',
    currentIndex: newIndex,
    totalQuestions,
    data: question
  });
};

/**
 * 获取所有用户答案记录
 * @route GET /api/quiz/answers
 */
const getUserAnswers = async (req, res) => {
  // 支持分页
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  // 支持筛选
  const filter = {};
  if (req.query.isCorrect) {
    filter.isCorrect = req.query.isCorrect === 'true';
  }
  if (req.query.sessionType) {
    filter.sessionType = req.query.sessionType;
  }

  // 查询总数
  const total = await UserAnswer.countDocuments(filter);

  // 查询答案记录
  const answers = await UserAnswer.find(filter)
    .sort({ answeredAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    count: answers.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: answers
  });
};

/**
 * 获取题目的用户答案记录
 * @route GET /api/quiz/answers/:questionId
 */
const getQuestionAnswers = async (req, res) => {
  const { questionId } = req.params;

  // 查询题目是否存在
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 查询答案记录
  const answers = await UserAnswer.find({ questionId })
    .sort({ answeredAt: -1 });

  res.status(200).json({
    status: 'success',
    count: answers.length,
    data: answers
  });
};

/**
 * 重置答题进度
 * @route POST /api/quiz/reset
 */
const resetQuiz = async (req, res) => {
  // 结束当前学习会话
  await statsService.endStudySession();

  res.status(200).json({
    status: 'success',
    message: '答题进度已重置'
  });
};

/**
 * 获取题目导航数据
 * @route GET /api/quiz/navigator
 */
const getQuestionNavigator = async (req, res) => {
  // 支持筛选
  const { filter = 'all', type = 'all', search = '' } = req.query;

  // 获取题目导航数据
  const data = await quizService.getQuestionNavigatorData(filter, type, search);

  res.status(200).json({
    status: 'success',
    count: data.length,
    data
  });
};

/**
 * 跳转到指定题目
 * @route POST /api/quiz/jump/:index
 */
const jumpToQuestion = async (req, res) => {
  const { index } = req.params;
  const { mode = 'normal' } = req.body;
  
  // 获取当前题目
  const { question, totalQuestions } = await quizService.getCurrentQuestion(parseInt(index), mode);
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否有用户的答案记录
  const userAnswer = await UserAnswer.findOne({ questionId: question.id }).sort({ answeredAt: -1 });

  // 更新界面历史记录
  await statsService.updateViewHistory(mode === 'review' ? 'review' : 'quiz', parseInt(index));

  res.status(200).json({
    status: 'success',
    currentIndex: parseInt(index),
    totalQuestions,
    data: question,
    userAnswer: userAnswer ? {
      answer: userAnswer.userAnswer,
      isCorrect: userAnswer.isCorrect,
      answeredAt: userAnswer.answeredAt
    } : null
  });
};

module.exports = {
  startQuiz,
  startReview,
  getCurrentQuestion,
  submitAnswer,
  nextQuestion,
  previousQuestion,
  getUserAnswers,
  getQuestionAnswers,
  resetQuiz,
  getQuestionNavigator,
  jumpToQuestion
};