package com.quizgen.app.question.dto;

import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class QuestionImportRequest {

    @NotNull
    private List<QuestionUpsertRequest> questions = new ArrayList<>();

    private String mode = "add";

    private String bankId;

    private List<String> tags = new ArrayList<>();

    public List<QuestionUpsertRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionUpsertRequest> questions) { this.questions = questions; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
