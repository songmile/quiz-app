package com.quizgen.app.stats.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.stats.dto.SessionRequest;
import com.quizgen.app.stats.dto.ViewHistoryRequest;
import com.quizgen.app.stats.service.StatsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.ok(statsService.getStatsRaw());
    }

    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.ok(statsService.getOverview());
    }

    @GetMapping("/categories")
    public ApiResponse<Map<String, Object>> categories() {
        return ApiResponse.ok(statsService.getCategoryStats());
    }

    @GetMapping("/wrong-questions")
    public ApiResponse<Map<String, Object>> wrongQuestions() {
        return ApiResponse.ok(statsService.getWrongQuestions());
    }

    @GetMapping("/sessions")
    public ApiResponse<List<Map<String, Object>>> sessions() {
        return ApiResponse.ok(statsService.getSessions());
    }

    @GetMapping("/trends")
    public ApiResponse<Map<String, Object>> trends() {
        return ApiResponse.ok(statsService.getTrends());
    }

    @PostMapping("/sessions/start")
    public ApiResponse<Map<String, Object>> start(@RequestBody(required = false) SessionRequest request) {
        String mode = request == null ? "normal" : request.getMode();
        var session = statsService.startStudySession(mode);
        return ApiResponse.ok(Map.of("session", session, "message", "started"));
    }

    @PostMapping("/sessions/end")
    public ApiResponse<Map<String, Object>> end() {
        long duration = statsService.endStudySession();
        return ApiResponse.ok(Map.of("durationMinutes", duration, "message", "ended"));
    }

    @PostMapping("/reset")
    public ApiResponse<Void> reset() {
        statsService.resetStats();
        return ApiResponse.okMessage("reset");
    }

    @GetMapping("/advisor")
    public ApiResponse<Map<String, Object>> advisor() {
        return ApiResponse.ok(statsService.getAdvisorSuggestions());
    }

    @PostMapping("/view-history")
    public ApiResponse<Void> viewHistory(@RequestBody ViewHistoryRequest request) {
        statsService.updateViewHistory(request.getView(), request.getCurrentIndex() == null ? 0 : request.getCurrentIndex());
        return ApiResponse.okMessage("updated");
    }

    @GetMapping("/timeline")
    public ApiResponse<Map<String, Object>> timeline(
            @RequestParam(defaultValue = "daily") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category
    ) {
        return ApiResponse.ok(statsService.getTimeline(period, startDate, endDate, category));
    }

    @GetMapping("/bank-progress")
    public ApiResponse<List<Map<String, Object>>> bankProgress() {
        return ApiResponse.ok(statsService.getBankProgress());
    }

    @GetMapping("/tag-progress")
    public ApiResponse<List<Map<String, Object>>> tagProgress() {
        return ApiResponse.ok(statsService.getTagProgress());
    }

    @GetMapping("/mastery")
    public ApiResponse<Map<String, Object>> mastery() {
        return ApiResponse.ok(statsService.getMasteryOverview());
    }
}

