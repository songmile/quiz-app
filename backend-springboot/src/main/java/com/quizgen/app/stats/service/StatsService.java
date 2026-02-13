package com.quizgen.app.stats.service;

import com.quizgen.app.study.entity.StudySession;

import java.util.List;
import java.util.Map;

public interface StatsService {

    StudySession startStudySession(String mode);

    long endStudySession();

    void recordAnswer(Long questionId, boolean isCorrect);

    void addWrongQuestion(Long questionId);

    void removeWrongQuestion(Long questionId);

    List<Long> getWrongQuestionIds();

    void updateViewHistory(String view, int currentIndex);

    Map<String, Object> getStatsRaw();

    Map<String, Object> getOverview();

    Map<String, Object> getCategoryStats();

    Map<String, Object> getWrongQuestions();

    List<Map<String, Object>> getSessions();

    Map<String, Object> getTrends();

    Map<String, Object> getAdvisorSuggestions();

    Map<String, Object> getTimeline(String period, String startDate, String endDate, String category);

    List<Map<String, Object>> getBankProgress();

    List<Map<String, Object>> getTagProgress();

    Map<String, Object> getMasteryOverview();

    void resetStats();
}