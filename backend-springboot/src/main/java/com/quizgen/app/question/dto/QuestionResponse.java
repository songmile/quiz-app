package com.quizgen.app.question.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class QuestionResponse {

    private String id;
    private String type;
    private String text;
    private String answer;
    private String bankId;
    private String explanation;
    private List<QuestionOptionDto> options = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public List<QuestionOptionDto> getOptions() { return options; }
    public void setOptions(List<QuestionOptionDto> options) { this.options = options; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}