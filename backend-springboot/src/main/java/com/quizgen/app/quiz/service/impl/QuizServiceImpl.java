package com.quizgen.app.quiz.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.quiz.dto.StartQuizRequest;
import com.quizgen.app.quiz.dto.SubmitAnswerRequest;
import com.quizgen.app.quiz.service.QuizService;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.review.service.ReviewService;
import com.quizgen.app.stats.service.StatsService;
import com.quizgen.app.streak.service.StreakService;
import com.quizgen.app.study.entity.UserAnswer;
import com.quizgen.app.study.mapper.UserAnswerMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuestionMapper questionMapper;
    private final QuestionBankMapper bankMapper;
    private final UserAnswerMapper userAnswerMapper;
    private final StatsService statsService;
    private final ReviewService reviewService;
    private final StreakService streakService;

    private final Map<String, List<Long>> sessions = new ConcurrentHashMap<>();

    public QuizServiceImpl(
            QuestionMapper questionMapper,
            QuestionBankMapper bankMapper,
            UserAnswerMapper userAnswerMapper,
            StatsService statsService,
            ReviewService reviewService,
            StreakService streakService
    ) {
        this.questionMapper = questionMapper;
        this.bankMapper = bankMapper;
        this.userAnswerMapper = userAnswerMapper;
        this.statsService = statsService;
        this.reviewService = reviewService;
        this.streakService = streakService;
    }

    @Override
    public Map<String, Object> startQuiz(StartQuizRequest request) {
        List<Question> questions = questionMapper.selectList(new QueryWrapper<>());
        if (request != null && StringUtils.hasText(request.getBankId())) {
            QuestionBank bank = bankMapper.selectOne(new LambdaQueryWrapper<QuestionBank>()
                    .eq(QuestionBank::getBankCode, request.getBankId()));
            if (bank == null) {
                questions = Collections.emptyList();
            } else {
                Long bankId = bank.getId();
                questions = questions.stream().filter(q -> Objects.equals(q.getBankId(), bankId)).toList();
            }
        }

        if (questions.isEmpty()) {
            throw new BusinessException(40011, "question bank is empty");
        }

        List<Long> ids = questions.stream().map(Question::getId).toList();
        Collections.shuffle(ids);
        sessions.put("normal", ids);
        var session = statsService.startStudySession("normal");

        Map<String, Object> data = new HashMap<>();
        data.put("message", "started");
        data.put("totalQuestions", ids.size());
        data.put("currentIndex", 0);
        data.put("sessionId", session.getId());
        return data;
    }

    @Override
    public Map<String, Object> startReview() {
        List<Long> wrongIds = statsService.getWrongQuestionIds();
        if (wrongIds.isEmpty()) {
            throw new BusinessException(40012, "no wrong questions");
        }
        Map<String, Object> data = startByQuestionIds("review", wrongIds);
        var session = statsService.startStudySession("review");
        data.put("sessionId", session.getId());
        return data;
    }

    @Override
    public Map<String, Object> startByQuestionIds(String mode, List<Long> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            throw new BusinessException(40013, "no questions to start");
        }
        List<Long> copy = new ArrayList<>(questionIds);
        Collections.shuffle(copy);
        sessions.put(normalizeMode(mode), copy);
        Map<String, Object> data = new HashMap<>();
        data.put("message", "started");
        data.put("totalQuestions", copy.size());
        data.put("currentIndex", 0);
        return data;
    }

    @Override
    public Map<String, Object> getCurrentQuestion(int index, String mode) {
        List<Question> questions = getSessionQuestions(mode);
        if (questions.isEmpty()) {
            throw new BusinessException(40410, "no active question session");
        }
        int currentIndex = Math.max(0, Math.min(index, questions.size() - 1));
        Question q = questions.get(currentIndex);
        UserAnswer latest = latestAnswer(q.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("currentIndex", currentIndex);
        data.put("totalQuestions", questions.size());
        data.put("data", toQuestionMap(q));
        if (latest == null) {
            data.put("userAnswer", null);
        } else {
            Map<String, Object> ua = new HashMap<>();
            ua.put("answer", latest.getUserAnswer());
            ua.put("isCorrect", latest.getIsCorrect());
            ua.put("answeredAt", latest.getAnsweredAt());
            data.put("userAnswer", ua);
        }
        return data;
    }

    @Override
    public Map<String, Object> nextQuestion(int currentIndex, String mode) {
        List<Question> questions = getSessionQuestions(mode);
        if (questions.isEmpty()) {
            throw new BusinessException(40410, "no active question session");
        }
        int next = currentIndex + 1;
        if (next >= questions.size()) {
            Map<String, Object> data = new HashMap<>();
            data.put("isLast", true);
            data.put("currentIndex", currentIndex);
            data.put("totalQuestions", questions.size());
            return data;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("isLast", false);
        data.put("currentIndex", next);
        data.put("totalQuestions", questions.size());
        data.put("data", toQuestionMap(questions.get(next)));
        return data;
    }

    @Override
    public Map<String, Object> previousQuestion(int currentIndex, String mode) {
        List<Question> questions = getSessionQuestions(mode);
        if (questions.isEmpty()) {
            throw new BusinessException(40410, "no active question session");
        }
        int prev = currentIndex - 1;
        if (prev < 0) {
            Map<String, Object> data = new HashMap<>();
            data.put("isFirst", true);
            data.put("currentIndex", currentIndex);
            data.put("totalQuestions", questions.size());
            return data;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("isFirst", false);
        data.put("currentIndex", prev);
        data.put("totalQuestions", questions.size());
        data.put("data", toQuestionMap(questions.get(prev)));
        return data;
    }

    @Override
    @Transactional
    public Map<String, Object> submitAnswer(SubmitAnswerRequest request) {
        Question q = findQuestion(request.getQuestionId());
        String mode = normalizeMode(request.getMode());
        boolean isCorrect = checkAnswer(q.getType(), q.getAnswer(), request.getUserAnswer());

        UserAnswer answer = new UserAnswer();
        answer.setQuestionId(q.getId());
        answer.setUserAnswer(request.getUserAnswer());
        answer.setIsCorrect(isCorrect);
        answer.setSessionType(mode);
        answer.setAnsweredAt(LocalDateTime.now());
        userAnswerMapper.insert(answer);

        statsService.recordAnswer(q.getId(), isCorrect);
        if (!isCorrect) {
            statsService.addWrongQuestion(q.getId());
        } else if ("review".equals(mode) || "spaced_review".equals(mode)) {
            statsService.removeWrongQuestion(q.getId());
        }
        reviewService.processReview(q.getId(), isCorrect, mode);
        streakService.recordActivity(isCorrect);

        Map<String, Object> row = new HashMap<>();
        row.put("questionId", q.getQuestionCode());
        row.put("isCorrect", isCorrect);
        row.put("correctAnswer", q.getAnswer());
        row.put("explanation", q.getExplanation());
        row.put("userAnswer", request.getUserAnswer());
        return row;
    }

    @Override
    public Map<String, Object> getUserAnswers(int page, int limit, String isCorrect, String sessionType) {
        int p = page < 1 ? 1 : page;
        int size = limit < 1 ? 100 : limit;
        LambdaQueryWrapper<UserAnswer> q = new LambdaQueryWrapper<UserAnswer>()
                .orderByDesc(UserAnswer::getAnsweredAt);
        if (StringUtils.hasText(isCorrect)) {
            q.eq(UserAnswer::getIsCorrect, Boolean.parseBoolean(isCorrect));
        }
        if (StringUtils.hasText(sessionType)) {
            q.eq(UserAnswer::getSessionType, sessionType);
        }

        Page<UserAnswer> result = userAnswerMapper.selectPage(new Page<>(p, size), q);
        List<Map<String, Object>> items = result.getRecords().stream().map(a -> {
            Question question = questionMapper.selectById(a.getQuestionId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("questionId", question == null ? null : question.getQuestionCode());
            row.put("userAnswer", a.getUserAnswer());
            row.put("isCorrect", a.getIsCorrect());
            row.put("sessionType", a.getSessionType());
            row.put("answeredAt", a.getAnsweredAt());
            return row;
        }).toList();

        Map<String, Object> data = new HashMap<>();
        data.put("count", items.size());
        data.put("total", result.getTotal());
        data.put("page", p);
        data.put("totalPages", (long) Math.ceil((double) result.getTotal() / size));
        data.put("data", items);
        return data;
    }

    @Override
    public List<Map<String, Object>> getQuestionAnswers(String questionCode) {
        Question question = findQuestion(questionCode);
        return userAnswerMapper.selectList(new LambdaQueryWrapper<UserAnswer>()
                        .eq(UserAnswer::getQuestionId, question.getId())
                        .orderByDesc(UserAnswer::getAnsweredAt))
                .stream()
                .map(a -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("questionId", questionCode);
                    row.put("userAnswer", a.getUserAnswer());
                    row.put("isCorrect", a.getIsCorrect());
                    row.put("sessionType", a.getSessionType());
                    row.put("answeredAt", a.getAnsweredAt());
                    return row;
                })
                .toList();
    }

    @Override
    public void resetQuiz() {
        statsService.endStudySession();
        sessions.clear();
    }

    @Override
    public List<Map<String, Object>> navigator(String filter, String type, String search) {
        LambdaQueryWrapper<Question> q = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(type) && !"all".equalsIgnoreCase(type)) {
            q.eq(Question::getType, type);
        }
        if (StringUtils.hasText(search)) {
            q.like(Question::getText, search);
        }
        List<Question> questions = questionMapper.selectList(q);
        Map<Long, UserAnswer> latest = latestAnswersMap();
        String f = filter == null ? "all" : filter;

        List<Map<String, Object>> rows = new ArrayList<>();
        int i = 0;
        for (Question question : questions) {
            UserAnswer ans = latest.get(question.getId());
            String status = ans == null ? "unanswered" : (Boolean.TRUE.equals(ans.getIsCorrect()) ? "correct" : "wrong");
            if (!"all".equalsIgnoreCase(f) && !Objects.equals(f, status)) {
                i++;
                continue;
            }
            Map<String, Object> row = new HashMap<>();
            row.put("id", question.getQuestionCode());
            row.put("index", i);
            row.put("type", question.getType());
            row.put("text", question.getText() == null ? "" : (question.getText().length() > 100 ? question.getText().substring(0, 100) + "..." : question.getText()));
            row.put("status", status);
            rows.add(row);
            i++;
        }
        return rows;
    }

    @Override
    public Map<String, Object> jumpToQuestion(int index, String mode) {
        Map<String, Object> data = getCurrentQuestion(index, mode);
        String view = "review".equalsIgnoreCase(mode) ? "review" : "quiz";
        statsService.updateViewHistory(view, index);
        return data;
    }

    private Question findQuestion(String code) {
        Question q = questionMapper.selectOne(new LambdaQueryWrapper<Question>()
                .eq(Question::getQuestionCode, code));
        if (q == null) {
            throw new BusinessException(40404, "question not found");
        }
        return q;
    }

    private UserAnswer latestAnswer(Long questionId) {
        return userAnswerMapper.selectOne(new LambdaQueryWrapper<UserAnswer>()
                .eq(UserAnswer::getQuestionId, questionId)
                .orderByDesc(UserAnswer::getAnsweredAt)
                .last("limit 1"));
    }

    private Map<Long, UserAnswer> latestAnswersMap() {
        List<UserAnswer> all = userAnswerMapper.selectList(new QueryWrapper<UserAnswer>().orderByDesc("answered_at"));
        Map<Long, UserAnswer> map = new HashMap<>();
        for (UserAnswer a : all) {
            map.putIfAbsent(a.getQuestionId(), a);
        }
        return map;
    }

    private List<Question> getSessionQuestions(String mode) {
        String key = normalizeMode(mode);
        List<Long> ids = sessions.get(key);
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<Question> questions = questionMapper.selectBatchIds(ids);
        Map<Long, Question> map = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));
        List<Question> ordered = new ArrayList<>();
        for (Long id : ids) {
            Question q = map.get(id);
            if (q != null) {
                ordered.add(q);
            }
        }
        return ordered;
    }

    private String normalizeMode(String mode) {
        if (mode == null || mode.isBlank()) {
            return "normal";
        }
        return mode.toLowerCase(Locale.ROOT);
    }

    private boolean checkAnswer(String type, String correctAnswer, String userAnswer) {
        if (correctAnswer == null || userAnswer == null) {
            return false;
        }
        String correct = correctAnswer.replaceAll("\\s+", "");
        String answer = userAnswer.replaceAll("\\s+", "");
        if ("多选题".equals(type) || correct.contains(",")) {
            String[] c = correct.toUpperCase(Locale.ROOT).split(",");
            String[] u = answer.toUpperCase(Locale.ROOT).split(",");
            java.util.Arrays.sort(c);
            java.util.Arrays.sort(u);
            return java.util.Arrays.equals(c, u);
        }
        return correct.equalsIgnoreCase(answer);
    }

    private Map<String, Object> toQuestionMap(Question q) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", q.getQuestionCode());
        row.put("type", q.getType());
        row.put("text", q.getText());
        row.put("answer", q.getAnswer());
        row.put("explanation", q.getExplanation());
        return row;
    }
}
