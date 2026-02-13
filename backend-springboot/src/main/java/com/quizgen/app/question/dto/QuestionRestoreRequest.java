package com.quizgen.app.question.dto;

import jakarta.validation.constraints.NotBlank;

public class QuestionRestoreRequest {

    @NotBlank
    private String backupId;

    public String getBackupId() { return backupId; }
    public void setBackupId(String backupId) { this.backupId = backupId; }
}
