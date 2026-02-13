package com.quizgen.app.question.dto;

public class QuestionCleanResultResponse {

    private long originalCount;
    private long currentCount;
    private long removedCount;

    public long getOriginalCount() { return originalCount; }
    public void setOriginalCount(long originalCount) { this.originalCount = originalCount; }
    public long getCurrentCount() { return currentCount; }
    public void setCurrentCount(long currentCount) { this.currentCount = currentCount; }
    public long getRemovedCount() { return removedCount; }
    public void setRemovedCount(long removedCount) { this.removedCount = removedCount; }
}
