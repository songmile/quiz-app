package com.quizgen.app.setting.service;

import com.quizgen.app.setting.dto.UpdateApiConfigRequest;

import java.util.List;
import java.util.Map;

public interface SettingsService {

    Map<String, Object> getSettings();

    Map<String, Object> updateSettings(Map<String, Object> request);

    Map<String, Object> updateApiConfig(int index, UpdateApiConfigRequest request);

    Map<String, Object> updateFontSettings(Map<String, Object> request);

    Map<String, Object> updateImportSettings(Map<String, Object> request);

    Map<String, Object> resetSettings();

    Map<String, Object> backupData();

    Map<String, Object> getBackupJobStatus(String jobNo);

    Map<String, Object> restoreData(String filename);

    Map<String, Object> updateDataPath(String path);

    List<Map<String, Object>> getBackupFiles();
}
