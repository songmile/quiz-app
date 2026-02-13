package com.quizgen.app.review.service;

import java.util.List;
import java.util.Map;

public interface ReviewService {

    void processReview(Long questionId, boolean isCorrect, String sessionType);

    List<Map<String, Object>> getDueQuestions(String bankId, String tags, Integer limit);

    long getDueCount();

    Map<String, Object> getReviewStats();
}