package com.quizgen.app.question.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateQuestionRequest {

    @NotBlank
    private String type;

    @NotBlank
    private String text;

    @NotBlank
    private String answer;

    private String explanation;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
