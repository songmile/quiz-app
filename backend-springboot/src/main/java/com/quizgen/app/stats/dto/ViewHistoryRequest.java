package com.quizgen.app.stats.dto;

public class ViewHistoryRequest {

    private String view;
    private Integer currentIndex;

    public String getView() { return view; }
    public void setView(String view) { this.view = view; }
    public Integer getCurrentIndex() { return currentIndex; }
    public void setCurrentIndex(Integer currentIndex) { this.currentIndex = currentIndex; }
}