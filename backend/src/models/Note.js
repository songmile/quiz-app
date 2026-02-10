const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

NoteSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Note', NoteSchema);
