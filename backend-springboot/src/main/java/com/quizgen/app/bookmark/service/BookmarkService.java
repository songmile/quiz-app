package com.quizgen.app.bookmark.service;

import com.quizgen.app.bookmark.dto.BookmarkItemResponse;

import java.util.List;

public interface BookmarkService {

    List<BookmarkItemResponse> list();

    List<String> ids();

    void add(String questionCode);

    void remove(String questionCode);
}