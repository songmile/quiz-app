const noteService = require('../services/noteService');
const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');

const getNotes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';

  const result = await noteService.getNotes({ page, limit, search });

  // 获取关联题目摘要
  const questionIds = [...new Set(result.notes.map(n => n.questionId))];
  const questions = await Question.find({ id: { $in: questionIds } });
  const questionMap = {};
  questions.forEach(q => { questionMap[q.id] = q; });

  const notesWithQuestion = result.notes.map(note => ({
    ...note.toObject(),
    question: questionMap[note.questionId] ? {
      id: questionMap[note.questionId].id,
      text: questionMap[note.questionId].text.substring(0, 100),
      type: questionMap[note.questionId].type
    } : null
  }));

  res.status(200).json({
    status: 'success',
    count: notesWithQuestion.length,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    data: notesWithQuestion
  });
};

const getQuestionNotes = async (req, res) => {
  const notes = await noteService.getQuestionNotes(req.params.questionId);
  res.status(200).json({ status: 'success', data: notes });
};

const createNote = async (req, res) => {
  if (!req.body.questionId || !req.body.content) {
    throw new AppError('请提供题目ID和笔记内容', 400);
  }
  const note = await noteService.createNote(req.body.questionId, req.body.content);
  res.status(201).json({ status: 'success', data: note });
};

const updateNote = async (req, res) => {
  if (!req.body.content) {
    throw new AppError('请提供笔记内容', 400);
  }
  const note = await noteService.updateNote(req.params.id, req.body.content);
  if (!note) throw new AppError('未找到该笔记', 404);
  res.status(200).json({ status: 'success', data: note });
};

const deleteNote = async (req, res) => {
  const note = await noteService.deleteNote(req.params.id);
  if (!note) throw new AppError('未找到该笔记', 404);
  res.status(200).json({ status: 'success', message: '笔记已删除' });
};

module.exports = { getNotes, getQuestionNotes, createNote, updateNote, deleteNote };
