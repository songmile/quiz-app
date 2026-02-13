package com.quizgen.app.question.service;

import com.quizgen.app.question.dto.QuestionPageRequest;
import com.quizgen.app.question.dto.QuestionPageResponse;
import com.quizgen.app.question.dto.QuestionResponse;
import com.quizgen.app.question.dto.QuestionImportRequest;
import com.quizgen.app.question.dto.QuestionImportAiRequest;
import com.quizgen.app.question.dto.QuestionImportTextRequest;
import com.quizgen.app.question.dto.QuestionImportResultResponse;
import com.quizgen.app.question.dto.QuestionCleanResultResponse;
import com.quizgen.app.question.dto.QuestionBackupResponse;
import com.quizgen.app.question.dto.QuestionUpsertRequest;

import java.util.List;
import java.util.Map;

public interface QuestionService {

    QuestionPageResponse page(QuestionPageRequest request);

    QuestionResponse getByCode(String questionCode);

    QuestionResponse create(QuestionUpsertRequest request);

    QuestionResponse update(String questionCode, QuestionUpsertRequest request);

    void delete(String questionCode);

    List<String> allTags();

    QuestionImportResultResponse importQuestions(QuestionImportRequest request);

    QuestionImportResultResponse importText(QuestionImportTextRequest request);

    Map<String, Object> importWithAi(QuestionImportAiRequest request);

    Map<String, Object> getImportStatus(String importId);

    QuestionCleanResultResponse cleanDuplicates();

    QuestionBackupResponse backup();

    QuestionBackupResponse restore(String backupId);
}
