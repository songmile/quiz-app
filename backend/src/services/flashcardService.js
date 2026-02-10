const Question = require('../models/Question');
const Bookmark = require('../models/Bookmark');
const Statistics = require('../models/Statistics');

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

let flashcardSession = { questions: [], createdAt: null };

const startFlashcardSession = async (source = 'all', options = {}) => {
  let questions = [];

  if (source === 'bookmark') {
    const bookmarks = await Bookmark.find().select('questionId');
    const ids = bookmarks.map(b => b.questionId);
    if (ids.length > 0) {
      questions = await Question.find({ id: { $in: ids } });
    }
  } else if (source === 'wrong') {
    const stats = await Statistics.findOne();
    if (stats && stats.wrong_questions && stats.wrong_questions.length > 0) {
      questions = await Question.find({ id: { $in: stats.wrong_questions } });
    }
  } else if (source === 'bank' && options.bankId) {
    questions = await Question.find({ bankId: options.bankId });
  } else {
    questions = await Question.find();
  }

  const shuffled = shuffleArray(questions);
  const limit = options.limit ? Math.min(options.limit, shuffled.length) : shuffled.length;
  const selected = shuffled.slice(0, limit);

  flashcardSession = { questions: selected, createdAt: new Date() };

  return {
    totalCards: selected.length,
    cards: selected.map(q => ({
      id: q.id,
      type: q.type,
      text: q.text,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation
    }))
  };
};

const getSessionInfo = () => {
  return {
    totalCards: flashcardSession.questions.length,
    createdAt: flashcardSession.createdAt
  };
};

module.exports = { startFlashcardSession, getSessionInfo };
