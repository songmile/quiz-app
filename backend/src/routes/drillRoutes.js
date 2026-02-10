const express = require('express');
const router = express.Router();
const drillService = require('../services/drillService');

// POST /api/drill/start - 开始智能组卷
router.post('/start', async (req, res) => {
  const { count } = req.body;
  const result = await drillService.startDrill(count || 20);

  if (result.totalQuestions === 0) {
    return res.status(400).json({
      status: 'error',
      message: '没有足够的数据进行智能组卷，请先答一些题目'
    });
  }

  res.json({ status: 'success', data: result });
});

// GET /api/drill/analysis - 获取弱项分析
router.get('/analysis', async (req, res) => {
  const { categoryWeakness } = await drillService.analyzeWeakness();
  res.json({ status: 'success', data: categoryWeakness });
});

module.exports = router;
