package com.quizgen.app.flashcard.service;

import java.util.Map;

public interface FlashcardService {

    Map<String, Object> startSession(String source, String bankId, Integer limit);

    Map<String, Object> rateCard(String questionId, String rating);

    Map<String, Object> info();
}

