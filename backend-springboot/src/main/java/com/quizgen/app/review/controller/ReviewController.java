package com.quizgen.app.review.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.quiz.service.QuizService;
import com.quizgen.app.review.service.ReviewService;
import com.quizgen.app.stats.service.StatsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final QuizService quizService;
    private final StatsService statsService;
    private final QuestionMapper questionMapper;

    public ReviewController(
            ReviewService reviewService,
            QuizService quizService,
            StatsService statsService,
            QuestionMapper questionMapper
    ) {
        this.reviewService = reviewService;
        this.quizService = quizService;
        this.statsService = statsService;
        this.questionMapper = questionMapper;
    }

    @GetMapping("/due")
    public ApiResponse<List<Map<String, Object>>> due(
            @RequestParam(required = false) String bankId,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Integer limit
    ) {
        return ApiResponse.ok(reviewService.getDueQuestions(bankId, tags, limit));
    }

    @GetMapping("/due-count")
    public ApiResponse<Map<String, Object>> dueCount() {
        return ApiResponse.ok(Map.of("dueCount", reviewService.getDueCount()));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.ok(reviewService.getReviewStats());
    }

    @PostMapping("/start")
    public ApiResponse<Map<String, Object>> start(@RequestBody(required = false) Map<String, Object> body) {
        String bankId = body == null ? null : Objects.toString(body.get("bankId"), null);
        String tags = body == null ? null : Objects.toString(body.get("tags"), null);
        List<Map<String, Object>> due = reviewService.getDueQuestions(bankId, tags, 200);
        List<Long> questionIds = due.stream()
                .map(item -> Objects.toString(item.get("id"), null))
                .filter(Objects::nonNull)
                .map(code -> questionMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Question>()
                        .eq(Question::getQuestionCode, code)))
                .filter(Objects::nonNull)
                .map(Question::getId)
                .toList();

        Map<String, Object> data = quizService.startByQuestionIds("spaced_review", questionIds);
        var session = statsService.startStudySession("spaced_review");
        Map<String, Object> result = new HashMap<>(data);
        result.put("sessionId", session.getId());
        return ApiResponse.ok(result);
    }
}

