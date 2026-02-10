const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const statsController = require('../controllers/statsController');

// 获取所有统计数据
router.get('/', asyncHandler(statsController.getStats));

// 获取概览统计数据
router.get('/overview', asyncHandler(statsController.getOverview));

// 获取分类统计数据
router.get('/categories', asyncHandler(statsController.getCategoryStats));

// 获取错题统计
router.get('/wrong-questions', asyncHandler(statsController.getWrongQuestions));

// 获取会话记录
router.get('/sessions', asyncHandler(statsController.getSessions));

// 获取学习趋势数据
router.get('/trends', asyncHandler(statsController.getTrends));

// 开始新的学习会话
router.post('/sessions/start', asyncHandler(statsController.startSession));

// 结束学习会话
router.post('/sessions/end', asyncHandler(statsController.endSession));

// 重置统计数据
router.post('/reset', asyncHandler(statsController.resetStats));

// 获取智能顾问建议
router.get('/advisor', asyncHandler(statsController.getAdvisorSuggestions));

// 更新界面历史记录
router.post('/view-history', asyncHandler(statsController.updateViewHistory));


// 获取时间段统计数据
router.get('/timeline', asyncHandler(statsController.getTimelineStats));

// 获取题库进度
router.get('/bank-progress', asyncHandler(statsController.getBankProgress));

// 获取标签进度
router.get('/tag-progress', asyncHandler(statsController.getTagProgress));

// 获取掌握度概览
router.get('/mastery', asyncHandler(statsController.getMasteryOverview));

module.exports = router;