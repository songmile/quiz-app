package com.quizgen.app.question.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

public class QuestionImportTextRequest {

    @NotBlank
    private String content;

    private String mode = "add";

    private String bankId;

    private List<String> tags = new ArrayList<>();

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
