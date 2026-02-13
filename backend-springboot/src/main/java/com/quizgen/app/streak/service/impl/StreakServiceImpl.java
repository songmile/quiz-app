package com.quizgen.app.streak.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.quizgen.app.streak.service.StreakService;
import com.quizgen.app.study.entity.StudyStreak;
import com.quizgen.app.study.entity.StudyStreakLog;
import com.quizgen.app.study.mapper.StudyStreakLogMapper;
import com.quizgen.app.study.mapper.StudyStreakMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StreakServiceImpl implements StreakService {

    private final StudyStreakMapper streakMapper;
    private final StudyStreakLogMapper logMapper;

    public StreakServiceImpl(StudyStreakMapper streakMapper, StudyStreakLogMapper logMapper) {
        this.streakMapper = streakMapper;
        this.logMapper = logMapper;
    }

    @Override
    public Map<String, Object> getStreakData() {
        StudyStreak streak = ensureStreak();
        List<StudyStreakLog> logs = logMapper.selectList(new LambdaQueryWrapper<StudyStreakLog>()
                .eq(StudyStreakLog::getStreakId, streak.getId())
                .orderByDesc(StudyStreakLog::getStatDate)
                .last("limit 60"));

        Map<String, Object> data = new HashMap<>();
        data.put("currentStreak", streak.getCurrentStreak());
        data.put("longestStreak", streak.getLongestStreak());
        data.put("dailyGoal", streak.getDailyGoal());
        data.put("todayProgress", streak.getTodayProgress());
        data.put("lastActiveDate", streak.getLastActiveDate());
        data.put("activityLog", logs.stream().map(log -> {
            Map<String, Object> row = new HashMap<>();
            row.put("date", log.getStatDate());
            row.put("questionsAnswered", log.getQuestionsAnswered());
            row.put("correctAnswers", log.getCorrectAnswers());
            return row;
        }).toList());
        return data;
    }

    @Override
    @Transactional
    public void updateDailyGoal(int goal) {
        if (goal < 1) {
            goal = 1;
        }
        StudyStreak streak = ensureStreak();
        streak.setDailyGoal(goal);
        streak.setUpdatedAt(LocalDateTime.now());
        streakMapper.updateById(streak);
    }

    @Override
    @Transactional
    public void recordActivity(boolean isCorrect) {
        StudyStreak streak = ensureStreak();
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        if (streak.getLastActiveDate() == null) {
            streak.setCurrentStreak(1);
            streak.setTodayProgress(1);
        } else if (streak.getLastActiveDate().isEqual(today)) {
            streak.setTodayProgress(streak.getTodayProgress() + 1);
        } else if (streak.getLastActiveDate().isEqual(yesterday)) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            streak.setTodayProgress(1);
        } else {
            streak.setCurrentStreak(1);
            streak.setTodayProgress(1);
        }

        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }
        streak.setLastActiveDate(today);
        streak.setUpdatedAt(LocalDateTime.now());
        streakMapper.updateById(streak);

        StudyStreakLog log = logMapper.selectOne(new LambdaQueryWrapper<StudyStreakLog>()
                .eq(StudyStreakLog::getStreakId, streak.getId())
                .eq(StudyStreakLog::getStatDate, today));
        if (log == null) {
            log = new StudyStreakLog();
            log.setStreakId(streak.getId());
            log.setStatDate(today);
            log.setQuestionsAnswered(1);
            log.setCorrectAnswers(isCorrect ? 1 : 0);
            logMapper.insert(log);
            return;
        }
        log.setQuestionsAnswered(log.getQuestionsAnswered() + 1);
        log.setCorrectAnswers(log.getCorrectAnswers() + (isCorrect ? 1 : 0));
        logMapper.updateById(log);
    }

    private StudyStreak ensureStreak() {
        StudyStreak streak = streakMapper.selectOne(new LambdaQueryWrapper<StudyStreak>().last("limit 1"));
        if (streak != null) {
            return streak;
        }
        StudyStreak init = new StudyStreak();
        init.setCurrentStreak(0);
        init.setLongestStreak(0);
        init.setDailyGoal(10);
        init.setTodayProgress(0);
        init.setUpdatedAt(LocalDateTime.now());
        streakMapper.insert(init);
        return init;
    }
}

