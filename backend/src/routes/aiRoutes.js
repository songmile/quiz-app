const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const aiController = require('../controllers/aiController');

// 生成题目的AI解析
router.post('/explanation/:questionId', asyncHandler(aiController.generateExplanation));

// 获取题目的AI解析
router.get('/explanation/:questionId', asyncHandler(aiController.getExplanation));

// 生成错误分析
router.post('/error-analysis/:questionId', asyncHandler(aiController.generateErrorAnalysis));

// 获取错误分析
router.get('/error-analysis/:questionId', asyncHandler(aiController.getErrorAnalysis));

// 生成变种题
router.post('/variant/:questionId', asyncHandler(aiController.generateVariant));

// 获取变种题
router.get('/variant/:questionId', asyncHandler(aiController.getVariant));

// 添加变种题到题库
router.post('/variant/:questionId/add', asyncHandler(aiController.addVariantToQuestions));

// 生成知识树
router.post('/knowledge-tree/:questionId', asyncHandler(aiController.generateKnowledgeTree));

// 获取知识树
router.get('/knowledge-tree/:questionId', asyncHandler(aiController.getKnowledgeTree));

// 生成设计流程
router.post('/design-process/:questionId', asyncHandler(aiController.generateDesignProcess));

// 获取设计流程
router.get('/design-process/:questionId', asyncHandler(aiController.getDesignProcess));

// 测试API连接
router.post('/test-connection', asyncHandler(aiController.testApiConnection));

// 清除所有AI解析
router.delete('/explanations', asyncHandler(aiController.clearExplanations));

// 清除所有错误分析
router.delete('/error-analyses', asyncHandler(aiController.clearErrorAnalyses));

// 清除所有变种题
router.delete('/variants', asyncHandler(aiController.clearVariants));

module.exports = router;