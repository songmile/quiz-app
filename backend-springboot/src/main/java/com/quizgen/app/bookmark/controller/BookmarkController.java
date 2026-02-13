package com.quizgen.app.bookmark.controller;

import com.quizgen.app.bookmark.dto.BookmarkItemResponse;
import com.quizgen.app.bookmark.service.BookmarkService;
import com.quizgen.app.common.api.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping
    public ApiResponse<List<BookmarkItemResponse>> list() {
        return ApiResponse.ok(bookmarkService.list());
    }

    @GetMapping("/ids")
    public ApiResponse<List<String>> ids() {
        return ApiResponse.ok(bookmarkService.ids());
    }

    @PostMapping("/{questionId}")
    public ApiResponse<Void> add(@PathVariable("questionId") String questionId) {
        bookmarkService.add(questionId);
        return ApiResponse.okMessage("created");
    }

    @DeleteMapping("/{questionId}")
    public ApiResponse<Void> delete(@PathVariable("questionId") String questionId) {
        bookmarkService.remove(questionId);
        return ApiResponse.okMessage("deleted");
    }
}