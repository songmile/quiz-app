const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const reviewController = require('../controllers/reviewController');

router.get('/due', asyncHandler(reviewController.getDueQuestions));
router.get('/due-count', asyncHandler(reviewController.getDueCount));
router.get('/stats', asyncHandler(reviewController.getReviewStats));
router.post('/start', asyncHandler(reviewController.startSpacedReview));

module.exports = router;
