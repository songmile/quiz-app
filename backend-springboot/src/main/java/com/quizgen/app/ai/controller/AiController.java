package com.quizgen.app.ai.controller;

import com.quizgen.app.ai.dto.ErrorAnalysisRequest;
import com.quizgen.app.ai.dto.TestConnectionRequest;
import com.quizgen.app.ai.service.AiService;
import com.quizgen.app.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/explanation/{questionId}")
    public ApiResponse<Map<String, Object>> generateExplanation(
            @PathVariable("questionId") String questionId,
            @RequestParam(value = "force", required = false) Boolean force
    ) {
        return ApiResponse.ok(aiService.generateExplanation(questionId, Boolean.TRUE.equals(force)));
    }

    @GetMapping("/explanation/{questionId}")
    public ApiResponse<Map<String, Object>> getExplanation(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(aiService.getExplanation(questionId));
    }

    @PostMapping("/error-analysis/{questionId}")
    public ApiResponse<Map<String, Object>> generateErrorAnalysis(
            @PathVariable("questionId") String questionId,
            @Valid @RequestBody ErrorAnalysisRequest request,
            @RequestParam(value = "force", required = false) Boolean force
    ) {
        return ApiResponse.ok(aiService.generateErrorAnalysis(questionId, request.getUserAnswer(), Boolean.TRUE.equals(force)));
    }

    @GetMapping("/error-analysis/{questionId}")
    public ApiResponse<Map<String, Object>> getErrorAnalysis(
            @PathVariable("questionId") String questionId,
            @RequestParam(value = "userAnswer", required = false) String userAnswer
    ) {
        return ApiResponse.ok(aiService.getErrorAnalysis(questionId, userAnswer));
    }

    @PostMapping("/variant/{questionId}")
    public ApiResponse<Map<String, Object>> generateVariant(
            @PathVariable("questionId") String questionId,
            @RequestParam(value = "force", required = false) Boolean force
    ) {
        return ApiResponse.ok(aiService.generateVariant(questionId, Boolean.TRUE.equals(force)));
    }

    @GetMapping("/variant/{questionId}")
    public ApiResponse<Map<String, Object>> getVariant(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(aiService.getVariant(questionId));
    }

    @PostMapping("/variant/{questionId}/add")
    public ApiResponse<Map<String, Object>> addVariantToQuestions(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(aiService.addVariantToQuestions(questionId));
    }

    @PostMapping("/knowledge-tree/{questionId}")
    public ApiResponse<Map<String, Object>> generateKnowledgeTree(
            @PathVariable("questionId") String questionId,
            @RequestParam(value = "force", required = false) Boolean force
    ) {
        return ApiResponse.ok(aiService.generateKnowledgeTree(questionId, Boolean.TRUE.equals(force)));
    }

    @GetMapping("/knowledge-tree/{questionId}")
    public ApiResponse<Map<String, Object>> getKnowledgeTree(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(aiService.getKnowledgeTree(questionId));
    }

    @PostMapping("/design-process/{questionId}")
    public ApiResponse<Map<String, Object>> generateDesignProcess(
            @PathVariable("questionId") String questionId,
            @RequestParam(value = "force", required = false) Boolean force
    ) {
        return ApiResponse.ok(aiService.generateDesignProcess(questionId, Boolean.TRUE.equals(force)));
    }

    @GetMapping("/design-process/{questionId}")
    public ApiResponse<Map<String, Object>> getDesignProcess(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(aiService.getDesignProcess(questionId));
    }

    @PostMapping("/test-connection")
    public ApiResponse<Map<String, Object>> testConnection(@RequestBody(required = false) TestConnectionRequest request) {
        Integer index = request == null ? 0 : request.getApiIndex();
        return ApiResponse.ok(aiService.testConnection(index));
    }

    @DeleteMapping("/explanations")
    public ApiResponse<Map<String, Object>> clearExplanations() {
        int count = aiService.clearExplanations();
        return ApiResponse.ok(Map.of("count", count));
    }

    @DeleteMapping("/error-analyses")
    public ApiResponse<Map<String, Object>> clearErrorAnalyses() {
        int count = aiService.clearErrorAnalyses();
        return ApiResponse.ok(Map.of("count", count));
    }

    @DeleteMapping("/variants")
    public ApiResponse<Map<String, Object>> clearVariants() {
        int count = aiService.clearVariants();
        return ApiResponse.ok(Map.of("count", count));
    }
}
