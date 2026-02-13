package com.quizgen.app.setting.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.setting.dto.RestoreDataRequest;
import com.quizgen.app.setting.dto.UpdateApiConfigRequest;
import com.quizgen.app.setting.dto.UpdateDataPathRequest;
import com.quizgen.app.setting.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> getSettings() {
        return ApiResponse.ok(settingsService.getSettings());
    }

    @PutMapping
    public ApiResponse<Map<String, Object>> updateSettings(@RequestBody(required = false) Map<String, Object> request) {
        return ApiResponse.ok(settingsService.updateSettings(request));
    }

    @PutMapping("/api/{index}")
    public ApiResponse<Map<String, Object>> updateApiConfig(
            @PathVariable("index") Integer index,
            @RequestBody(required = false) UpdateApiConfigRequest request
    ) {
        return ApiResponse.ok(settingsService.updateApiConfig(index, request));
    }

    @PutMapping("/fonts")
    public ApiResponse<Map<String, Object>> updateFontSettings(@RequestBody(required = false) Map<String, Object> request) {
        return ApiResponse.ok(settingsService.updateFontSettings(request));
    }

    @PutMapping("/import")
    public ApiResponse<Map<String, Object>> updateImportSettings(@RequestBody(required = false) Map<String, Object> request) {
        return ApiResponse.ok(settingsService.updateImportSettings(request));
    }

    @PostMapping("/reset")
    public ApiResponse<Map<String, Object>> resetSettings() {
        return ApiResponse.ok(settingsService.resetSettings());
    }

    @PostMapping("/backup")
    public ApiResponse<Map<String, Object>> backupData() {
        return ApiResponse.ok(settingsService.backupData());
    }

    @GetMapping("/backup-jobs/{jobNo}")
    public ApiResponse<Map<String, Object>> getBackupJobStatus(@PathVariable("jobNo") String jobNo) {
        return ApiResponse.ok(settingsService.getBackupJobStatus(jobNo));
    }

    @PostMapping("/restore")
    public ApiResponse<Map<String, Object>> restoreData(@Valid @RequestBody RestoreDataRequest request) {
        return ApiResponse.ok(settingsService.restoreData(request.getFilename()));
    }

    @PutMapping("/data-path")
    public ApiResponse<Map<String, Object>> updateDataPath(@Valid @RequestBody UpdateDataPathRequest request) {
        return ApiResponse.ok(settingsService.updateDataPath(request.getPath()));
    }

    @GetMapping("/backup-files")
    public ApiResponse<List<Map<String, Object>>> getBackupFiles() {
        return ApiResponse.ok(settingsService.getBackupFiles());
    }
}
