package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("study_session")
public class StudySession {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String mode;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("ended_at")
    private LocalDateTime endedAt;

    @TableField("questions_answered")
    private Integer questionsAnswered;

    @TableField("correct_answers")
    private Integer correctAnswers;

    @TableField("created_at")
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
    public Integer getQuestionsAnswered() { return questionsAnswered; }
    public void setQuestionsAnswered(Integer questionsAnswered) { this.questionsAnswered = questionsAnswered; }
    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}