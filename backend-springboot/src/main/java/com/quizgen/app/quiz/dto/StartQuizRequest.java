package com.quizgen.app.quiz.dto;

import java.util.List;

public class StartQuizRequest {

    private String bankId;
    private List<String> tags;

    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}