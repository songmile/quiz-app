const Question = require('../models/Question');
const UserAnswer = require('../models/UserAnswer');
const Statistics = require('../models/Statistics');
const Bookmark = require('../models/Bookmark');

// 内存会话存储：保存当前刷题/复习的题目ID顺序
const quizSessions = {
  normal: { questionIds: [], createdAt: null },
  review: { questionIds: [], createdAt: null },
  bookmark: { questionIds: [], createdAt: null },
  drill: { questionIds: [], createdAt: null }
};

/**
 * 随机打乱数组
 */
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const shuffleQuestions = (questions) => {
  return shuffleArray(questions);
};

/**
 * 初始化刷题会话，打乱题目并存储ID顺序
 */
const initQuizSession = async (mode = 'normal', options = {}) => {
  if (mode === 'bookmark') {
    const bookmarks = await Bookmark.find().select('questionId');
    const bookmarkIds = bookmarks.map(b => b.questionId);
    if (bookmarkIds.length === 0) {
      quizSessions.bookmark = { questionIds: [], createdAt: new Date() };
      return [];
    }
    const questions = await Question.find({ id: { $in: bookmarkIds } });
    const shuffled = shuffleArray(questions);
    quizSessions.bookmark = {
      questionIds: shuffled.map(q => q.id),
      createdAt: new Date()
    };
    return shuffled;
  }

  if (mode === 'review') {
    const stats = await Statistics.findOne();
    if (!stats || !stats.wrong_questions || stats.wrong_questions.length === 0) {
      quizSessions.review = { questionIds: [], createdAt: new Date() };
      return [];
    }
    const wrongQuestions = await Question.find({ id: { $in: stats.wrong_questions } });
    const shuffled = shuffleArray(wrongQuestions);
    quizSessions.review = {
      questionIds: shuffled.map(q => q.id),
      createdAt: new Date()
    };
    return shuffled;
  }

  // normal 模式
  const filter = {};
  if (options.bankId) filter.bankId = options.bankId;
  if (options.tags && options.tags.length > 0) {
    filter.tags = { $in: options.tags };
  }
  const questions = await Question.find(filter);
  const shuffled = shuffleArray(questions);
  quizSessions.normal = {
    questionIds: shuffled.map(q => q.id),
    createdAt: new Date()
  };
  return shuffled;
};

/**
 * 获取随机打乱的题目（兼容旧调用）
 */
const getShuffledQuestions = async (options = {}) => {
  return await initQuizSession('normal', options);
};

/**
 * 获取错题
 * @param {Array} wrongIds 错题ID数组
 * @returns {Array} 错题数组
 */
const getWrongQuestions = async (wrongIds) => {
  if (!wrongIds || wrongIds.length === 0) {
    return [];
  }
  
  const wrongQuestions = await Question.find({ id: { $in: wrongIds } });
  return wrongQuestions;
};

/**
 * 根据会话中存储的ID顺序获取题目列表
 */
const getSessionQuestions = async (mode = 'normal') => {
  const sessionKey = mode === 'review' ? 'review' : 'normal';
  const session = quizSessions[sessionKey];

  if (!session || session.questionIds.length === 0) {
    // 会话为空，尝试重新初始化
    const questions = await initQuizSession(mode);
    return questions;
  }

  // 按会话中存储的ID顺序查询题目
  const questions = await Question.find({ id: { $in: session.questionIds } });

  // 按存储的顺序排列
  const idOrder = new Map(session.questionIds.map((id, idx) => [id, idx]));
  questions.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

  return questions;
};

/**
 * 获取当前题目（使用会话顺序）
 */
const getCurrentQuestion = async (index, mode = 'normal') => {
  const questions = await getSessionQuestions(mode);

  if (questions.length === 0) {
    return { question: null, totalQuestions: 0 };
  }

  if (index < 0) index = 0;
  if (index >= questions.length) index = questions.length - 1;

  return {
    question: questions[index],
    totalQuestions: questions.length
  };
};

/**
 * 获取下一题（使用会话顺序）
 */
