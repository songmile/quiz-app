package com.quizgen.app.streak.service;

import java.util.Map;

public interface StreakService {

    Map<String, Object> getStreakData();

    void updateDailyGoal(int goal);

    void recordActivity(boolean isCorrect);
}