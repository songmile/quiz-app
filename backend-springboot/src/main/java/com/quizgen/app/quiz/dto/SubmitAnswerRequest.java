package com.quizgen.app.quiz.dto;

import jakarta.validation.constraints.NotBlank;

public class SubmitAnswerRequest {

    @NotBlank
    private String questionId;

    @NotBlank
    private String userAnswer;

    private String mode;

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getUserAnswer() { return userAnswer; }
    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}