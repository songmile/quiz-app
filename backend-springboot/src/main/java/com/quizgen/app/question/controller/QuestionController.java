package com.quizgen.app.question.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.question.dto.QuestionImportAiRequest;
import com.quizgen.app.question.dto.QuestionPageRequest;
import com.quizgen.app.question.dto.QuestionPageResponse;
import com.quizgen.app.question.dto.QuestionResponse;
import com.quizgen.app.question.dto.QuestionImportRequest;
import com.quizgen.app.question.dto.QuestionImportTextRequest;
import com.quizgen.app.question.dto.QuestionImportResultResponse;
import com.quizgen.app.question.dto.QuestionCleanResultResponse;
import com.quizgen.app.question.dto.QuestionBackupResponse;
import com.quizgen.app.question.dto.QuestionRestoreRequest;
import com.quizgen.app.question.dto.QuestionUpsertRequest;
import com.quizgen.app.question.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public ApiResponse<QuestionPageResponse> page(QuestionPageRequest request) {
        return ApiResponse.ok(questionService.page(request));
    }

    @GetMapping("/tags/all")
    public ApiResponse<List<String>> tags() {
        return ApiResponse.ok(questionService.allTags());
    }

    @GetMapping("/{id}")
    public ApiResponse<QuestionResponse> get(@PathVariable("id") String id) {
        return ApiResponse.ok(questionService.getByCode(id));
    }

    @PostMapping
    public ApiResponse<QuestionResponse> create(@Valid @RequestBody QuestionUpsertRequest request) {
        return ApiResponse.ok(questionService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<QuestionResponse> update(@PathVariable("id") String id, @Valid @RequestBody QuestionUpsertRequest request) {
        return ApiResponse.ok(questionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") String id) {
        questionService.delete(id);
        return ApiResponse.okMessage("deleted");
    }

    @PostMapping("/import")
    public ApiResponse<QuestionImportResultResponse> importQuestions(@Valid @RequestBody QuestionImportRequest request) {
        return ApiResponse.ok(questionService.importQuestions(request));
    }

    @PostMapping("/import/text")
    public ApiResponse<QuestionImportResultResponse> importText(@Valid @RequestBody QuestionImportTextRequest request) {
        return ApiResponse.ok(questionService.importText(request));
    }

    @PostMapping("/import/ai")
    public ApiResponse<Map<String, Object>> importWithAi(@Valid @RequestBody QuestionImportAiRequest request) {
        return ApiResponse.ok(questionService.importWithAi(request));
    }

    @GetMapping("/import/status/{importId}")
    public ApiResponse<Map<String, Object>> importStatus(@PathVariable("importId") String importId) {
        return ApiResponse.ok(questionService.getImportStatus(importId));
    }

    @PostMapping("/clean-duplicates")
    public ApiResponse<QuestionCleanResultResponse> cleanDuplicates() {
        return ApiResponse.ok(questionService.cleanDuplicates());
    }

    @PostMapping("/backup")
    public ApiResponse<QuestionBackupResponse> backup() {
        return ApiResponse.ok(questionService.backup());
    }

    @PostMapping("/restore")
    public ApiResponse<QuestionBackupResponse> restore(@Valid @RequestBody QuestionRestoreRequest request) {
        return ApiResponse.ok(questionService.restore(request.getBackupId()));
    }
}
