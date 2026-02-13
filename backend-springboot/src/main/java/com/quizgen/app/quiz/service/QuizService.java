package com.quizgen.app.quiz.service;

import com.quizgen.app.quiz.dto.StartQuizRequest;
import com.quizgen.app.quiz.dto.SubmitAnswerRequest;

import java.util.List;
import java.util.Map;

public interface QuizService {

    Map<String, Object> startQuiz(StartQuizRequest request);

    Map<String, Object> startReview();

    Map<String, Object> startByQuestionIds(String mode, List<Long> questionIds);

    Map<String, Object> getCurrentQuestion(int index, String mode);

    Map<String, Object> nextQuestion(int currentIndex, String mode);

    Map<String, Object> previousQuestion(int currentIndex, String mode);

    Map<String, Object> submitAnswer(SubmitAnswerRequest request);

    Map<String, Object> getUserAnswers(int page, int limit, String isCorrect, String sessionType);

    List<Map<String, Object>> getQuestionAnswers(String questionCode);

    void resetQuiz();

    List<Map<String, Object>> navigator(String filter, String type, String search);

    Map<String, Object> jumpToQuestion(int index, String mode);
}

