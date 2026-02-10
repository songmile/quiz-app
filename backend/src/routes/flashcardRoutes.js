const express = require('express');
const router = express.Router();
const flashcardService = require('../services/flashcardService');
const reviewService = require('../services/reviewService');
const UserAnswer = require('../models/UserAnswer');

// POST /api/flashcards/start - 开始闪卡会话
router.post('/start', async (req, res) => {
  const { source, bankId, limit } = req.body;
  const result = await flashcardService.startFlashcardSession(
    source || 'all',
    { bankId, limit }
  );

  if (result.totalCards === 0) {
    return res.status(400).json({
      status: 'error',
      message: '没有可用的题目'
    });
  }

  res.json({ status: 'success', data: result });
});

// POST /api/flashcards/rate - 闪卡评分
router.post('/rate', async (req, res) => {
  const { questionId, rating } = req.body;

  if (!questionId || !rating) {
    return res.status(400).json({
      status: 'error',
      message: '请提供题目ID和评分'
    });
  }

  // rating: again=1, hard=2, good=4, easy=5
  const qualityMap = { again: 1, hard: 2, good: 4, easy: 5 };
  const quality = qualityMap[rating] || 4;
  const isCorrect = quality >= 3;

  // 记录答题
  await UserAnswer.create({
    questionId,
    userAnswer: `flashcard_${rating}`,
    isCorrect,
    sessionType: 'flashcard'
  });

  // 更新SM-2复习卡片
  try {
    await reviewService.processReview(questionId, isCorrect, 'flashcard');
  } catch (err) {
    console.error('更新复习卡片失败:', err.message);
  }

  res.json({ status: 'success', data: { questionId, rating, quality } });
});

// GET /api/flashcards/info - 获取当前会话信息
router.get('/info', async (req, res) => {
  const info = flashcardService.getSessionInfo();
  res.json({ status: 'success', data: info });
});

module.exports = router;
