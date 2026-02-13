package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("user_answer")
public class UserAnswer {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("question_id")
    private Long questionId;

    @TableField("user_answer")
    private String userAnswer;

    @TableField("is_correct")
    private Boolean isCorrect;

    @TableField("session_type")
    private String sessionType;

    @TableField("answered_at")
    private LocalDateTime answeredAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getUserAnswer() { return userAnswer; }
    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean correct) { isCorrect = correct; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(LocalDateTime answeredAt) { this.answeredAt = answeredAt; }
}