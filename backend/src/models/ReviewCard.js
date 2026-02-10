const mongoose = require('mongoose');

const ReviewCardSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  easeFactor: {
    type: Number,
    default: 2.5
  },
  interval: {
    type: Number,
    default: 0
  },
  repetitions: {
    type: Number,
    default: 0
  },
  nextReviewDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastReviewDate: {
    type: Date,
    default: null
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalCorrect: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('ReviewCard', ReviewCardSchema);
