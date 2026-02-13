package com.quizgen.app.question.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.bookmark.entity.Bookmark;
import com.quizgen.app.bookmark.mapper.BookmarkMapper;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.common.util.CodeGenerator;
import com.quizgen.app.note.entity.Note;
import com.quizgen.app.note.mapper.NoteMapper;
import com.quizgen.app.question.config.ImportJobProperties;
import com.quizgen.app.question.dto.QuestionBackupResponse;
import com.quizgen.app.question.dto.QuestionCleanResultResponse;
import com.quizgen.app.question.dto.QuestionImportAiRequest;
import com.quizgen.app.question.dto.QuestionImportRequest;
import com.quizgen.app.question.dto.QuestionImportResultResponse;
import com.quizgen.app.question.dto.QuestionImportTextRequest;
import com.quizgen.app.question.dto.QuestionOptionDto;
import com.quizgen.app.question.dto.QuestionPageRequest;
import com.quizgen.app.question.dto.QuestionPageResponse;
import com.quizgen.app.question.dto.QuestionResponse;
import com.quizgen.app.question.dto.QuestionUpsertRequest;
import com.quizgen.app.question.entity.ImportJob;
import com.quizgen.app.question.entity.ImportJobItem;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.entity.QuestionOption;
import com.quizgen.app.question.entity.QuestionTag;
import com.quizgen.app.question.entity.QuestionTagRel;
import com.quizgen.app.question.mapper.ImportJobItemMapper;
import com.quizgen.app.question.mapper.ImportJobMapper;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.question.mapper.QuestionOptionMapper;
import com.quizgen.app.question.mapper.QuestionTagMapper;
import com.quizgen.app.question.mapper.QuestionTagRelMapper;
import com.quizgen.app.question.service.QuestionService;
import com.quizgen.app.setting.entity.ApiConfig;
import com.quizgen.app.setting.entity.AppSetting;
import com.quizgen.app.setting.mapper.ApiConfigMapper;
import com.quizgen.app.setting.mapper.AppSettingMapper;
import com.quizgen.app.study.entity.ReviewCard;
import com.quizgen.app.study.entity.UserAnswer;
import com.quizgen.app.study.entity.WrongQuestion;
import com.quizgen.app.study.mapper.ReviewCardMapper;
import com.quizgen.app.study.mapper.UserAnswerMapper;
import com.quizgen.app.study.mapper.WrongQuestionMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class QuestionServiceImpl implements QuestionService {

    private static final DateTimeFormatter BACKUP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");
    private static final String SETTING_IMPORT_MAX_CONCURRENT = "import_max_concurrent";
    private static final String SETTING_IMPORT_BATCH_DELAY = "import_batch_delay";

    private final QuestionMapper questionMapper;
    private final QuestionBankMapper bankMapper;
    private final QuestionOptionMapper optionMapper;
    private final QuestionTagMapper tagMapper;
    private final QuestionTagRelMapper tagRelMapper;
    private final UserAnswerMapper userAnswerMapper;
    private final ReviewCardMapper reviewCardMapper;
    private final WrongQuestionMapper wrongQuestionMapper;
    private final BookmarkMapper bookmarkMapper;
    private final NoteMapper noteMapper;
    private final ImportJobMapper importJobMapper;
    private final ImportJobItemMapper importJobItemMapper;
    private final ApiConfigMapper apiConfigMapper;
    private final AppSettingMapper appSettingMapper;
    private final ImportJobProperties importJobProperties;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public QuestionServiceImpl(
            QuestionMapper questionMapper,
            QuestionBankMapper bankMapper,
            QuestionOptionMapper optionMapper,
            QuestionTagMapper tagMapper,
            QuestionTagRelMapper tagRelMapper,
            UserAnswerMapper userAnswerMapper,
            ReviewCardMapper reviewCardMapper,
            WrongQuestionMapper wrongQuestionMapper,
            BookmarkMapper bookmarkMapper,
            NoteMapper noteMapper,
            ImportJobMapper importJobMapper,
            ImportJobItemMapper importJobItemMapper,
            ApiConfigMapper apiConfigMapper,
            AppSettingMapper appSettingMapper,
            ImportJobProperties importJobProperties,
            ObjectMapper objectMapper,
            JdbcTemplate jdbcTemplate
    ) {
        this.questionMapper = questionMapper;
        this.bankMapper = bankMapper;
        this.optionMapper = optionMapper;
        this.tagMapper = tagMapper;
        this.tagRelMapper = tagRelMapper;
        this.userAnswerMapper = userAnswerMapper;
        this.reviewCardMapper = reviewCardMapper;
        this.wrongQuestionMapper = wrongQuestionMapper;
        this.bookmarkMapper = bookmarkMapper;
        this.noteMapper = noteMapper;
        this.importJobMapper = importJobMapper;
        this.importJobItemMapper = importJobItemMapper;
        this.apiConfigMapper = apiConfigMapper;
        this.appSettingMapper = appSettingMapper;
        this.importJobProperties = importJobProperties;
        this.objectMapper = objectMapper;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public QuestionPageResponse page(QuestionPageRequest request) {
        int pageNo = request.getPage() == null || request.getPage() < 1 ? 1 : request.getPage();
        int limit = request.getLimit() == null || request.getLimit() < 1 ? 100 : request.getLimit();

        QueryWrapper<Question> q = new QueryWrapper<>();
        q.orderByDesc("created_at");
        if (StringUtils.hasText(request.getType())) {
            q.eq("type", request.getType());
        }
        if (StringUtils.hasText(request.getSearch())) {
            q.like("text", request.getSearch());
        }
        if (StringUtils.hasText(request.getBankId())) {
            if ("null".equalsIgnoreCase(request.getBankId())) {
                q.isNull("bank_id");
            } else {
                QuestionBank bank = bankMapper.selectOne(new LambdaQueryWrapper<QuestionBank>()
                        .eq(QuestionBank::getBankCode, request.getBankId()));
                if (bank == null) {
                    q.eq("id", -1L);
                } else {
                    q.eq("bank_id", bank.getId());
                }
            }
        }
        if (StringUtils.hasText(request.getTags())) {
            List<String> tags = Stream.of(request.getTags().split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
            if (!tags.isEmpty()) {
                List<Long> tagIds = tagMapper.selectList(new LambdaQueryWrapper<QuestionTag>().in(QuestionTag::getName, tags))
                        .stream().map(QuestionTag::getId).toList();
                if (tagIds.isEmpty()) {
                    q.eq("id", -1L);
                } else {
                    List<Long> questionIds = tagRelMapper.selectList(new LambdaQueryWrapper<QuestionTagRel>().in(QuestionTagRel::getTagId, tagIds))
                            .stream().map(QuestionTagRel::getQuestionId).distinct().toList();
                    if (questionIds.isEmpty()) {
                        q.eq("id", -1L);
                    } else {
                        q.in("id", questionIds);
                    }
                }
            }
        }

        Page<Question> p = questionMapper.selectPage(new Page<>(pageNo, limit), q);
        QuestionPageResponse response = new QuestionPageResponse();
        response.setData(p.getRecords().stream().map(this::toResponse).toList());
        response.setTotal(p.getTotal());
        response.setPage(pageNo);
        response.setTotalPages((long) Math.ceil((double) p.getTotal() / limit));
        return response;
    }

    @Override
    public QuestionResponse getByCode(String questionCode) {
        return toResponse(findByCode(questionCode));
    }

    @Override
    public QuestionResponse create(QuestionUpsertRequest request) {
        validateRequest(request);
        Question question = new Question();
        question.setQuestionCode(StringUtils.hasText(request.getId()) ? request.getId() : CodeGenerator.nextCode());
        question.setType(request.getType());
        question.setText(request.getText());
        question.setAnswer(normalizeAnswer(request.getAnswer()));
        question.setExplanation(request.getExplanation());
        question.setBankId(findBankId(request.getBankId()));
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        questionMapper.insert(question);
        saveAssets(question.getId(), request.getOptions(), request.getTags());
        return toResponse(question);
    }

    @Override
    public QuestionResponse update(String questionCode, QuestionUpsertRequest request) {
        validateRequest(request);
        Question question = findByCode(questionCode);
        question.setType(request.getType());
        question.setText(request.getText());
        question.setAnswer(normalizeAnswer(request.getAnswer()));
        question.setExplanation(request.getExplanation());
        question.setBankId(findBankId(request.getBankId()));
        question.setUpdatedAt(LocalDateTime.now());
        questionMapper.updateById(question);
        saveAssets(question.getId(), request.getOptions(), request.getTags());
        return toResponse(question);
    }

    @Override
    public void delete(String questionCode) {
        Question question = findByCode(questionCode);
        deleteQuestionIds(List.of(question.getId()));
    }

    @Override
    public List<String> allTags() {
        return tagMapper.selectList(new QueryWrapper<QuestionTag>().orderByAsc("name"))
                .stream().map(QuestionTag::getName).toList();
    }

    @Override
    public QuestionImportResultResponse importQuestions(QuestionImportRequest request) {
        if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
            throw new BusinessException(40001, "questions payload is empty");
        }
        if ("replace".equalsIgnoreCase(request.getMode())) {
            purgeAllQuestions();
        }

        int duplicateCount = 0;
        List<QuestionResponse> inserted = new ArrayList<>();
        for (QuestionUpsertRequest item : request.getQuestions()) {
            validateRequest(item);
            String questionCode = StringUtils.hasText(item.getId()) ? item.getId() : CodeGenerator.nextCode();
            boolean exists = questionMapper.selectOne(new LambdaQueryWrapper<Question>().eq(Question::getQuestionCode, questionCode)) != null
                    || questionMapper.selectOne(new LambdaQueryWrapper<Question>().eq(Question::getText, item.getText())) != null;
            if (exists) {
                duplicateCount++;
                continue;
            }

            Question question = new Question();
            question.setQuestionCode(questionCode);
            question.setType(item.getType());
            question.setText(item.getText());
            question.setAnswer(normalizeAnswer(item.getAnswer()));
            question.setExplanation(item.getExplanation());
            String bankCode = StringUtils.hasText(item.getBankId()) ? item.getBankId() : request.getBankId();
            question.setBankId(findBankId(bankCode));
            question.setCreatedAt(LocalDateTime.now());
            question.setUpdatedAt(LocalDateTime.now());
            questionMapper.insert(question);

            List<String> tags = (item.getTags() != null && !item.getTags().isEmpty()) ? item.getTags() : request.getTags();
            saveAssets(question.getId(), item.getOptions(), tags);
            inserted.add(toResponse(question));
        }

        QuestionImportResultResponse response = new QuestionImportResultResponse();
        response.setParsedCount(request.getQuestions().size());
        response.setInsertedCount(inserted.size());
        response.setDuplicateCount(duplicateCount);
        response.setData(inserted);
        return response;
    }

    @Override
    public QuestionImportResultResponse importText(QuestionImportTextRequest request) {
        List<QuestionUpsertRequest> parsed = parseText(request.getContent());
        if (parsed.isEmpty()) {
            throw new BusinessException(40002, "no valid questions parsed from text");
        }
        QuestionImportRequest importRequest = new QuestionImportRequest();
        importRequest.setMode(request.getMode());
        importRequest.setBankId(request.getBankId());
        importRequest.setTags(request.getTags());
        importRequest.setQuestions(parsed);
        return importQuestions(importRequest);
    }

    @Override
    public Map<String, Object> importWithAi(QuestionImportAiRequest request) {
        if (request == null || !StringUtils.hasText(request.getContent())) {
            throw new BusinessException(40011, "content is required");
        }

        cleanupImportJobs();

        String mode = normalizeImportMode(request.getMode());
        String importId = "imp_" + CodeGenerator.nextCode();

        ImportJob job = new ImportJob();
        job.setJobNo(importId);
        job.setMode(mode);
        job.setStatus("processing");
        job.setTotalChunks(0);
        job.setProcessedChunks(0);
        job.setSuccessChunks(0);
        job.setFailedChunks(0);
        job.setStartedAt(LocalDateTime.now());
        importJobMapper.insert(job);

        Long jobId = job.getId();
        String content = request.getContent();
        String bankId = request.getBankId();
        CompletableFuture.runAsync(() -> processAiImport(jobId, content, mode, bankId));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "题目导入已开始处理");
        response.put("importId", importId);
        response.put("mode", mode);
        return response;
    }

    @Override
    public Map<String, Object> getImportStatus(String importId) {
        if (!StringUtils.hasText(importId)) {
            throw new BusinessException(40012, "importId is required");
        }

        cleanupImportJobs();

        ImportJob job = importJobMapper.selectOne(new LambdaQueryWrapper<ImportJob>().eq(ImportJob::getJobNo, importId.trim()));
        if (job == null) {
            throw new BusinessException(40412, "import job not found");
        }

        List<ImportJobItem> items = importJobItemMapper.selectList(
                new LambdaQueryWrapper<ImportJobItem>()
                        .eq(ImportJobItem::getJobId, job.getId())
                        .orderByAsc(ImportJobItem::getChunkNo)
        );

        int importedCount = 0;
        List<String> errors = new ArrayList<>();
        for (ImportJobItem item : items) {
            if (StringUtils.hasText(item.getResultJson())) {
                importedCount += readInsertedCount(item.getResultJson());
            }
            if (StringUtils.hasText(item.getErrorMessage())) {
                errors.add(item.getErrorMessage());
            }
        }
        if (errors.isEmpty() && StringUtils.hasText(job.getErrorMessage())) {
            errors.add(job.getErrorMessage());
        }
        if (errors.size() > 10) {
            errors = errors.subList(0, 10);
        }

        int total = valueOrZero(job.getTotalChunks());
        int processed = valueOrZero(job.getProcessedChunks());
        int success = valueOrZero(job.getSuccessChunks());
        int failed = valueOrZero(job.getFailedChunks());
        String percentage = total <= 0 ? "0.0" : String.format("%.1f", processed * 100.0 / total);

        LocalDateTime startedAt = job.getStartedAt();
        LocalDateTime endAt = job.getEndedAt() == null ? LocalDateTime.now() : job.getEndedAt();
        String duration = "0.0";
        if (startedAt != null) {
            long millis = Duration.between(startedAt, endAt).toMillis();
            duration = String.format("%.1f", millis / 1000.0);
        }

        Map<String, Object> progress = new LinkedHashMap<>();
        progress.put("total", total);
        progress.put("processed", processed);
        progress.put("successful", success);
        progress.put("failed", failed);
        progress.put("percentage", percentage);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", job.getJobNo());
        response.put("status", job.getStatus());
        response.put("mode", job.getMode());
        response.put("progress", progress);
        response.put("importedCount", importedCount);
        response.put("duration", duration);
        response.put("errors", errors);
        return response;
    }

    @Override
    public QuestionCleanResultResponse cleanDuplicates() {
        List<Question> all = questionMapper.selectList(new QueryWrapper<Question>().orderByDesc("created_at"));
        long original = all.size();
        Set<String> seen = new LinkedHashSet<>();
        List<Long> duplicates = new ArrayList<>();
        for (Question question : all) {
            String key = question.getText() == null ? "" : question.getText().trim();
            if (seen.contains(key)) {
                duplicates.add(question.getId());
            } else {
                seen.add(key);
            }
        }
        deleteQuestionIds(duplicates);
        long current = questionMapper.selectCount(null);
        QuestionCleanResultResponse response = new QuestionCleanResultResponse();
        response.setOriginalCount(original);
        response.setCurrentCount(current);
        response.setRemovedCount(original - current);
        return response;
    }

    @Override
    public QuestionBackupResponse backup() {
        List<QuestionResponse> questions = questionMapper.selectList(new QueryWrapper<Question>().orderByDesc("created_at"))
                .stream().map(this::toResponse).toList();
        LocalDateTime now = LocalDateTime.now();
        String id = "questions_backup_" + now.format(BACKUP_FORMAT);
        String filename = id + ".json";
        Path file = ensureBackupDir().resolve(filename);
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), questions);
        } catch (IOException e) {
            throw new BusinessException(50021, "backup write failed: " + e.getMessage());
        }
        QuestionBackupResponse response = new QuestionBackupResponse();
        response.setBackupId(id);
        response.setFilename(filename);
        response.setTimestamp(now.toString());
        response.setQuestionCount(questions.size());
        return response;
    }

    @Override
    public QuestionBackupResponse restore(String backupId) {
        Path file = resolveBackupFile(backupId);
        List<QuestionUpsertRequest> questions = readQuestions(file);
        purgeAllQuestions();
        QuestionImportRequest request = new QuestionImportRequest();
        request.setQuestions(questions);
        request.setMode("add");
        QuestionImportResultResponse imported = importQuestions(request);

        QuestionBackupResponse response = new QuestionBackupResponse();
        response.setBackupId(backupId);
        response.setFilename(file.getFileName().toString());
        response.setTimestamp(LocalDateTime.now().toString());
        response.setQuestionCount(imported.getInsertedCount());
        return response;
    }

    private Question findByCode(String code) {
        Question question = questionMapper.selectOne(new LambdaQueryWrapper<Question>().eq(Question::getQuestionCode, code));
        if (question == null) {
            throw new BusinessException(40404, "question not found");
        }
        return question;
    }

    private Long findBankId(String bankCode) {
        if (!StringUtils.hasText(bankCode)) {
            return null;
        }
        QuestionBank bank = bankMapper.selectOne(new LambdaQueryWrapper<QuestionBank>().eq(QuestionBank::getBankCode, bankCode));
        if (bank == null) {
            throw new BusinessException(40004, "bank not found");
        }
        return bank.getId();
    }

    private void validateRequest(QuestionUpsertRequest request) {
        if (request == null || !StringUtils.hasText(request.getType()) || !StringUtils.hasText(request.getText()) || !StringUtils.hasText(request.getAnswer())) {
            throw new BusinessException(40003, "question type/text/answer are required");
        }
    }

    private QuestionResponse toResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getQuestionCode());
        response.setType(question.getType());
        response.setText(question.getText());
        response.setAnswer(question.getAnswer());
        response.setExplanation(question.getExplanation());
        response.setCreatedAt(question.getCreatedAt());
        response.setUpdatedAt(question.getUpdatedAt());
        if (question.getBankId() != null) {
            QuestionBank bank = bankMapper.selectById(question.getBankId());
            if (bank != null) {
                response.setBankId(bank.getBankCode());
            }
        }

        List<QuestionOptionDto> options = optionMapper.selectList(new LambdaQueryWrapper<QuestionOption>()
                        .eq(QuestionOption::getQuestionId, question.getId())
                        .orderByAsc(QuestionOption::getSortOrder))
                .stream().map(option -> {
                    QuestionOptionDto dto = new QuestionOptionDto();
                    dto.setLetter(option.getOptionKey());
                    dto.setText(option.getOptionText());
                    return dto;
                }).toList();
        response.setOptions(options);

        List<Long> tagIds = tagRelMapper.selectList(new LambdaQueryWrapper<QuestionTagRel>().eq(QuestionTagRel::getQuestionId, question.getId()))
                .stream().map(QuestionTagRel::getTagId).toList();
        if (tagIds.isEmpty()) {
            response.setTags(Collections.emptyList());
        } else {
            response.setTags(tagMapper.selectBatchIds(tagIds).stream().map(QuestionTag::getName).toList());
        }
        return response;
    }

    private void saveAssets(Long questionId, List<QuestionOptionDto> options, List<String> tags) {
        optionMapper.delete(new LambdaQueryWrapper<QuestionOption>().eq(QuestionOption::getQuestionId, questionId));
        if (options != null) {
            int order = 0;
            for (QuestionOptionDto option : options) {
                if (option == null || !StringUtils.hasText(option.getLetter()) || !StringUtils.hasText(option.getText())) {
                    continue;
                }
                QuestionOption entity = new QuestionOption();
                entity.setQuestionId(questionId);
                entity.setOptionKey(option.getLetter().trim());
                entity.setOptionText(option.getText().trim());
                entity.setSortOrder(order++);
                optionMapper.insert(entity);
            }
        }

        tagRelMapper.delete(new LambdaQueryWrapper<QuestionTagRel>().eq(QuestionTagRel::getQuestionId, questionId));
        if (tags != null && !tags.isEmpty()) {
            Set<String> uniqueTags = tags.stream().filter(StringUtils::hasText).map(String::trim)
                    .filter(s -> !s.isEmpty()).collect(Collectors.toCollection(LinkedHashSet::new));
            for (String tagName : uniqueTags) {
                QuestionTag tag = tagMapper.selectOne(new LambdaQueryWrapper<QuestionTag>().eq(QuestionTag::getName, tagName));
                if (tag == null) {
                    tag = new QuestionTag();
                    tag.setName(tagName);
                    tag.setCreatedAt(LocalDateTime.now());
                    tagMapper.insert(tag);
                }
                QuestionTagRel rel = new QuestionTagRel();
                rel.setQuestionId(questionId);
                rel.setTagId(tag.getId());
                tagRelMapper.insert(rel);
            }
        }
    }

    private void deleteQuestionIds(List<Long> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            return;
        }
        noteMapper.delete(new LambdaQueryWrapper<Note>().in(Note::getQuestionId, questionIds));
        bookmarkMapper.delete(new LambdaQueryWrapper<Bookmark>().in(Bookmark::getQuestionId, questionIds));
        userAnswerMapper.delete(new LambdaQueryWrapper<UserAnswer>().in(UserAnswer::getQuestionId, questionIds));
        reviewCardMapper.delete(new LambdaQueryWrapper<ReviewCard>().in(ReviewCard::getQuestionId, questionIds));
        wrongQuestionMapper.delete(new LambdaQueryWrapper<WrongQuestion>().in(WrongQuestion::getQuestionId, questionIds));
        optionMapper.delete(new LambdaQueryWrapper<QuestionOption>().in(QuestionOption::getQuestionId, questionIds));
        tagRelMapper.delete(new LambdaQueryWrapper<QuestionTagRel>().in(QuestionTagRel::getQuestionId, questionIds));
        deleteAiByQuestionIds(questionIds);
        questionMapper.delete(new LambdaQueryWrapper<Question>().in(Question::getId, questionIds));
        cleanOrphanTags();
    }

    private void purgeAllQuestions() {
        noteMapper.delete(null);
        bookmarkMapper.delete(null);
        userAnswerMapper.delete(null);
        reviewCardMapper.delete(null);
        wrongQuestionMapper.delete(null);
        optionMapper.delete(null);
        tagRelMapper.delete(null);
        deleteAllAiArtifacts();
        questionMapper.delete(null);
        tagMapper.delete(null);
    }

    private void cleanOrphanTags() {
        List<Long> usedTagIds = tagRelMapper.selectList(null).stream().map(QuestionTagRel::getTagId).distinct().toList();
        if (usedTagIds.isEmpty()) {
            tagMapper.delete(null);
        } else {
            tagMapper.delete(new QueryWrapper<QuestionTag>().notIn("id", usedTagIds));
        }
    }

    private void deleteAiByQuestionIds(List<Long> questionIds) {
        String placeholders = questionIds.stream().map(v -> "?").collect(Collectors.joining(","));
        Object[] args = questionIds.toArray();
        jdbcTemplate.update("DELETE FROM ai_explanation WHERE question_id IN (" + placeholders + ")", args);
        jdbcTemplate.update("DELETE FROM ai_error_analysis WHERE question_id IN (" + placeholders + ")", args);
        jdbcTemplate.update("DELETE FROM ai_variant_question WHERE question_id IN (" + placeholders + ")", args);
        jdbcTemplate.update("DELETE FROM ai_knowledge_tree WHERE question_id IN (" + placeholders + ")", args);
        jdbcTemplate.update("DELETE FROM ai_design_process WHERE question_id IN (" + placeholders + ")", args);
    }

    private void deleteAllAiArtifacts() {
        jdbcTemplate.update("DELETE FROM ai_explanation");
        jdbcTemplate.update("DELETE FROM ai_error_analysis");
        jdbcTemplate.update("DELETE FROM ai_variant_question");
        jdbcTemplate.update("DELETE FROM ai_knowledge_tree");
        jdbcTemplate.update("DELETE FROM ai_design_process");
    }

    private Path ensureBackupDir() {
        Path dir = Paths.get("data", "backups");
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new BusinessException(50022, "create backup dir failed: " + e.getMessage());
        }
        return dir;
    }

    private Path resolveBackupFile(String backupId) {
        Path dir = ensureBackupDir();
        Path exact = dir.resolve(backupId);
        if (Files.exists(exact) && Files.isRegularFile(exact)) {
            return exact;
        }
        Path withJson = dir.resolve(backupId + ".json");
        if (Files.exists(withJson) && Files.isRegularFile(withJson)) {
            return withJson;
        }
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".json"))
                    .filter(path -> path.getFileName().toString().contains(backupId))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(40421, "backup file not found: " + backupId));
        } catch (IOException e) {
            throw new BusinessException(50023, "read backup dir failed: " + e.getMessage());
        }
    }

    private List<QuestionUpsertRequest> readQuestions(Path file) {
        try {
            JsonNode root = objectMapper.readTree(file.toFile());
            if (root.isArray()) {
                return objectMapper.convertValue(root, new TypeReference<List<QuestionUpsertRequest>>() {});
            }
            JsonNode questions = root.get("questions");
            if (questions != null && questions.isArray()) {
                return objectMapper.convertValue(questions, new TypeReference<List<QuestionUpsertRequest>>() {});
            }
            throw new BusinessException(40021, "invalid backup format");
        } catch (IOException e) {
            throw new BusinessException(50024, "read backup failed: " + e.getMessage());
        }
    }

    private List<QuestionUpsertRequest> parseText(String content) {
        List<QuestionUpsertRequest> result = new ArrayList<>();
        if (!StringUtils.hasText(content)) {
            return result;
        }
        String[] blocks = content.split("\\r?\\n\\s*\\r?\\n");
        for (String block : blocks) {
            List<String> lines = Stream.of(block.split("\\r?\\n"))
                    .map(String::trim).filter(s -> !s.isEmpty()).toList();
            if (lines.isEmpty()) {
                continue;
            }

            String text = lines.get(0).replaceFirst("^\\d+[\\.、\\)]\\s*", "");
            String answer = null;
            String explanation = null;
            List<QuestionOptionDto> options = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line.matches("^[A-H][\\.、:：\\)].+")) {
                    QuestionOptionDto option = new QuestionOptionDto();
                    option.setLetter(line.substring(0, 1));
                    option.setText(line.substring(2).trim());
                    options.add(option);
                } else if (line.toLowerCase().startsWith("answer:") || line.startsWith("答案:") || line.startsWith("答案：")) {
                    answer = line.substring(line.indexOf(':') >= 0 ? line.indexOf(':') + 1 : line.indexOf('：') + 1).trim();
                } else if (line.toLowerCase().startsWith("explanation:") || line.startsWith("解析:") || line.startsWith("解析：")) {
                    explanation = line.substring(line.indexOf(':') >= 0 ? line.indexOf(':') + 1 : line.indexOf('：') + 1).trim();
                }
            }

            if (!StringUtils.hasText(answer)) {
                continue;
            }

            QuestionUpsertRequest request = new QuestionUpsertRequest();
            request.setText(text);
            request.setAnswer(normalizeAnswer(answer));
            request.setExplanation(explanation);
            if (!options.isEmpty()) {
                request.setOptions(options);
                request.setType(request.getAnswer().contains(",") ? "多选题" : "单选题");
            } else {
                String normalized = request.getAnswer().toLowerCase();
                if (normalized.equals("对") || normalized.equals("错") || normalized.equals("true") || normalized.equals("false")) {
                    request.setType("判断题");
                } else {
                    request.setType("简答题");
                }
            }
            result.add(request);
        }
        return result;
    }

    private String normalizeImportMode(String mode) {
        if ("replace".equalsIgnoreCase(mode)) {
            return "replace";
        }
        return "add";
    }

    private void processAiImport(Long jobId, String content, String mode, String bankId) {
        try {
            if ("replace".equalsIgnoreCase(mode)) {
                purgeAllQuestions();
            }

            int chunkSize = resolveImportChunkSize();
            int maxConcurrent = Math.max(1, readIntSetting(SETTING_IMPORT_MAX_CONCURRENT, 2));
            int batchDelaySeconds = Math.max(0, readIntSetting(SETTING_IMPORT_BATCH_DELAY, 2));
            List<String> chunks = splitContentIntoChunks(content, chunkSize);
            if (chunks.isEmpty()) {
                throw new BusinessException(40013, "content has no valid chunk");
            }
            updateJobTotalChunks(jobId, chunks.size());

            for (int i = 0; i < chunks.size(); i += maxConcurrent) {
                int end = Math.min(i + maxConcurrent, chunks.size());
                List<CompletableFuture<Void>> futures = new ArrayList<>();
                for (int j = i; j < end; j++) {
                    final int chunkNo = j + 1;
                    final String chunk = chunks.get(j);
                    futures.add(CompletableFuture.runAsync(() -> processAiImportChunk(jobId, chunkNo, chunk, bankId)));
                }
                for (CompletableFuture<Void> future : futures) {
                    future.join();
                }
                if (end < chunks.size() && batchDelaySeconds > 0) {
                    sleepQuietly(batchDelaySeconds * 1000L);
                }
            }
            finalizeJobStatus(jobId);
        } catch (Exception ex) {
            markJobFailed(jobId, ex.getMessage());
        } finally {
            cleanupImportJobs();
        }
    }

    private void processAiImportChunk(Long jobId, int chunkNo, String chunk, String bankId) {
        int maxAttempts = importJobProperties.getChunkMaxRetries() + 1;
        Exception lastError = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                List<QuestionUpsertRequest> parsed = parseQuestionsWithAi(chunk);
                if (parsed.isEmpty()) {
                    throw new BusinessException(40014, "no question parsed from ai result");
                }

                QuestionImportRequest importRequest = new QuestionImportRequest();
                importRequest.setMode("add");
                importRequest.setBankId(bankId);
                importRequest.setQuestions(parsed);
                QuestionImportResultResponse imported = importQuestions(importRequest);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("parsedCount", imported.getParsedCount());
                result.put("insertedCount", imported.getInsertedCount());
                result.put("duplicateCount", imported.getDuplicateCount());
                result.put("attempts", attempt);
                markChunkSuccess(jobId, chunkNo, writeJson(result));
                return;
            } catch (Exception ex) {
                lastError = ex;
                if (!isRetryableChunkError(ex) || attempt >= maxAttempts) {
                    break;
                }
                sleepQuietly(importJobProperties.getRetryBaseDelayMs() * attempt);
            }
        }
        String message = "chunk " + chunkNo + " failed after " + maxAttempts + " attempts: "
                + (lastError == null ? "unknown error" : lastError.getMessage());
        markChunkFailed(jobId, chunkNo, message);
    }

    private void markChunkSuccess(Long jobId, Integer chunkNo, String resultJson) {
        ImportJobItem item = new ImportJobItem();
        item.setJobId(jobId);
        item.setChunkNo(chunkNo);
        item.setStatus("success");
        item.setResultJson(resultJson);
        importJobItemMapper.insert(item);
        jdbcTemplate.update(
                "UPDATE import_job SET processed_chunks = processed_chunks + 1, success_chunks = success_chunks + 1 WHERE id = ?",
                jobId
        );
    }

    private void markChunkFailed(Long jobId, Integer chunkNo, String errorMessage) {
        ImportJobItem item = new ImportJobItem();
        item.setJobId(jobId);
        item.setChunkNo(chunkNo);
        item.setStatus("failed");
        item.setErrorMessage(safeError(errorMessage));
        importJobItemMapper.insert(item);
        jdbcTemplate.update(
                "UPDATE import_job SET processed_chunks = processed_chunks + 1, failed_chunks = failed_chunks + 1 WHERE id = ?",
                jobId
        );
    }

    private void updateJobTotalChunks(Long jobId, int totalChunks) {
        jdbcTemplate.update("UPDATE import_job SET total_chunks = ? WHERE id = ?", totalChunks, jobId);
    }

    private void markJobCompleted(Long jobId) {
        jdbcTemplate.update("UPDATE import_job SET status = ?, ended_at = ? WHERE id = ?", "completed", LocalDateTime.now(), jobId);
    }

    private void markJobFailed(Long jobId, String errorMessage) {
        jdbcTemplate.update(
                "UPDATE import_job SET status = ?, ended_at = ?, error_message = ? WHERE id = ?",
                "failed",
                LocalDateTime.now(),
                safeError(errorMessage),
                jobId
        );
    }

    private void finalizeJobStatus(Long jobId) {
        ImportJob job = importJobMapper.selectById(jobId);
        if (job == null) {
            return;
        }
        int success = valueOrZero(job.getSuccessChunks());
        int failed = valueOrZero(job.getFailedChunks());
        if (success == 0 && failed > 0) {
            markJobFailed(jobId, "all chunks failed");
        } else {
            markJobCompleted(jobId);
        }
    }

    private boolean isRetryableChunkError(Exception ex) {
        if (ex instanceof BusinessException be) {
            int code = be.getCode();
            return code >= 50000;
        }
        return true;
    }

    private void cleanupImportJobs() {
        markTimeoutImportJobs();
        cleanupExpiredImportJobs();
        cleanupOverflowFinishedJobs();
    }

    private void markTimeoutImportJobs() {
        LocalDateTime timeoutAt = LocalDateTime.now().minusHours(importJobProperties.getTimeoutHours());
        List<ImportJob> staleProcessing = importJobMapper.selectList(
                new LambdaQueryWrapper<ImportJob>()
                        .eq(ImportJob::getStatus, "processing")
                        .lt(ImportJob::getStartedAt, timeoutAt)
        );
        for (ImportJob job : staleProcessing) {
            markJobFailed(job.getId(), "import job timeout");
        }
    }

    private void cleanupExpiredImportJobs() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(importJobProperties.getRetentionHours());
        List<ImportJob> expired = importJobMapper.selectList(
                new LambdaQueryWrapper<ImportJob>()
                        .in(ImportJob::getStatus, List.of("completed", "failed"))
                        .lt(ImportJob::getEndedAt, cutoff)
        );
        deleteImportJobs(expired.stream().map(ImportJob::getId).toList());
    }

    private void cleanupOverflowFinishedJobs() {
        List<ImportJob> finishedJobs = importJobMapper.selectList(
                new QueryWrapper<ImportJob>()
                        .in("status", List.of("completed", "failed"))
                        .orderByDesc("ended_at")
                        .orderByDesc("id")
        );
        int keep = importJobProperties.getMaxFinishedKeep();
        if (finishedJobs.size() <= keep) {
            return;
        }
        List<Long> removeIds = finishedJobs.subList(keep, finishedJobs.size())
                .stream()
                .map(ImportJob::getId)
                .toList();
        deleteImportJobs(removeIds);
    }

    private void deleteImportJobs(List<Long> jobIds) {
        if (jobIds == null || jobIds.isEmpty()) {
            return;
        }
        importJobItemMapper.delete(new LambdaQueryWrapper<ImportJobItem>().in(ImportJobItem::getJobId, jobIds));
        importJobMapper.delete(new LambdaQueryWrapper<ImportJob>().in(ImportJob::getId, jobIds));
    }

    private List<QuestionUpsertRequest> parseQuestionsWithAi(String chunk) {
        ApiConfig config = resolveImportApiConfig();
        String systemPrompt = """
                你是一位专业的题库格式化助手。你的任务是将提供的文本内容转换为标准的JSON格式。

                请将每个题目解析为以下格式，并将所有题目组合为一个JSON数组：
                [
                  {
                    "type": "题目类型",
                    "text": "题目内容",
                    "options": [
                      {"letter": "A", "text": "选项A内容"},
                      {"letter": "B", "text": "选项B内容"}
                    ],
                    "answer": "正确答案",
                    "explanation": "答案解析"
                  }
                ]

                请直接返回有效的JSON数组，不要添加任何解释、注释或其他文本。
                """;
        String userPrompt = "以下是需要格式化的题库内容：\n\n" + chunk;
        String raw = callChatCompletion(config, systemPrompt, userPrompt);
        String cleaned = extractJsonFromText(raw);
        JsonNode node = parseJsonNode(cleaned);
        if (node == null) {
            node = parseJsonNode(raw);
        }
        if (node == null) {
            throw new BusinessException(50015, "ai response contains no valid json");
        }
        return parseQuestionNodes(node);
    }

    private List<QuestionUpsertRequest> parseQuestionNodes(JsonNode node) {
        List<QuestionUpsertRequest> result = new ArrayList<>();
        if (node == null || node.isNull()) {
            return result;
        }

        if (node.isObject() && node.get("questions") != null && node.get("questions").isArray()) {
            node = node.get("questions");
        }

        if (node.isArray()) {
            for (JsonNode item : node) {
                QuestionUpsertRequest request = toAiImportRequest(item);
                if (request != null) {
                    result.add(request);
                }
            }
            return result;
        }

        QuestionUpsertRequest request = toAiImportRequest(node);
        if (request != null) {
            result.add(request);
        }
        return result;
    }

    private QuestionUpsertRequest toAiImportRequest(JsonNode node) {
        if (node == null || !node.isObject()) {
            return null;
        }

        String text = readText(node, "text");
        String answer = readAnswer(node.get("answer"));
        List<QuestionOptionDto> options = readOptions(node.get("options"));
        String type = readText(node, "type");
        if (!StringUtils.hasText(type)) {
            if (!options.isEmpty()) {
                type = StringUtils.hasText(answer) && answer.contains(",") ? "多选题" : "单选题";
            } else if (StringUtils.hasText(answer) && isJudgementAnswer(answer)) {
                type = "判断题";
            } else {
                type = "简答题";
            }
        }

        if (!StringUtils.hasText(text) || !StringUtils.hasText(answer) || !StringUtils.hasText(type)) {
            return null;
        }

        QuestionUpsertRequest request = new QuestionUpsertRequest();
        request.setType(type.trim());
        request.setText(text.trim());
        request.setAnswer(normalizeAnswer(answer));
        request.setExplanation(readText(node, "explanation"));
        request.setOptions(options);
        return request;
    }

    private List<QuestionOptionDto> readOptions(JsonNode optionsNode) {
        List<QuestionOptionDto> options = new ArrayList<>();
        if (optionsNode == null || !optionsNode.isArray()) {
            return options;
        }
        int index = 0;
        for (JsonNode optionNode : optionsNode) {
            String letter = readText(optionNode, "letter");
            String text = readText(optionNode, "text");
            if (!StringUtils.hasText(text)) {
                continue;
            }
            if (!StringUtils.hasText(letter)) {
                letter = String.valueOf((char) ('A' + index));
            }
            QuestionOptionDto option = new QuestionOptionDto();
            option.setLetter(letter.trim().substring(0, 1).toUpperCase());
            option.setText(text.trim());
            options.add(option);
            index++;
        }
        return options;
    }

    private String readAnswer(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isArray()) {
            List<String> values = new ArrayList<>();
            for (JsonNode item : node) {
                if (item != null && !item.isNull() && StringUtils.hasText(item.asText())) {
                    values.add(item.asText().trim());
                }
            }
            return values.isEmpty() ? null : String.join(",", values);
        }
        return StringUtils.hasText(node.asText()) ? node.asText().trim() : null;
    }

    private boolean isJudgementAnswer(String answer) {
        String value = answer == null ? "" : answer.trim().toLowerCase();
        return value.equals("对") || value.equals("错") || value.equals("true") || value.equals("false");
    }

    private String readText(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return null;
        }
        String value = node.get(field).asText();
        return StringUtils.hasText(value) ? value : null;
    }

    private JsonNode parseJsonNode(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String input = text.trim();
        try {
            return objectMapper.readTree(input);
        } catch (Exception ignored) {
        }

        int arrStart = input.indexOf('[');
        int arrEnd = input.lastIndexOf(']');
        if (arrStart >= 0 && arrEnd > arrStart) {
            try {
                return objectMapper.readTree(input.substring(arrStart, arrEnd + 1));
            } catch (Exception ignored) {
            }
        }

        int objStart = input.indexOf('{');
        int objEnd = input.lastIndexOf('}');
        if (objStart >= 0 && objEnd > objStart) {
            try {
                return objectMapper.readTree(input.substring(objStart, objEnd + 1));
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private String extractJsonFromText(String text) {
        if (!StringUtils.hasText(text)) {
            return text;
        }
        String result = text.trim();
        if (result.contains("```json")) {
            String[] parts = result.split("```json", 2);
            result = parts.length > 1 ? parts[1] : result;
            int end = result.indexOf("```");
            if (end >= 0) {
                result = result.substring(0, end);
            }
            return result.trim();
        }
        if (result.startsWith("```")) {
            int firstBreak = result.indexOf('\n');
            if (firstBreak >= 0) {
                result = result.substring(firstBreak + 1);
            }
            int end = result.indexOf("```");
            if (end >= 0) {
                result = result.substring(0, end);
            }
            return result.trim();
        }
        return result;
    }

    private String callChatCompletion(ApiConfig config, String systemPrompt, String userPrompt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", StringUtils.hasText(config.getModel()) ? config.getModel() : "Qwen/Qwen2.5-7B-Instruct");
        payload.put("messages", List.of(message("system", systemPrompt), message("user", userPrompt)));
        payload.put("stream", false);
        payload.put("max_tokens", config.getMaxTokens() == null ? 4096 : config.getMaxTokens());
        payload.put("temperature", 0.7);

        try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(config.getApiUrl()))
                    .header("Authorization", "Bearer " + config.getApiKeyCipher())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(50016, "api error status " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || !StringUtils.hasText(contentNode.asText())) {
                throw new BusinessException(50017, "api response has no message content");
            }
            return contentNode.asText();
        } catch (BusinessException ex) {
            throw ex;
        } catch (IOException | InterruptedException ex) {
            throw new BusinessException(50018, "ai request failed: " + ex.getMessage());
        }
    }

    private Map<String, String> message(String role, String content) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("role", role);
        map.put("content", content);
        return map;
    }

    private ApiConfig resolveImportApiConfig() {
        List<ApiConfig> configs = apiConfigMapper.selectList(new QueryWrapper<ApiConfig>().orderByAsc("id"));
        if (configs.isEmpty()) {
            throw new BusinessException(40015, "api config is not initialized");
        }

        ApiConfig selected = null;
        for (ApiConfig config : configs) {
            if (Boolean.FALSE.equals(config.getEnabled())) {
                continue;
            }
            if (StringUtils.hasText(config.getApiUrl()) && StringUtils.hasText(config.getApiKeyCipher())) {
                selected = config;
                break;
            }
        }
        if (selected == null) {
            selected = configs.get(0);
        }

        if (Boolean.FALSE.equals(selected.getEnabled())) {
            throw new BusinessException(40016, "selected api config is disabled");
        }
        if (!StringUtils.hasText(selected.getApiUrl())) {
            throw new BusinessException(40017, "api url is empty");
        }
        if (!StringUtils.hasText(selected.getApiKeyCipher())) {
            throw new BusinessException(40018, "api key is empty");
        }
        return selected;
    }

    private int resolveImportChunkSize() {
        List<ApiConfig> configs = apiConfigMapper.selectList(new QueryWrapper<ApiConfig>().orderByAsc("id"));
        if (configs.isEmpty() || configs.get(0).getChunkSize() == null) {
            return 1000;
        }
        return Math.max(200, configs.get(0).getChunkSize());
    }

    private int readIntSetting(String key, int defaultValue) {
        AppSetting setting = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (setting == null || !StringUtils.hasText(setting.getSettingValueJson())) {
            return defaultValue;
        }
        String raw = setting.getSettingValueJson();
        try {
            JsonNode node = objectMapper.readTree(raw);
            if (node.isNumber()) {
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

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new BusinessException(50019, "serialize json failed: " + ex.getMessage());
        }
    }

    private int readInsertedCount(String resultJson) {
        if (!StringUtils.hasText(resultJson)) {
            return 0;
        }
        try {
            JsonNode node = objectMapper.readTree(resultJson);
            if (node.has("insertedCount") && node.get("insertedCount").isNumber()) {
                return node.get("insertedCount").asInt();
            }
        } catch (Exception ignored) {
        }
        return 0;
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

    private List<String> splitContentIntoChunks(String content, int chunkSize) {
        if (!StringUtils.hasText(content)) {
            return Collections.emptyList();
        }
        String[] lines = content.split("\\r?\\n");
        List<String> questionBlocks = new ArrayList<>();
        List<String> currentBlock = new ArrayList<>();
        for (String line : lines) {
            if (isQuestionStartLine(line) && !currentBlock.isEmpty()) {
                questionBlocks.add(String.join("\n", currentBlock));
                currentBlock = new ArrayList<>();
            }
            currentBlock.add(line);
        }
        if (!currentBlock.isEmpty()) {
            questionBlocks.add(String.join("\n", currentBlock));
        }

        if (questionBlocks.size() <= 1 && content.length() > chunkSize) {
            questionBlocks = new ArrayList<>();
            currentBlock = new ArrayList<>();
            for (String line : lines) {
                if (!StringUtils.hasText(line) && !currentBlock.isEmpty()) {
                    questionBlocks.add(String.join("\n", currentBlock));
                    currentBlock = new ArrayList<>();
                } else {
                    currentBlock.add(line);
                }
            }
            if (!currentBlock.isEmpty()) {
                questionBlocks.add(String.join("\n", currentBlock));
            }
        }

        List<String> chunks = new ArrayList<>();
        List<String> currentChunk = new ArrayList<>();
        int currentSize = 0;
        for (String block : questionBlocks) {
            int blockSize = block.length();
            if (blockSize > chunkSize) {
                if (!currentChunk.isEmpty()) {
                    chunks.add(String.join("\n\n", currentChunk));
                    currentChunk = new ArrayList<>();
                    currentSize = 0;
                }
                chunks.add(block);
                continue;
            }

            if (currentSize + blockSize > chunkSize && !currentChunk.isEmpty()) {
                chunks.add(String.join("\n\n", currentChunk));
                currentChunk = new ArrayList<>();
                currentSize = 0;
            }
            currentChunk.add(block);
            currentSize += blockSize;
        }
        if (!currentChunk.isEmpty()) {
            chunks.add(String.join("\n\n", currentChunk));
        }
        if (chunks.isEmpty()) {
            chunks.add(content);
        }
        return chunks;
    }

    private boolean isQuestionStartLine(String line) {
        if (!StringUtils.hasText(line)) {
            return false;
        }
        String trimmed = line.trim();
        return trimmed.matches("^(单选题?|多选题?|判断题?|填空题?|简答题?)[：:．.、\\s].*")
                || trimmed.matches("^\\d+[．.、)\\s].*(单选|多选|判断|填空|简答).*");
    }

    private String normalizeAnswer(String answer) {
        return answer == null ? null : answer.replace("，", ",").replace(" ", "").trim();
    }
}
