package com.quizgen.app.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("ai_design_process")
public class AiDesignProcess {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("question_id")
    private Long questionId;

    @TableField("process_payload_json")
    private String processPayloadJson;

    @TableField("generated_at")
    private LocalDateTime generatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getProcessPayloadJson() { return processPayloadJson; }
    public void setProcessPayloadJson(String processPayloadJson) { this.processPayloadJson = processPayloadJson; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
