package com.quizgen.app.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class ErrorAnalysisRequest {

    @NotBlank
    private String userAnswer;

    public String getUserAnswer() { return userAnswer; }
    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
}
