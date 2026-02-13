package com.quizgen.app.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("ai_explanation")
public class AiExplanation {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("question_id")
    private Long questionId;

    private String content;

    @TableField("api_config_id")
    private Long apiConfigId;

    @TableField("generated_at")
    private LocalDateTime generatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getApiConfigId() { return apiConfigId; }
    public void setApiConfigId(Long apiConfigId) { this.apiConfigId = apiConfigId; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
