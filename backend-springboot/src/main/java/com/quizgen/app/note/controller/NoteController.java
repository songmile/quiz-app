package com.quizgen.app.note.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.note.dto.NoteResponse;
import com.quizgen.app.note.dto.NoteUpsertRequest;
import com.quizgen.app.note.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search
    ) {
        List<NoteResponse> notes = noteService.list(page, limit, search);
        long total = noteService.total(search);
        Map<String, Object> payload = new HashMap<>();
        payload.put("data", notes);
        payload.put("total", total);
        payload.put("page", page);
        payload.put("totalPages", (long) Math.ceil((double) total / limit));
        return ApiResponse.ok(payload);
    }

    @GetMapping("/question/{questionId}")
    public ApiResponse<List<NoteResponse>> byQuestion(@PathVariable("questionId") String questionId) {
        return ApiResponse.ok(noteService.byQuestionCode(questionId));
    }

    @PostMapping
    public ApiResponse<NoteResponse> create(@Valid @RequestBody NoteUpsertRequest request) {
        return ApiResponse.ok(noteService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<NoteResponse> update(@PathVariable("id") String id, @Valid @RequestBody NoteUpsertRequest request) {
        return ApiResponse.ok(noteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") String id) {
        noteService.delete(id);
        return ApiResponse.okMessage("deleted");
    }
}