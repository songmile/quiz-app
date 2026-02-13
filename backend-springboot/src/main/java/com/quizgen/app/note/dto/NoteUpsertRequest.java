package com.quizgen.app.note.dto;

import jakarta.validation.constraints.NotBlank;

public class NoteUpsertRequest {

    private String questionId;

    @NotBlank
    private String content;

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}