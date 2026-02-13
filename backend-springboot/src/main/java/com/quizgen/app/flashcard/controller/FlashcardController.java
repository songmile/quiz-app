package com.quizgen.app.flashcard.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.flashcard.service.FlashcardService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping("/start")
    public ApiResponse<Map<String, Object>> start(@RequestBody(required = false) Map<String, Object> body) {
        String source = body == null ? null : Objects.toString(body.get("source"), null);
        String bankId = body == null ? null : Objects.toString(body.get("bankId"), null);
        Integer limit = null;
        if (body != null && body.get("limit") != null) {
            limit = Integer.parseInt(Objects.toString(body.get("limit")));
        }
        return ApiResponse.ok(flashcardService.startSession(source, bankId, limit));
    }

    @PostMapping("/rate")
    public ApiResponse<Map<String, Object>> rate(@RequestBody Map<String, Object> body) {
        String questionId = Objects.toString(body.get("questionId"), "");
        String rating = Objects.toString(body.get("rating"), "good");
        return ApiResponse.ok(flashcardService.rateCard(questionId, rating));
    }

    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> info() {
        return ApiResponse.ok(flashcardService.info());
    }
}

