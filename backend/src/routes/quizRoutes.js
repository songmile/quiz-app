const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const quizController = require('../controllers/quizController');

// 开始新的答题
router.post('/start', asyncHandler(quizController.startQuiz));

// 开始错题复习
router.post('/review', asyncHandler(quizController.startReview));

// 获取当前题目
router.get('/current', asyncHandler(quizController.getCurrentQuestion));

// 提交答案
router.post('/submit', asyncHandler(quizController.submitAnswer));

// 获取下一题
router.get('/next', asyncHandler(quizController.nextQuestion));

// 获取上一题
router.get('/previous', asyncHandler(quizController.previousQuestion));

// 获取所有用户答案记录
router.get('/answers', asyncHandler(quizController.getUserAnswers));

// 获取题目的用户答案记录
router.get('/answers/:questionId', asyncHandler(quizController.getQuestionAnswers));

// 重置答题进度
router.post('/reset', asyncHandler(quizController.resetQuiz));

// 获取题目导航数据（所有题目的简要信息和状态）
router.get('/navigator', asyncHandler(quizController.getQuestionNavigator));

// 跳转到指定题目
router.post('/jump/:index', asyncHandler(quizController.jumpToQuestion));

module.exports = router;