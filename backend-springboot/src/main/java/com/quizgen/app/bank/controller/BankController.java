package com.quizgen.app.bank.controller;

import com.quizgen.app.bank.dto.BankResponse;
import com.quizgen.app.bank.dto.BankUpsertRequest;
import com.quizgen.app.bank.service.BankService;
import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.question.dto.QuestionPageRequest;
import com.quizgen.app.question.dto.QuestionPageResponse;
import com.quizgen.app.question.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
public class BankController {

    private final BankService bankService;
    private final QuestionService questionService;

    public BankController(BankService bankService, QuestionService questionService) {
        this.bankService = bankService;
        this.questionService = questionService;
    }

    @GetMapping
    public ApiResponse<List<BankResponse>> list() {
        return ApiResponse.ok(bankService.list());
    }

    @PostMapping
    public ApiResponse<BankResponse> create(@Valid @RequestBody BankUpsertRequest request) {
        return ApiResponse.ok(bankService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<BankResponse> update(@PathVariable("id") String id, @Valid @RequestBody BankUpsertRequest request) {
        return ApiResponse.ok(bankService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") String id) {
        bankService.delete(id);
        return ApiResponse.okMessage("deleted");
    }

    @GetMapping("/{id}/questions")
    public ApiResponse<QuestionPageResponse> bankQuestions(@PathVariable("id") String id, QuestionPageRequest request) {
        request.setBankId(id);
        return ApiResponse.ok(questionService.page(request));
    }
}