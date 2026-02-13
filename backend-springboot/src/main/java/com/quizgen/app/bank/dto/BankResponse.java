package com.quizgen.app.bank.dto;

public class BankResponse {

    private String id;
    private String name;
    private String description;
    private Long questionCount;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getQuestionCount() { return questionCount; }
    public void setQuestionCount(Long questionCount) { this.questionCount = questionCount; }
}