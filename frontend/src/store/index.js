import { createStore } from 'vuex';
import questions from './modules/questions';
import quiz from './modules/quiz';
import ai from './modules/ai';
import stats from './modules/stats';
import settings from './modules/settings';
import banks from './modules/banks';
import notes from './modules/notes';
import review from './modules/review';
import bookmarks from './modules/bookmarks';
import flashcards from './modules/flashcards';
import streak from './modules/streak';
import drill from './modules/drill';

export default createStore({
  modules: {
    questions,
    quiz,
    ai,
    stats,
    settings,
    banks,
    notes,
    review,
    bookmarks,
    flashcards,
    streak,
    drill
  }
});