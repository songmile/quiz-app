package com.quizgen.app.question.dto;

public class QuestionPageRequest {

    private Integer page = 1;
    private Integer limit = 100;
    private String type;
    private String search;
    private String bankId;
    private String tags;

    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }
    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}