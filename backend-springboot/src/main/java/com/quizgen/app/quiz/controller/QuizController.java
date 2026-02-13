package com.quizgen.app.quiz.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.quiz.dto.JumpRequest;
import com.quizgen.app.quiz.dto.StartQuizRequest;
import com.quizgen.app.quiz.dto.SubmitAnswerRequest;
import com.quizgen.app.quiz.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/start")
    public ApiResponse<Map<String, Object>> start(@RequestBody(required = false) StartQuizRequest request) {
        return ApiResponse.ok(quizService.startQuiz(request));
    }

    @PostMapping("/review")
    public ApiResponse<Map<String, Object>> review() {
        return ApiResponse.ok(quizService.startReview());
    }

    @GetMapping("/current")
    public ApiResponse<Map<String, Object>> current(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "normal") String mode
    ) {
        return ApiResponse.ok(quizService.getCurrentQuestion(index, mode));
    }

    @PostMapping("/submit")
    public ApiResponse<Map<String, Object>> submit(@Valid @RequestBody SubmitAnswerRequest request) {
        return ApiResponse.ok(quizService.submitAnswer(request));
    }

    @GetMapping("/next")
    public ApiResponse<Map<String, Object>> next(
            @RequestParam int currentIndex,
            @RequestParam(defaultValue = "normal") String mode
    ) {
        return ApiResponse.ok(quizService.nextQuestion(currentIndex, mode));
    }

    @GetMapping("/previous")
    public ApiResponse<Map<String, Object>> previous(
            @RequestParam int currentIndex,
            @RequestParam(defaultValue = "normal") String mode
    ) {
        return ApiResponse.ok(quizService.previousQuestion(currentIndex, mode));
    }

    @GetMapping("/answers")
    public ApiResponse<Map<String, Object>> answers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String isCorrect,
            @RequestParam(required = false) String sessionType
    ) {
        return ApiResponse.ok(quizService.getUserAnswers(page, limit, isCorrect, sessionType));
    }

    @GetMapping("/answers/{questionId}")
    public ApiResponse<List<Map<String, Object>>> questionAnswers(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(quizService.getQuestionAnswers(questionId));
    }

    @PostMapping("/reset")
    public ApiResponse<Void> reset() {
        quizService.resetQuiz();
        return ApiResponse.okMessage("reset");
    }

    @GetMapping("/navigator")
    public ApiResponse<List<Map<String, Object>>> navigator(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "") String search
    ) {
        return ApiResponse.ok(quizService.navigator(filter, type, search));
    }

    @PostMapping("/jump/{index}")
    public ApiResponse<Map<String, Object>> jump(@PathVariable("index") int index, @RequestBody(required = false) JumpRequest request) {
        String mode = request == null ? "normal" : request.getMode();
        return ApiResponse.ok(quizService.jumpToQuestion(index, mode));
    }
}

