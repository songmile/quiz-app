const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 }
});

const StudyStreakSchema = new mongoose.Schema({
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null },
  dailyGoal: { type: Number, default: 10 },
  todayProgress: { type: Number, default: 0 },
  activityLog: { type: [ActivityLogSchema], default: [] }
});

module.exports = mongoose.model('StudyStreak', StudyStreakSchema);
