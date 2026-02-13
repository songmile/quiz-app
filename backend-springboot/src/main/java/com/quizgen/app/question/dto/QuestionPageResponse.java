package com.quizgen.app.question.dto;

import java.util.List;

public class QuestionPageResponse {

    private long total;
    private long page;
    private long totalPages;
    private List<QuestionResponse> data;

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public long getPage() { return page; }
    public void setPage(long page) { this.page = page; }
    public long getTotalPages() { return totalPages; }
    public void setTotalPages(long totalPages) { this.totalPages = totalPages; }
    public List<QuestionResponse> getData() { return data; }
    public void setData(List<QuestionResponse> data) { this.data = data; }
}