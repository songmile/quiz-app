package com.quizgen.app.setting.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.setting.config.BackupJobProperties;
import com.quizgen.app.setting.dto.UpdateApiConfigRequest;
import com.quizgen.app.setting.entity.ApiConfig;
import com.quizgen.app.setting.entity.AppSetting;
import com.quizgen.app.setting.entity.BackupJob;
import com.quizgen.app.setting.mapper.ApiConfigMapper;
import com.quizgen.app.setting.mapper.AppSettingMapper;
import com.quizgen.app.setting.mapper.BackupJobMapper;
import com.quizgen.app.setting.service.SettingsService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SettingsServiceImpl implements SettingsService {

    private static final DateTimeFormatter BACKUP_FILE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH-mm-ss");
    private static final String BACKUP_KIND_FULL = "full_backup";
    private static final String BACKUP_STATUS_PROCESSING = "processing";
    private static final String BACKUP_STATUS_COMPLETED = "completed";
    private static final String BACKUP_STATUS_FAILED = "failed";

    private static final String KEY_IMPORT_MAX_CONCURRENT = "import_max_concurrent";
    private static final String KEY_IMPORT_BATCH_DELAY = "import_batch_delay";
    private static final String KEY_EXPLANATION_API_INDEX = "explanation_api_index";
    private static final String KEY_AUTOSAVE_INTERVAL = "autosave_interval";
    private static final String KEY_KNOWLEDGE_TREE_API_INDEX = "knowledge_tree_api_index";
    private static final String KEY_DESIGN_PROCESS_API_INDEX = "design_process_api_index";
    private static final String KEY_FONT_SETTINGS = "font_settings";
    private static final String KEY_DATA_PATH = "data_path";

    private static final Set<String> GENERAL_UPDATABLE_KEYS = Set.of(
            KEY_IMPORT_MAX_CONCURRENT,
            KEY_IMPORT_BATCH_DELAY,
            KEY_EXPLANATION_API_INDEX,
            KEY_AUTOSAVE_INTERVAL,
            KEY_KNOWLEDGE_TREE_API_INDEX,
            KEY_DESIGN_PROCESS_API_INDEX,
            KEY_DATA_PATH
    );

    private static final Set<String> FONT_KEYS = Set.of(
            "question_font_size",
            "option_font_size",
            "answer_font_size",
            "explanation_font_size",
            "ai_font_size",
            "error_font_size",
            "variant_font_size"
    );

    private static final List<String> BACKUP_TABLES = List.of(
            "question_bank",
            "question",
            "question_option",
            "question_tag",
            "question_tag_rel",
            "user_answer",
            "review_card",
            "study_session",
            "statistics_snapshot",
            "wrong_question",
            "view_history",
            "note",
            "bookmark",
            "study_streak",
            "study_streak_log",
            "app_setting",
            "api_config",
            "ai_explanation",
            "ai_error_analysis",
            "ai_variant_question",
            "ai_knowledge_tree",
            "ai_design_process",
            "import_job",
            "import_job_item",
            "backup_job"
    );

    private final ApiConfigMapper apiConfigMapper;
    private final AppSettingMapper appSettingMapper;
    private final BackupJobMapper backupJobMapper;
    private final BackupJobProperties backupJobProperties;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public SettingsServiceImpl(
            ApiConfigMapper apiConfigMapper,
            AppSettingMapper appSettingMapper,
            BackupJobMapper backupJobMapper,
            BackupJobProperties backupJobProperties,
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper
    ) {
        this.apiConfigMapper = apiConfigMapper;
        this.appSettingMapper = appSettingMapper;
        this.backupJobMapper = backupJobMapper;
        this.backupJobProperties = backupJobProperties;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public Map<String, Object> getSettings() {
        ensureDefaults();

        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("api_configs", getSanitizedApiConfigs());
        settings.put(KEY_IMPORT_MAX_CONCURRENT, getSettingInt(KEY_IMPORT_MAX_CONCURRENT, 2));
        settings.put(KEY_IMPORT_BATCH_DELAY, getSettingInt(KEY_IMPORT_BATCH_DELAY, 2));
        settings.put(KEY_EXPLANATION_API_INDEX, getSettingInt(KEY_EXPLANATION_API_INDEX, 0));
        settings.put(KEY_AUTOSAVE_INTERVAL, getSettingInt(KEY_AUTOSAVE_INTERVAL, 5));
        settings.put(KEY_KNOWLEDGE_TREE_API_INDEX, getSettingInt(KEY_KNOWLEDGE_TREE_API_INDEX, 2));
        settings.put(KEY_DESIGN_PROCESS_API_INDEX, getSettingInt(KEY_DESIGN_PROCESS_API_INDEX, 3));
        settings.put(KEY_FONT_SETTINGS, getSettingMap(KEY_FONT_SETTINGS, defaultFontSettings()));
        settings.put(KEY_DATA_PATH, getSettingString(KEY_DATA_PATH, ""));
        return settings;
    }

    @Override
    public Map<String, Object> updateSettings(Map<String, Object> request) {
        ensureDefaults();
        if (request == null) {
            return getSettings();
        }

        for (Map.Entry<String, Object> entry : request.entrySet()) {
            String key = entry.getKey();
            if (!GENERAL_UPDATABLE_KEYS.contains(key)) {
                continue;
            }
            Object value = entry.getValue();
            if (value == null) {
                continue;
            }
            if (KEY_DATA_PATH.equals(key)) {
                if (!StringUtils.hasText(String.valueOf(value))) {
                    continue;
                }
                upsertSetting(key, String.valueOf(value).trim());
            } else {
                Integer intValue = toInteger(value);
                if (intValue != null) {
                    upsertSetting(key, intValue);
                }
            }
        }
        return getSettings();
    }

    @Override
    public Map<String, Object> updateApiConfig(int index, UpdateApiConfigRequest request) {
        ensureDefaults();
        List<ApiConfig> configs = loadApiConfigs();
        if (index < 0 || index >= configs.size()) {
            throw new BusinessException(40061, "invalid api config index");
        }

        ApiConfig config = configs.get(index);
        if (request != null) {
            if (request.getName() != null) {
                config.setName(request.getName());
            }
            if (request.getApi_url() != null) {
                config.setApiUrl(request.getApi_url());
            }
            if (request.getModel() != null) {
                config.setModel(request.getModel());
            }
            if (request.getChunk_size() != null) {
                config.setChunkSize(Math.max(1, request.getChunk_size()));
            }
            if (request.getMax_tokens() != null) {
                config.setMaxTokens(Math.max(1, request.getMax_tokens()));
            }
            if (request.getEnabled() != null) {
                config.setEnabled(request.getEnabled());
            }
            if (request.getApi_key() != null) {
                String apiKey = request.getApi_key().trim();
                if (!apiKey.contains("****")) {
                    config.setApiKeyCipher(apiKey);
                    config.setApiKeyMasked(maskApiKey(apiKey));
                }
            }
        }
        config.setUpdatedAt(LocalDateTime.now());
        apiConfigMapper.updateById(config);
        return sanitizeApiConfig(config);
    }

    @Override
    public Map<String, Object> updateFontSettings(Map<String, Object> request) {
        ensureDefaults();
        Map<String, Object> fontSettings = getSettingMap(KEY_FONT_SETTINGS, defaultFontSettings());
        if (request != null) {
            for (Map.Entry<String, Object> entry : request.entrySet()) {
                if (!FONT_KEYS.contains(entry.getKey())) {
                    continue;
                }
                Integer value = toInteger(entry.getValue());
                if (value != null) {
                    fontSettings.put(entry.getKey(), value);
                }
            }
        }
        upsertSetting(KEY_FONT_SETTINGS, fontSettings);
        return fontSettings;
    }

    @Override
    public Map<String, Object> updateImportSettings(Map<String, Object> request) {
        ensureDefaults();
        Integer maxConcurrent = request == null ? null : toInteger(request.get(KEY_IMPORT_MAX_CONCURRENT));
        Integer batchDelay = request == null ? null : toInteger(request.get(KEY_IMPORT_BATCH_DELAY));
        if (maxConcurrent != null) {
            upsertSetting(KEY_IMPORT_MAX_CONCURRENT, Math.max(1, maxConcurrent));
        }
        if (batchDelay != null) {
            upsertSetting(KEY_IMPORT_BATCH_DELAY, Math.max(1, batchDelay));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put(KEY_IMPORT_MAX_CONCURRENT, getSettingInt(KEY_IMPORT_MAX_CONCURRENT, 2));
        result.put(KEY_IMPORT_BATCH_DELAY, getSettingInt(KEY_IMPORT_BATCH_DELAY, 2));
        return result;
    }

    @Override
    public Map<String, Object> resetSettings() {
        appSettingMapper.delete(new QueryWrapper<>());
        apiConfigMapper.delete(new QueryWrapper<>());
        ensureDefaults();
        return getSettings();
    }

    @Override
    public Map<String, Object> backupData() {
        ensureDefaults();
        cleanupBackupJobs();
        BackupJob job = createBackupJob(BACKUP_KIND_FULL);
        CompletableFuture.runAsync(() -> runBackupJob(job.getId()));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("jobNo", job.getJobNo());
        response.put("kind", job.getKind());
        response.put("status", job.getStatus());
        response.put("createdAt", job.getCreatedAt());
        return response;
    }

    @Override
    public Map<String, Object> getBackupJobStatus(String jobNo) {
        cleanupBackupJobs();
        if (!StringUtils.hasText(jobNo)) {
            throw new BusinessException(40064, "jobNo is required");
        }

        BackupJob job = backupJobMapper.selectOne(
                new LambdaQueryWrapper<BackupJob>().eq(BackupJob::getJobNo, jobNo.trim())
        );
        if (job == null) {
            throw new BusinessException(40464, "backup job not found");
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("jobNo", job.getJobNo());
        response.put("kind", job.getKind());
        response.put("status", job.getStatus());
        response.put("retryCount", valueOrZero(job.getRetryCount()));
        response.put("maxRetries", valueOrZero(job.getMaxRetries()));
        response.put("createdAt", job.getCreatedAt());
        response.put("startedAt", job.getStartedAt());
        response.put("endedAt", job.getEndedAt());
        if (StringUtils.hasText(job.getErrorMessage())) {
            response.put("error", job.getErrorMessage());
        }
        if (StringUtils.hasText(job.getFilename())) {
            response.put("filename", job.getFilename());
            response.put("backup", resolveBackupInfo(job.getFilename()));
        }
        return response;
    }

    @Override
    public Map<String, Object> restoreData(String filename) {
        if (!StringUtils.hasText(filename)) {
            throw new BusinessException(40062, "filename is required");
        }

        Path backupFile = resolveBackupDir().resolve(filename.trim());
        if (!Files.exists(backupFile) || !Files.isRegularFile(backupFile)) {
            throw new BusinessException(40462, "backup file not found");
        }

        BackupBuildResult rollback = createBackupFile("pre_restore_backup_");
        Map<String, List<Map<String, Object>>> tableData = readBackupTables(backupFile);

        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");
            for (String table : BACKUP_TABLES) {
                jdbcTemplate.update("DELETE FROM " + table);
            }
            for (String table : BACKUP_TABLES) {
                List<Map<String, Object>> rows = tableData.get(table);
                if (rows == null || rows.isEmpty()) {
                    continue;
                }
                insertRows(table, rows);
            }
        } finally {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=1");
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        for (String table : BACKUP_TABLES) {
            stats.put(table, tableData.getOrDefault(table, Collections.emptyList()).size());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("filename", filename);
        response.put("stats", stats);
        response.put("rollback", rollback.backupInfo);
        return response;
    }

    @Override
    public Map<String, Object> updateDataPath(String path) {
        if (!StringUtils.hasText(path)) {
            throw new BusinessException(40063, "path is required");
        }
        Path dataPath = Paths.get(path.trim());
        try {
            Files.createDirectories(dataPath);
            Files.createDirectories(dataPath.resolve("backups"));
        } catch (IOException e) {
            throw new BusinessException(50063, "create data path failed: " + e.getMessage());
        }
        upsertSetting(KEY_DATA_PATH, dataPath.toString());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("path", dataPath.toString());
        return result;
    }

    @Override
    public List<Map<String, Object>> getBackupFiles() {
        cleanupBackupJobs();
        Path backupDir = resolveBackupDir();
        try {
            Files.createDirectories(backupDir);
        } catch (IOException e) {
            throw new BusinessException(50064, "prepare backup dir failed: " + e.getMessage());
        }

        try (Stream<Path> stream = Files.list(backupDir)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".json"))
                    .sorted(Comparator.comparing(this::safeLastModified).reversed())
                    .map(this::toBackupFileInfo)
                    .toList();
        } catch (IOException e) {
            throw new BusinessException(50065, "read backup file list failed: " + e.getMessage());
        }
    }

    private BackupJob createBackupJob(String kind) {
        LocalDateTime now = LocalDateTime.now();
        BackupJob job = new BackupJob();
        job.setJobNo("backup_" + UUID.randomUUID().toString().replace("-", ""));
        job.setKind(kind);
        job.setFilename("");
        job.setStatus(BACKUP_STATUS_PROCESSING);
        job.setRetryCount(0);
        job.setMaxRetries(backupJobProperties.getMaxRetries());
        job.setErrorMessage(null);
        job.setStartedAt(now);
        job.setCreatedAt(now);
        backupJobMapper.insert(job);
        return job;
    }

    private void runBackupJob(Long jobId) {
        int maxRetries = backupJobProperties.getMaxRetries();
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                BackupBuildResult backup = createBackupFile("quiz_app_backup_");
                String filename = String.valueOf(backup.backupInfo.getOrDefault("filename", ""));
                markBackupJobCompleted(jobId, filename, attempt);
                cleanupBackupJobs();
                return;
            } catch (Exception ex) {
                if (attempt < maxRetries) {
                    markBackupJobRetrying(jobId, attempt + 1, safeError(ex.getMessage()));
                    sleepQuietly(backupJobProperties.getRetryBaseDelayMs() * (attempt + 1));
                } else {
                    markBackupJobFailed(jobId, attempt, safeError(ex.getMessage()));
                }
            }
        }
        cleanupBackupJobs();
    }

    private void markBackupJobRetrying(Long jobId, int retryCount, String errorMessage) {
        BackupJob job = backupJobMapper.selectById(jobId);
        if (job == null) {
            return;
        }
        job.setRetryCount(retryCount);
        job.setErrorMessage(errorMessage);
        backupJobMapper.updateById(job);
    }

    private void markBackupJobCompleted(Long jobId, String filename, int retryCount) {
        BackupJob job = backupJobMapper.selectById(jobId);
        if (job == null) {
            return;
        }
        job.setFilename(filename);
        job.setStatus(BACKUP_STATUS_COMPLETED);
        job.setRetryCount(retryCount);
        job.setErrorMessage(null);
        job.setEndedAt(LocalDateTime.now());
        backupJobMapper.updateById(job);
    }

    private void markBackupJobFailed(Long jobId, int retryCount, String errorMessage) {
        BackupJob job = backupJobMapper.selectById(jobId);
        if (job == null) {
            return;
        }
        job.setStatus(BACKUP_STATUS_FAILED);
        job.setRetryCount(retryCount);
        job.setErrorMessage(errorMessage);
        job.setEndedAt(LocalDateTime.now());
        backupJobMapper.updateById(job);
    }

    private void cleanupBackupJobs() {
        markStaleProcessingBackupJobsFailed();
        cleanupExpiredFinishedBackupJobs();
        cleanupOverflowBackupJobs();
    }

    private void markStaleProcessingBackupJobsFailed() {
        LocalDateTime staleAt = LocalDateTime.now().minus(backupJobProperties.getStaleProcessingMinutes(), ChronoUnit.MINUTES);
        List<BackupJob> staleJobs = backupJobMapper.selectList(
                new LambdaQueryWrapper<BackupJob>()
                        .eq(BackupJob::getStatus, BACKUP_STATUS_PROCESSING)
                        .lt(BackupJob::getStartedAt, staleAt)
        );
        for (BackupJob staleJob : staleJobs) {
            markBackupJobFailed(staleJob.getId(), valueOrZero(staleJob.getRetryCount()), "backup job timeout");
        }
    }

    private void cleanupExpiredFinishedBackupJobs() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(backupJobProperties.getRetentionHours());
        List<BackupJob> finishedJobs = backupJobMapper.selectList(
                new LambdaQueryWrapper<BackupJob>()
                        .in(BackupJob::getStatus, List.of(BACKUP_STATUS_COMPLETED, BACKUP_STATUS_FAILED))
        );
        List<Long> removeIds = finishedJobs.stream()
                .filter(job -> {
                    LocalDateTime time = job.getEndedAt() != null ? job.getEndedAt() : job.getCreatedAt();
                    return time != null && time.isBefore(cutoff);
                })
                .map(BackupJob::getId)
                .toList();
        if (!removeIds.isEmpty()) {
            backupJobMapper.delete(new LambdaQueryWrapper<BackupJob>().in(BackupJob::getId, removeIds));
        }
    }

    private void cleanupOverflowBackupJobs() {
        List<BackupJob> finishedJobs = backupJobMapper.selectList(
                new QueryWrapper<BackupJob>()
                        .in("status", List.of(BACKUP_STATUS_COMPLETED, BACKUP_STATUS_FAILED))
                        .orderByDesc("created_at")
                        .orderByDesc("id")
        );
        int keep = backupJobProperties.getMaxFinishedKeep();
        if (finishedJobs.size() <= keep) {
            return;
        }
        List<Long> removeIds = finishedJobs.subList(keep, finishedJobs.size()).stream().map(BackupJob::getId).toList();
        backupJobMapper.delete(new LambdaQueryWrapper<BackupJob>().in(BackupJob::getId, removeIds));
    }

    private Map<String, Object> resolveBackupInfo(String filename) {
        Path path = resolveBackupDir().resolve(filename);
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("filename", filename);
        info.put("path", path.toString());
        info.put("exists", Files.exists(path) && Files.isRegularFile(path));
        if (Files.exists(path) && Files.isRegularFile(path)) {
            info.put("file", toBackupFileInfo(path));
        }
        return info;
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    private String safeError(String message) {
        if (!StringUtils.hasText(message)) {
            return "unknown error";
        }
        return message.length() > 2000 ? message.substring(0, 2000) : message;
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }

    private void ensureDefaults() {
        ensureDefaultApiConfigs();
        ensureDefaultAppSettings();
    }

    private void ensureDefaultApiConfigs() {
        if (apiConfigMapper.selectCount(null) > 0) {
            return;
        }
        List<ApiConfig> defaults = new ArrayList<>();
        defaults.add(buildDefaultApiConfig("主要API"));
        defaults.add(buildDefaultApiConfig("备用API"));
        defaults.add(buildDefaultApiConfig("知识树API"));
        defaults.add(buildDefaultApiConfig("设计流程API"));
        for (ApiConfig config : defaults) {
            apiConfigMapper.insert(config);
        }
    }

    private ApiConfig buildDefaultApiConfig(String name) {
        ApiConfig config = new ApiConfig();
        config.setName(name);
        config.setApiUrl("https://api.siliconflow.cn/v1/chat/completions");
        config.setModel("Qwen/Qwen2.5-7B-Instruct");
        config.setApiKeyCipher("");
        config.setApiKeyMasked("");
        config.setChunkSize(1000);
        config.setMaxTokens(4096);
        config.setEnabled(true);
        config.setUpdatedAt(LocalDateTime.now());
        return config;
    }

    private void ensureDefaultAppSettings() {
        ensureDefaultSetting(KEY_IMPORT_MAX_CONCURRENT, 2);
        ensureDefaultSetting(KEY_IMPORT_BATCH_DELAY, 2);
        ensureDefaultSetting(KEY_EXPLANATION_API_INDEX, 0);
        ensureDefaultSetting(KEY_AUTOSAVE_INTERVAL, 5);
        ensureDefaultSetting(KEY_KNOWLEDGE_TREE_API_INDEX, 2);
        ensureDefaultSetting(KEY_DESIGN_PROCESS_API_INDEX, 3);
        ensureDefaultSetting(KEY_FONT_SETTINGS, defaultFontSettings());
        ensureDefaultSetting(KEY_DATA_PATH, "");
    }

    private Map<String, Object> defaultFontSettings() {
        Map<String, Object> font = new LinkedHashMap<>();
        font.put("question_font_size", 12);
        font.put("option_font_size", 11);
        font.put("answer_font_size", 11);
        font.put("explanation_font_size", 11);
        font.put("ai_font_size", 11);
        font.put("error_font_size", 11);
        font.put("variant_font_size", 11);
        return font;
    }

    private void ensureDefaultSetting(String key, Object value) {
        AppSetting exists = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (exists != null) {
            return;
        }
        upsertSetting(key, value);
    }

    private void upsertSetting(String key, Object value) {
        AppSetting setting = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (setting == null) {
            setting = new AppSetting();
            setting.setSettingKey(key);
        }
        setting.setSettingValueJson(writeJson(value));
        setting.setUpdatedAt(LocalDateTime.now());
        if (setting.getId() == null) {
            appSettingMapper.insert(setting);
        } else {
            appSettingMapper.updateById(setting);
        }
    }

    private List<ApiConfig> loadApiConfigs() {
        return apiConfigMapper.selectList(new QueryWrapper<ApiConfig>().orderByAsc("id"));
    }

    private List<Map<String, Object>> getSanitizedApiConfigs() {
        return loadApiConfigs().stream().map(this::sanitizeApiConfig).toList();
    }

    private Map<String, Object> sanitizeApiConfig(ApiConfig config) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", config.getName());
        item.put("api_key", maskApiKey(config.getApiKeyCipher()));
        item.put("api_url", config.getApiUrl());
        item.put("model", config.getModel());
        item.put("chunk_size", config.getChunkSize());
        item.put("max_tokens", config.getMaxTokens());
        item.put("enabled", config.getEnabled());
        return item;
    }

    private String maskApiKey(String apiKey) {
        if (!StringUtils.hasText(apiKey)) {
            return "";
        }
        String key = apiKey.trim();
        int len = key.length();
        if (len <= 2) {
            return key.charAt(0) + "****";
        }
        if (len <= 8) {
            return key.substring(0, 1) + "****" + key.substring(len - 1);
        }
        return key.substring(0, 4) + "****" + key.substring(len - 4);
    }

    private Integer getSettingInt(String key, Integer defaultValue) {
        AppSetting setting = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (setting == null || !StringUtils.hasText(setting.getSettingValueJson())) {
            return defaultValue;
        }
        try {
            JsonNode node = objectMapper.readTree(setting.getSettingValueJson());
            if (node.isInt() || node.isLong() || node.isNumber()) {
                return node.asInt();
            }
            if (node.isTextual()) {
                return Integer.parseInt(node.asText());
            }
            if (node.isObject() && node.get("value") != null && node.get("value").isNumber()) {
                return node.get("value").asInt();
            }
        } catch (Exception ignored) {
        }
        return defaultValue;
    }

    private String getSettingString(String key, String defaultValue) {
        AppSetting setting = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (setting == null || !StringUtils.hasText(setting.getSettingValueJson())) {
            return defaultValue;
        }
        try {
            JsonNode node = objectMapper.readTree(setting.getSettingValueJson());
            if (node.isTextual()) {
                return node.asText();
            }
            if (node.isNull()) {
                return defaultValue;
            }
            return node.toString();
        } catch (Exception ignored) {
            return defaultValue;
        }
    }

    private Map<String, Object> getSettingMap(String key, Map<String, Object> defaultValue) {
        AppSetting setting = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (setting == null || !StringUtils.hasText(setting.getSettingValueJson())) {
            return new LinkedHashMap<>(defaultValue);
        }
        try {
            Map<String, Object> parsed = objectMapper.readValue(setting.getSettingValueJson(), new TypeReference<>() {});
            if (parsed == null) {
                return new LinkedHashMap<>(defaultValue);
            }
            Map<String, Object> merged = new LinkedHashMap<>(defaultValue);
            merged.putAll(parsed);
            return merged;
        } catch (Exception ignored) {
            return new LinkedHashMap<>(defaultValue);
        }
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return null;
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BusinessException(50066, "serialize setting json failed: " + e.getMessage());
        }
    }

    private Path resolveDataDir() {
        String settingPath = getSettingString(KEY_DATA_PATH, "");
        if (StringUtils.hasText(settingPath)) {
            return Paths.get(settingPath.trim());
        }
        String envDataDir = System.getenv("DATA_DIR");
        if (StringUtils.hasText(envDataDir)) {
            return Paths.get(envDataDir.trim());
        }
        return Paths.get("data");
    }

    private Path resolveBackupDir() {
        return resolveDataDir().resolve("backups");
    }

    private BackupBuildResult createBackupFile(String prefix) {
        Path backupDir = resolveBackupDir();
        try {
            Files.createDirectories(backupDir);
        } catch (IOException e) {
            throw new BusinessException(50067, "create backup dir failed: " + e.getMessage());
        }

        LocalDateTime now = LocalDateTime.now();
        String filename = prefix + now.format(BACKUP_FILE_TIME) + ".json";
        Path file = backupDir.resolve(filename);

        Map<String, Object> root = new LinkedHashMap<>();
        Map<String, Object> tables = new LinkedHashMap<>();
        Map<String, Integer> tableStats = new LinkedHashMap<>();

        for (String table : BACKUP_TABLES) {
            List<Map<String, Object>> rows = dumpTable(table);
            tables.put(table, rows);
            tableStats.put(table, rows.size());
        }

        root.put("timestamp", now.toString());
        root.put("meta", Map.of("schema", "mysql-v1"));
        root.put("tables", tables);

        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), root);
        } catch (IOException e) {
            throw new BusinessException(50068, "write backup file failed: " + e.getMessage());
        }

        Map<String, Object> legacyStats = new LinkedHashMap<>();
        legacyStats.put("questions", tableStats.getOrDefault("question", 0));
        legacyStats.put("explanations", tableStats.getOrDefault("ai_explanation", 0));
        legacyStats.put("errorAnalyses", tableStats.getOrDefault("ai_error_analysis", 0));
        legacyStats.put("variants", tableStats.getOrDefault("ai_variant_question", 0));
        legacyStats.put("knowledgeTrees", tableStats.getOrDefault("ai_knowledge_tree", 0));
        legacyStats.put("designProcesses", tableStats.getOrDefault("ai_design_process", 0));

        Map<String, Object> backupInfo = new LinkedHashMap<>();
        backupInfo.put("filename", filename);
        backupInfo.put("path", file.toString());
        backupInfo.put("timestamp", now.toString());
        backupInfo.put("stats", legacyStats);

        return new BackupBuildResult(backupInfo);
    }

    private List<Map<String, Object>> dumpTable(String table) {
        List<Map<String, Object>> rawRows = jdbcTemplate.queryForList("SELECT * FROM " + table);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> raw : rawRows) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : raw.entrySet()) {
                row.put(entry.getKey(), normalizeForJson(entry.getValue()));
            }
            result.add(row);
        }
        return result;
    }

    private Object normalizeForJson(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.sql.Timestamp || value instanceof java.sql.Date || value instanceof java.sql.Time) {
            return value.toString();
        }
        if (value instanceof byte[] bytes) {
            return new String(bytes, StandardCharsets.UTF_8);
        }
        return value;
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<Map<String, Object>>> readBackupTables(Path backupFile) {
        JsonNode root;
        try {
            root = objectMapper.readTree(backupFile.toFile());
        } catch (IOException e) {
            throw new BusinessException(50069, "read backup file failed: " + e.getMessage());
        }
        JsonNode tablesNode = root.get("tables");
        if (tablesNode == null || !tablesNode.isObject()) {
            throw new BusinessException(40069, "unsupported backup format");
        }
        Map<String, Object> parsed = objectMapper.convertValue(tablesNode, new TypeReference<>() {});
        Map<String, List<Map<String, Object>>> tableData = new LinkedHashMap<>();
        for (String table : BACKUP_TABLES) {
            Object rows = parsed.get(table);
            if (rows instanceof List<?> list) {
                List<Map<String, Object>> mapped = list.stream()
                        .filter(Objects::nonNull)
                        .map(item -> item instanceof Map<?, ?> m ? (Map<String, Object>) m : null)
                        .filter(Objects::nonNull)
                        .map(item -> (Map<String, Object>) new LinkedHashMap<>(item))
                        .toList();
                tableData.put(table, mapped);
            } else {
                tableData.put(table, Collections.emptyList());
            }
        }
        return tableData;
    }

    private void insertRows(String table, List<Map<String, Object>> rows) {
        for (Map<String, Object> row : rows) {
            if (row == null || row.isEmpty()) {
                continue;
            }
            List<String> columns = new ArrayList<>(row.keySet());
            String columnPart = columns.stream().map(col -> "`" + col + "`").collect(Collectors.joining(","));
            String valuePart = columns.stream().map(col -> "?").collect(Collectors.joining(","));
            String sql = "INSERT INTO " + table + " (" + columnPart + ") VALUES (" + valuePart + ")";

            Object[] args = columns.stream().map(col -> normalizeForDb(row.get(col))).toArray();
            jdbcTemplate.update(sql, args);
        }
    }

    private Object normalizeForDb(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Map<?, ?> || value instanceof List<?>) {
            try {
                return objectMapper.writeValueAsString(value);
            } catch (JsonProcessingException e) {
                throw new BusinessException(50070, "serialize db value failed: " + e.getMessage());
            }
        }
        return value;
    }

    private FileTime safeLastModified(Path path) {
        try {
            return Files.getLastModifiedTime(path);
        } catch (IOException ignored) {
            return FileTime.fromMillis(0);
        }
    }

    private Map<String, Object> toBackupFileInfo(Path path) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("filename", path.getFileName().toString());
        try {
            item.put("size", Files.size(path));
            FileTime lastModified = Files.getLastModifiedTime(path);
            item.put("createdAt", lastModified.toInstant().toString());
            item.put("modifiedAt", lastModified.toInstant().toString());
        } catch (IOException ignored) {
            item.put("size", 0L);
            item.put("createdAt", "");
            item.put("modifiedAt", "");
        }

        String type = "未知";
        int questionCount = 0;
        try {
            String content = Files.readString(path, StandardCharsets.UTF_8);
            if (content.contains("\"tables\"")) {
                type = "完整备份";
                JsonNode root = objectMapper.readTree(content);
                JsonNode q = root.path("tables").path("question");
                if (q.isArray()) {
                    questionCount = q.size();
                }
            } else if (content.trim().startsWith("[") && content.contains("\"text\"")) {
                type = "题目备份";
                JsonNode arr = objectMapper.readTree(content);
                if (arr.isArray()) {
                    questionCount = arr.size();
                }
            }
        } catch (Exception ignored) {
        }

        item.put("type", type);
        item.put("questionCount", questionCount);
        return item;
    }

    private record BackupBuildResult(Map<String, Object> backupInfo) {
    }
}
