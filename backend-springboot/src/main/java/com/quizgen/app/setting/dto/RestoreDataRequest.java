package com.quizgen.app.setting.dto;

import jakarta.validation.constraints.NotBlank;

public class RestoreDataRequest {

    @NotBlank
    private String filename;

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
}
