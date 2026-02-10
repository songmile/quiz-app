const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');

// GET /api/bookmarks - 获取所有收藏
router.get('/', async (req, res) => {
  const bookmarks = await Bookmark.find().sort({ createdAt: -1 });
  const questionIds = bookmarks.map(b => b.questionId);
  const questions = await Question.find({ id: { $in: questionIds } });

  const questionMap = {};
  questions.forEach(q => { questionMap[q.id] = q; });

  const result = bookmarks
    .map(b => ({
      questionId: b.questionId,
      createdAt: b.createdAt,
      question: questionMap[b.questionId] || null
    }))
    .filter(b => b.question !== null);

  res.json({ status: 'success', count: result.length, data: result });
});

// GET /api/bookmarks/ids - 获取所有收藏的题目ID
router.get('/ids', async (req, res) => {
  const bookmarks = await Bookmark.find().select('questionId');
  const ids = bookmarks.map(b => b.questionId);
  res.json({ status: 'success', data: ids });
});

// POST /api/bookmarks/:questionId - 添加收藏
router.post('/:questionId', async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findOne({ id: questionId });
  if (!question) {
    throw new AppError('题目不存在', 404);
  }

  const existing = await Bookmark.findOne({ questionId });
  if (existing) {
    return res.json({ status: 'success', message: '已收藏', data: existing });
  }

  const bookmark = await Bookmark.create({ questionId });
  res.status(201).json({ status: 'success', message: '收藏成功', data: bookmark });
});

// DELETE /api/bookmarks/:questionId - 取消收藏
router.delete('/:questionId', async (req, res) => {
  const { questionId } = req.params;
  await Bookmark.deleteOne({ questionId });
  res.json({ status: 'success', message: '已取消收藏' });
});

module.exports = router;