const getNextQuestion = async (currentIndex, mode = 'normal') => {
  const questions = await getSessionQuestions(mode);

  if (questions.length === 0) {
    return { question: null, totalQuestions: 0, newIndex: currentIndex };
  }

  const newIndex = currentIndex + 1;

  if (newIndex >= questions.length) {
    return { question: null, totalQuestions: questions.length, newIndex: currentIndex };
  }

  return {
    question: questions[newIndex],
    totalQuestions: questions.length,
    newIndex
  };
};

/**
 * 获取上一题（使用会话顺序）
 */
const getPreviousQuestion = async (currentIndex, mode = 'normal') => {
  const questions = await getSessionQuestions(mode);

  if (questions.length === 0) {
    return { question: null, totalQuestions: 0, newIndex: currentIndex };
  }

  const newIndex = currentIndex - 1;

  if (newIndex < 0) {
    return { question: null, totalQuestions: questions.length, newIndex: currentIndex };
  }

  return {
    question: questions[newIndex],
    totalQuestions: questions.length,
    newIndex
  };
};

/**
 * 获取题目导航数据
 * @param {String} filter 筛选条件 (all, unanswered, correct, wrong)
 * @param {String} type 题目类型 (all或具体类型)
 * @param {String} search 搜索关键词
 * @returns {Array} 题目导航数据
 */
const getQuestionNavigatorData = async (filter = 'all', type = 'all', search = '') => {
  // 构建基本查询条件
  const query = {};
  
  // 添加类型筛选
  if (type !== 'all') {
    query.type = type;
  }
  
  // 添加搜索条件
  if (search) {
    query.text = { $regex: search, $options: 'i' };
  }
  
  // 获取所有符合条件的题目
  const questions = await Question.find(query);
  
  // 如果没有题目，直接返回空数组
  if (questions.length === 0) {
    return [];
  }
  
  // 将题目ID映射到索引
  const questionIndexMap = {};
  questions.forEach((q, index) => {
    questionIndexMap[q.id] = index;
  });
  
  // 如果不是"全部"筛选，获取用户答案记录
  let filteredQuestions = [...questions];
  
  if (filter !== 'all') {
    // 获取所有题目的最新答案记录
    const answerRecords = await UserAnswer.aggregate([
      {
        $sort: { answeredAt: -1 } // 按回答时间倒序排列
      },
      {
        $group: {
          _id: '$questionId',
          isCorrect: { $first: '$isCorrect' }, // 只获取最新的一条记录
          answeredAt: { $first: '$answeredAt' }
        }
      }
    ]);
    
    // 创建答案记录映射
    const answerMap = {};
    answerRecords.forEach(record => {
      answerMap[record._id] = record;
    });
    
    // 应用筛选条件
    if (filter === 'unanswered') {
      // 只保留未回答的题目
      filteredQuestions = questions.filter(q => !answerMap[q.id]);
    } else if (filter === 'correct') {
      // 只保留回答正确的题目
      filteredQuestions = questions.filter(q => answerMap[q.id] && answerMap[q.id].isCorrect);
    } else if (filter === 'wrong') {
      // 只保留回答错误的题目
      filteredQuestions = questions.filter(q => answerMap[q.id] && !answerMap[q.id].isCorrect);
    }
  }
  
  // 格式化返回数据
  return filteredQuestions.map((q, index) => ({
    id: q.id,
    index: questionIndexMap[q.id], // 原始索引
    type: q.type,
    text: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : ''), // 截断长题目
    status: filter === 'all' ? 'all' : (
      filter === 'unanswered' ? 'unanswered' : (
        filter === 'correct' ? 'correct' : 'wrong'
      )
    )
  }));
};

/**
 * 获取用户在某道题的答题历史
 * @param {String} questionId 题目ID
 * @returns {Array} 答题历史记录
 */
const getUserAnswerHistory = async (questionId) => {
  return await UserAnswer.find({ questionId }).sort({ answeredAt: -1 });
};

module.exports = {
  shuffleQuestions,
  getShuffledQuestions,
  getWrongQuestions,
  initQuizSession,
  getCurrentQuestion,
  getNextQuestion,
  getPreviousQuestion,
  getQuestionNavigatorData,
  getUserAnswerHistory
};