package com.quizgen.app.streak.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.streak.service.StreakService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/streak")
public class StreakController {

    private final StreakService streakService;

    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> get() {
        return ApiResponse.ok(streakService.getStreakData());
    }

    @PatchMapping("/goal")
    public ApiResponse<Map<String, Object>> goal(@RequestBody Map<String, Object> body) {
        int goal = Integer.parseInt(Objects.toString(body.getOrDefault("dailyGoal", "10")));
        streakService.updateDailyGoal(goal);
        return ApiResponse.ok(Map.of("dailyGoal", goal));
    }
}

