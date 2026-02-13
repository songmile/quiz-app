package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("review_card")
public class ReviewCard {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("question_id")
    private Long questionId;

    @TableField("ease_factor")
    private BigDecimal easeFactor;

    @TableField("interval_days")
    private Integer intervalDays;

    private Integer repetitions;

    @TableField("next_review_at")
    private LocalDateTime nextReviewAt;

    @TableField("last_review_at")
    private LocalDateTime lastReviewAt;

    @TableField("total_reviews")
    private Integer totalReviews;

    @TableField("total_correct")
    private Integer totalCorrect;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public BigDecimal getEaseFactor() { return easeFactor; }
    public void setEaseFactor(BigDecimal easeFactor) { this.easeFactor = easeFactor; }
    public Integer getIntervalDays() { return intervalDays; }
    public void setIntervalDays(Integer intervalDays) { this.intervalDays = intervalDays; }
    public Integer getRepetitions() { return repetitions; }
    public void setRepetitions(Integer repetitions) { this.repetitions = repetitions; }
    public LocalDateTime getNextReviewAt() { return nextReviewAt; }
    public void setNextReviewAt(LocalDateTime nextReviewAt) { this.nextReviewAt = nextReviewAt; }
    public LocalDateTime getLastReviewAt() { return lastReviewAt; }
    public void setLastReviewAt(LocalDateTime lastReviewAt) { this.lastReviewAt = lastReviewAt; }
    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
    public Integer getTotalCorrect() { return totalCorrect; }
    public void setTotalCorrect(Integer totalCorrect) { this.totalCorrect = totalCorrect; }
}