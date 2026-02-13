package com.quizgen.app.question.dto;

import java.util.ArrayList;
import java.util.List;

public class QuestionImportResultResponse {

    private int parsedCount;
    private int insertedCount;
    private int duplicateCount;
    private List<QuestionResponse> data = new ArrayList<>();

    public int getParsedCount() { return parsedCount; }
    public void setParsedCount(int parsedCount) { this.parsedCount = parsedCount; }
    public int getInsertedCount() { return insertedCount; }
    public void setInsertedCount(int insertedCount) { this.insertedCount = insertedCount; }
    public int getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(int duplicateCount) { this.duplicateCount = duplicateCount; }
    public List<QuestionResponse> getData() { return data; }
    public void setData(List<QuestionResponse> data) { this.data = data; }
}
