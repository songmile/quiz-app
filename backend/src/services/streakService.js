const StudyStreak = require('../models/StudyStreak');

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const getOrCreateStreak = async () => {
  let streak = await StudyStreak.findOne();
  if (!streak) {
    streak = await StudyStreak.create({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyGoal: 10,
      todayProgress: 0,
      activityLog: []
    });
  }
  return streak;
};

const recordActivity = async (isCorrect = false) => {
  const streak = await getOrCreateStreak();
  const today = getToday();
  const yesterday = getYesterday();

  // Check if day changed since last activity
  if (streak.lastActiveDate && streak.lastActiveDate !== today) {
    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    streak.todayProgress = 0;
  } else if (!streak.lastActiveDate) {
    streak.currentStreak = 1;
    streak.todayProgress = 0;
  }

  streak.lastActiveDate = today;
  streak.todayProgress += 1;

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  // Update activity log
  let todayLog = streak.activityLog.find(l => l.date === today);
  if (!todayLog) {
    streak.activityLog.push({
      date: today,
      questionsAnswered: 1,
      correctAnswers: isCorrect ? 1 : 0
    });
  } else {
    todayLog.questionsAnswered += 1;
    if (isCorrect) todayLog.correctAnswers += 1;
  }

  // Keep only last 90 days of activity log
  if (streak.activityLog.length > 90) {
    streak.activityLog = streak.activityLog.slice(-90);
  }

  await streak.save();
  return streak;
};

const getStreakData = async () => {
  const streak = await getOrCreateStreak();
  const today = getToday();
  const yesterday = getYesterday();

  // If last active was before yesterday, streak is broken
  let currentStreak = streak.currentStreak;
  if (streak.lastActiveDate && streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak: streak.longestStreak,
    dailyGoal: streak.dailyGoal,
    todayProgress: streak.lastActiveDate === today ? streak.todayProgress : 0,
    lastActiveDate: streak.lastActiveDate,
    activityLog: streak.activityLog.slice(-30)
  };
};

const updateDailyGoal = async (goal) => {
  const streak = await getOrCreateStreak();
  streak.dailyGoal = Math.max(1, Math.min(100, goal));
  await streak.save();
  return streak;
};

module.exports = { recordActivity, getStreakData, updateDailyGoal };
