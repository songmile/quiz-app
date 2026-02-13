package com.quizgen.app.bookmark.dto;

import com.quizgen.app.question.dto.QuestionResponse;

import java.time.LocalDateTime;

public class BookmarkItemResponse {

    private String questionId;
    private LocalDateTime createdAt;
    private QuestionResponse question;

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public QuestionResponse getQuestion() { return question; }
    public void setQuestion(QuestionResponse question) { this.question = question; }
}