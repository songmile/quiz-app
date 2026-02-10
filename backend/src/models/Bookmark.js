const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Question'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BookmarkSchema.index({ questionId: 1 });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
