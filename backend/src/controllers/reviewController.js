const ReviewCard = require('../models/ReviewCard');
const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');
const reviewService = require('../services/reviewService');
const quizService = require('../services/quizService');
const statsService = require('../services/statsService');

const getDueQuestions = async (req, res) => {
  const { bankId, tags, limit: queryLimit } = req.query;
  const limit = parseInt(queryLimit) || 50;

  const dueCards = await ReviewCard.find({
    nextReviewDate: { $lte: new Date() }
  }).sort({ nextReviewDate: 1 }).limit(limit);

  const questionIds = dueCards.map(c => c.questionId);

  const filter = { id: { $in: questionIds } };
  if (bankId) filter.bankId = bankId;
  if (tags) filter.tags = { $in: tags.split(',') };

  const questions = await Question.find(filter);

  res.status(200).json({
    status: 'success',
    count: questions.length,
    data: questions
  });
};

const getDueCount = async (req, res) => {
  const count = await ReviewCard.countDocuments({
    nextReviewDate: { $lte: new Date() }
  });

  res.status(200).json({
    status: 'success',
    data: { dueCount: count }
  });
};

const getReviewStats = async (req, res) => {
  const totalCards = await ReviewCard.countDocuments();
  const dueCount = await ReviewCard.countDocuments({
    nextReviewDate: { $lte: new Date() }
  });
  const masteredCount = await ReviewCard.countDocuments({
    repetitions: { $gte: 3 }
  });
  const learningCount = await ReviewCard.countDocuments({
    repetitions: { $gt: 0, $lt: 3 }
  });
  const newCount = await ReviewCard.countDocuments({
    repetitions: 0
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalCards,
      dueCount,
      masteredCount,
      learningCount,
      newCount
    }
  });
};

const startSpacedReview = async (req, res) => {
  const { bankId, tags } = req.body;

  const dueCards = await ReviewCard.find({
    nextReviewDate: { $lte: new Date() }
  }).sort({ nextReviewDate: 1 });

  if (dueCards.length === 0) {
    throw new AppError('暂无待复习题目', 400);
  }

  const questionIds = dueCards.map(c => c.questionId);
  const filter = { id: { $in: questionIds } };
  if (bankId) filter.bankId = bankId;
  if (tags) filter.tags = { $in: tags.split(',') };

  const questions = await Question.find(filter);

  if (questions.length === 0) {
    throw new AppError('当前筛选条件下暂无待复习题目', 400);
  }

  const shuffled = quizService.shuffleQuestions(questions);
  const session = await statsService.startStudySession('spaced_review');

  res.status(200).json({
    status: 'success',
    message: '开始间隔复习',
    totalQuestions: shuffled.length,
    currentIndex: 0,
    sessionId: session._id
  });
};

module.exports = {
  getDueQuestions,
  getDueCount,
  getReviewStats,
  startSpacedReview
};
