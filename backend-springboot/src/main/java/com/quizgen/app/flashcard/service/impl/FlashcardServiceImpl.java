package com.quizgen.app.flashcard.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.bookmark.entity.Bookmark;
import com.quizgen.app.bookmark.mapper.BookmarkMapper;
import com.quizgen.app.flashcard.service.FlashcardService;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.review.service.ReviewService;
import com.quizgen.app.stats.service.StatsService;
import com.quizgen.app.study.entity.UserAnswer;
import com.quizgen.app.study.mapper.UserAnswerMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class FlashcardServiceImpl implements FlashcardService {

    private final QuestionMapper questionMapper;
    private final QuestionBankMapper bankMapper;
    private final BookmarkMapper bookmarkMapper;
    private final UserAnswerMapper userAnswerMapper;
    private final ReviewService reviewService;
    private final StatsService statsService;

    private final List<Long> currentCards = new CopyOnWriteArrayList<>();
    private volatile LocalDateTime createdAt;

    public FlashcardServiceImpl(
            QuestionMapper questionMapper,
            QuestionBankMapper bankMapper,
            BookmarkMapper bookmarkMapper,
            UserAnswerMapper userAnswerMapper,
            ReviewService reviewService,
            StatsService statsService
    ) {
        this.questionMapper = questionMapper;
        this.bankMapper = bankMapper;
        this.bookmarkMapper = bookmarkMapper;
        this.userAnswerMapper = userAnswerMapper;
        this.reviewService = reviewService;
        this.statsService = statsService;
    }

    @Override
    public Map<String, Object> startSession(String source, String bankId, Integer limit) {
        List<Question> questions = loadQuestions(source, bankId);
        Collections.shuffle(questions);
        int max = limit == null || limit < 1 ? questions.size() : Math.min(limit, questions.size());
        List<Question> selected = questions.subList(0, max);

        currentCards.clear();
        currentCards.addAll(selected.stream().map(Question::getId).toList());
        createdAt = LocalDateTime.now();

        List<Map<String, Object>> cards = selected.stream().map(this::toQuestionMap).toList();
        Map<String, Object> data = new HashMap<>();
        data.put("totalCards", cards.size());
        data.put("cards", cards);
        return data;
    }

    @Override
    public Map<String, Object> rateCard(String questionId, String rating) {
        Question question = questionMapper.selectOne(new LambdaQueryWrapper<Question>()
                .eq(Question::getQuestionCode, questionId));
        if (question == null) {
            throw new IllegalArgumentException("question not found");
        }

        int quality = switch (Objects.toString(rating, "good").toLowerCase()) {
            case "again" -> 1;
            case "hard" -> 2;
            case "easy" -> 5;
            default -> 4;
        };
        boolean isCorrect = quality >= 3;

        UserAnswer answer = new UserAnswer();
        answer.setQuestionId(question.getId());
        answer.setUserAnswer("flashcard_" + rating);
        answer.setIsCorrect(isCorrect);
        answer.setSessionType("flashcard");
        answer.setAnsweredAt(LocalDateTime.now());
        userAnswerMapper.insert(answer);

        statsService.recordAnswer(question.getId(), isCorrect);
        if (!isCorrect) {
            statsService.addWrongQuestion(question.getId());
        }
        reviewService.processReview(question.getId(), isCorrect, "flashcard");

        Map<String, Object> data = new HashMap<>();
        data.put("questionId", questionId);
        data.put("rating", rating);
        data.put("quality", quality);
        return data;
    }

    @Override
    public Map<String, Object> info() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalCards", currentCards.size());
        data.put("createdAt", createdAt);
        return data;
    }

    private List<Question> loadQuestions(String source, String bankId) {
        String s = StringUtils.hasText(source) ? source : "all";
        if ("bookmark".equalsIgnoreCase(s)) {
            List<Long> ids = bookmarkMapper.selectList(null).stream().map(Bookmark::getQuestionId).toList();
            return ids.isEmpty() ? List.of() : questionMapper.selectBatchIds(ids);
        }
        if ("wrong".equalsIgnoreCase(s)) {
            List<Long> ids = statsService.getWrongQuestionIds();
            return ids.isEmpty() ? List.of() : questionMapper.selectBatchIds(ids);
        }
        if ("bank".equalsIgnoreCase(s) && StringUtils.hasText(bankId)) {
            QuestionBank bank = bankMapper.selectOne(new LambdaQueryWrapper<QuestionBank>().eq(QuestionBank::getBankCode, bankId));
            if (bank == null) {
                return List.of();
            }
            return questionMapper.selectList(new LambdaQueryWrapper<Question>().eq(Question::getBankId, bank.getId()));
        }
        return questionMapper.selectList(null);
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

