package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("statistics_snapshot")
public class StatisticsSnapshot {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("total_answered")
    private Integer totalAnswered;

    @TableField("total_correct")
    private Integer totalCorrect;

    @TableField("study_minutes")
    private Integer studyMinutes;

    @TableField("wrong_question_count")
    private Integer wrongQuestionCount;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getTotalAnswered() { return totalAnswered; }
    public void setTotalAnswered(Integer totalAnswered) { this.totalAnswered = totalAnswered; }
    public Integer getTotalCorrect() { return totalCorrect; }
    public void setTotalCorrect(Integer totalCorrect) { this.totalCorrect = totalCorrect; }
    public Integer getStudyMinutes() { return studyMinutes; }
    public void setStudyMinutes(Integer studyMinutes) { this.studyMinutes = studyMinutes; }
    public Integer getWrongQuestionCount() { return wrongQuestionCount; }
    public void setWrongQuestionCount(Integer wrongQuestionCount) { this.wrongQuestionCount = wrongQuestionCount; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}