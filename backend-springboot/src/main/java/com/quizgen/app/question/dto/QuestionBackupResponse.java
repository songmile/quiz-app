package com.quizgen.app.question.dto;

public class QuestionBackupResponse {

    private String backupId;
    private String filename;
    private String timestamp;
    private int questionCount;

    public String getBackupId() { return backupId; }
    public void setBackupId(String backupId) { this.backupId = backupId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
}
