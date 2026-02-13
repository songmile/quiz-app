package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("wrong_question")
public class WrongQuestion {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("question_id")
    private Long questionId;

    @TableField("first_wrong_at")
    private LocalDateTime firstWrongAt;

    @TableField("last_wrong_at")
    private LocalDateTime lastWrongAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public LocalDateTime getFirstWrongAt() { return firstWrongAt; }
    public void setFirstWrongAt(LocalDateTime firstWrongAt) { this.firstWrongAt = firstWrongAt; }
    public LocalDateTime getLastWrongAt() { return lastWrongAt; }
    public void setLastWrongAt(LocalDateTime lastWrongAt) { this.lastWrongAt = lastWrongAt; }
}