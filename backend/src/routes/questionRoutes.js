const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const questionController = require('../controllers/questionController');

// 获取所有标签
router.get('/tags/all', asyncHandler(questionController.getAllTags));

// 获取所有题目
router.get('/', asyncHandler(questionController.getQuestions));

// 获取单个题目
router.get('/:id', asyncHandler(questionController.getQuestion));

// 创建题目
router.post('/', asyncHandler(questionController.createQuestion));

// 批量导入题目
router.post('/import', asyncHandler(questionController.importQuestions));

// 使用本地解析器导入文本格式题目
router.post('/import/text', asyncHandler(questionController.importTextQuestions));

// 使用AI智能导入题目
router.post('/import/ai', asyncHandler(questionController.importQuestionsWithAI));

// 获取导入任务状态
router.get('/import/status/:importId', asyncHandler(questionController.getImportStatus));

// 更新题目
router.put('/:id', asyncHandler(questionController.updateQuestion));

// 删除题目
router.delete('/:id', asyncHandler(questionController.deleteQuestion));

// 清理重复题目
router.post('/clean-duplicates', asyncHandler(questionController.cleanDuplicates));

// 创建题目备份
router.post('/backup', asyncHandler(questionController.createBackup));

// 还原题目备份
router.post('/restore', asyncHandler(questionController.restoreBackup));

module.exports = router;