const Note = require('../models/Note');

const getQuestionNotes = async (questionId) => {
  return await Note.find({ questionId }).sort({ createdAt: -1 });
};

const getNotes = async ({ page = 1, limit = 20, search = '' }) => {
  const filter = {};
  if (search) {
    filter.content = { $regex: search, $options: 'i' };
  }

  const total = await Note.countDocuments(filter);
  const notes = await Note.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { notes, total, page, totalPages: Math.ceil(total / limit) };
};

const createNote = async (questionId, content) => {
  return await Note.create({ questionId, content });
};

const updateNote = async (noteId, content) => {
  return await Note.findByIdAndUpdate(noteId, { content }, { new: true });
};

const deleteNote = async (noteId) => {
  return await Note.findByIdAndDelete(noteId);
};

module.exports = {
  getQuestionNotes,
  getNotes,
  createNote,
  updateNote,
  deleteNote
};
