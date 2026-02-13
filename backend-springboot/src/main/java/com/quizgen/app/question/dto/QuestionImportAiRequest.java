package com.quizgen.app.question.dto;

import jakarta.validation.constraints.NotBlank;

public class QuestionImportAiRequest {

    @NotBlank
    private String content;

    private String mode = "add";

    private String bankId;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }
}
