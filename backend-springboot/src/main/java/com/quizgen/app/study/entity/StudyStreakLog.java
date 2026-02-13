package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDate;

@TableName("study_streak_log")
public class StudyStreakLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("streak_id")
    private Long streakId;

    @TableField("stat_date")
    private LocalDate statDate;

    @TableField("questions_answered")
    private Integer questionsAnswered;

    @TableField("correct_answers")
    private Integer correctAnswers;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStreakId() { return streakId; }
    public void setStreakId(Long streakId) { this.streakId = streakId; }
    public LocalDate getStatDate() { return statDate; }
    public void setStatDate(LocalDate statDate) { this.statDate = statDate; }
    public Integer getQuestionsAnswered() { return questionsAnswered; }
    public void setQuestionsAnswered(Integer questionsAnswered) { this.questionsAnswered = questionsAnswered; }
    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }
}