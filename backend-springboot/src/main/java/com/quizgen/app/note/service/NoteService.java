package com.quizgen.app.note.service;

import com.quizgen.app.note.dto.NoteResponse;
import com.quizgen.app.note.dto.NoteUpsertRequest;

import java.util.List;

public interface NoteService {

    List<NoteResponse> list(int page, int limit, String search);

    long total(String search);

    List<NoteResponse> byQuestionCode(String questionCode);

    NoteResponse create(NoteUpsertRequest request);

    NoteResponse update(String id, NoteUpsertRequest request);

    void delete(String id);
}