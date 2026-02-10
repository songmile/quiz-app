const express = require('express');
const router = express.Router();

// 导入子路由
const questionRoutes = require('./questionRoutes');
const quizRoutes = require('./quizRoutes');
const statsRoutes = require('./statsRoutes');
const aiRoutes = require('./aiRoutes');
const settingsRoutes = require('./settingsRoutes');
const bankRoutes = require('./bankRoutes');
const noteRoutes = require('./noteRoutes');
const reviewRoutes = require('./reviewRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');
const flashcardRoutes = require('./flashcardRoutes');
const streakRoutes = require('./streakRoutes');
const drillRoutes = require('./drillRoutes');

// 挂载子路由
router.use('/questions', questionRoutes);
router.use('/quiz', quizRoutes);
router.use('/stats', statsRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);
router.use('/banks', bankRoutes);
router.use('/notes', noteRoutes);
router.use('/review', reviewRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/streak', streakRoutes);
router.use('/drill', drillRoutes);

// API信息路由
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Spring Boot Quiz API',
    version: '1.0.0',
    endpoints: [
      '/questions - 题目管理',
      '/quiz - 答题流程',
      '/stats - 统计数据',
      '/ai - AI功能',
      '/settings - 应用设置'
    ]
  });
});

module.exports = router;