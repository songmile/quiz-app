const express = require('express');
const router = express.Router();
const streakService = require('../services/streakService');

// GET /api/streak - 获取打卡数据
router.get('/', async (req, res) => {
  const data = await streakService.getStreakData();
  res.json({ status: 'success', data });
});

// PATCH /api/streak/goal - 更新每日目标
router.patch('/goal', async (req, res) => {
  const { dailyGoal } = req.body;
  if (!dailyGoal || dailyGoal < 1) {
    return res.status(400).json({
      status: 'error',
      message: '每日目标至少为1'
    });
  }
  const streak = await streakService.updateDailyGoal(dailyGoal);
  res.json({
    status: 'success',
    data: { dailyGoal: streak.dailyGoal }
  });
});

module.exports = router;
