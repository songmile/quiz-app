const ReviewCard = require('../models/ReviewCard');

/**
 * SM-2 算法核心计算
 */
const calculateSM2 = (card, quality) => {
  let { easeFactor, interval, repetitions } = card;

  if (quality >= 3) {
    // 答对
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // 答错
    repetitions = 0;
    interval = 1;
  }

  // 更新 easeFactor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReviewDate };
};

/**
 * 根据答题情况推导 quality 评分
 */
const deriveQuality = (isCorrect, sessionType) => {
  if (!isCorrect) return 1;
  if (sessionType === 'spaced_review') return 5;
  return 4;
};

/**
 * 处理一次复习，更新 ReviewCard
 */
const processReview = async (questionId, isCorrect, sessionType) => {
  let card = await ReviewCard.findOne({ questionId });

  if (!card) {
    card = await initializeCard(questionId);
  }

  const quality = deriveQuality(isCorrect, sessionType);
  const sm2Result = calculateSM2(card, quality);

  card.easeFactor = sm2Result.easeFactor;
  card.interval = sm2Result.interval;
  card.repetitions = sm2Result.repetitions;
  card.nextReviewDate = sm2Result.nextReviewDate;
  card.lastReviewDate = new Date();
  card.totalReviews += 1;
  if (isCorrect) card.totalCorrect += 1;

  await card.save();
  return card;
};

/**
 * 初始化一张复习卡片
 */
const initializeCard = async (questionId) => {
  return await ReviewCard.create({ questionId });
};

module.exports = {
  calculateSM2,
  deriveQuality,
  processReview,
  initializeCard
};
