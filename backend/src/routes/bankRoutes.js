const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const bankController = require('../controllers/bankController');

router.get('/', asyncHandler(bankController.getBanks));
router.post('/', asyncHandler(bankController.createBank));
router.put('/:id', asyncHandler(bankController.updateBank));
router.delete('/:id', asyncHandler(bankController.deleteBank));
router.get('/:id/questions', asyncHandler(bankController.getBankQuestions));

module.exports = router;
