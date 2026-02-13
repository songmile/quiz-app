package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDate;
import java.time.LocalDateTime;

@TableName("study_streak")
public class StudyStreak {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("current_streak")
    private Integer currentStreak;

    @TableField("longest_streak")
    private Integer longestStreak;

    @TableField("last_active_date")
    private LocalDate lastActiveDate;

    @TableField("daily_goal")
    private Integer dailyGoal;

    @TableField("today_progress")
    private Integer todayProgress;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    public LocalDate getLastActiveDate() { return lastActiveDate; }
    public void setLastActiveDate(LocalDate lastActiveDate) { this.lastActiveDate = lastActiveDate; }
    public Integer getDailyGoal() { return dailyGoal; }
    public void setDailyGoal(Integer dailyGoal) { this.dailyGoal = dailyGoal; }
    public Integer getTodayProgress() { return todayProgress; }
    public void setTodayProgress(Integer todayProgress) { this.todayProgress = todayProgress; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}