const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const noteController = require('../controllers/noteController');

router.get('/', asyncHandler(noteController.getNotes));
router.get('/question/:questionId', asyncHandler(noteController.getQuestionNotes));
router.post('/', asyncHandler(noteController.createNote));
router.put('/:id', asyncHandler(noteController.updateNote));
router.delete('/:id', asyncHandler(noteController.deleteNote));

module.exports = router;
