package com.quizgen.app.review.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.review.service.ReviewService;
import com.quizgen.app.study.entity.ReviewCard;
import com.quizgen.app.study.mapper.ReviewCardMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewCardMapper reviewCardMapper;
    private final QuestionMapper questionMapper;
    private final QuestionBankMapper bankMapper;

    public ReviewServiceImpl(ReviewCardMapper reviewCardMapper, QuestionMapper questionMapper, QuestionBankMapper bankMapper) {
        this.reviewCardMapper = reviewCardMapper;
        this.questionMapper = questionMapper;
        this.bankMapper = bankMapper;
    }

    @Override
    @Transactional
    public void processReview(Long questionId, boolean isCorrect, String sessionType) {
        ReviewCard card = reviewCardMapper.selectOne(new LambdaQueryWrapper<ReviewCard>()
                .eq(ReviewCard::getQuestionId, questionId));
        if (card == null) {
            card = new ReviewCard();
            card.setQuestionId(questionId);
            card.setEaseFactor(new BigDecimal("2.50"));
            card.setIntervalDays(0);
            card.setRepetitions(0);
            card.setTotalReviews(0);
            card.setTotalCorrect(0);
            card.setNextReviewAt(LocalDateTime.now());
            reviewCardMapper.insert(card);
        }

        int quality = deriveQuality(isCorrect, sessionType);
        Sm2Result result = calculateSm2(card, quality);

        card.setEaseFactor(result.easeFactor);
        card.setIntervalDays(result.intervalDays);
        card.setRepetitions(result.repetitions);
        card.setNextReviewAt(LocalDateTime.now().plusDays(result.intervalDays));
        card.setLastReviewAt(LocalDateTime.now());
        card.setTotalReviews((card.getTotalReviews() == null ? 0 : card.getTotalReviews()) + 1);
        if (isCorrect) {
            card.setTotalCorrect((card.getTotalCorrect() == null ? 0 : card.getTotalCorrect()) + 1);
        }
        reviewCardMapper.updateById(card);
    }

    @Override
    public List<Map<String, Object>> getDueQuestions(String bankId, String tags, Integer limit) {
        int max = limit == null || limit < 1 ? 50 : limit;
        List<ReviewCard> cards = reviewCardMapper.selectList(new LambdaQueryWrapper<ReviewCard>()
                .le(ReviewCard::getNextReviewAt, LocalDateTime.now())
                .orderByAsc(ReviewCard::getNextReviewAt)
                .last("limit " + max));
        if (cards.isEmpty()) {
            return List.of();
        }
        List<Long> questionIds = cards.stream().map(ReviewCard::getQuestionId).toList();
        List<Question> questions = questionMapper.selectBatchIds(questionIds);

        if (StringUtils.hasText(bankId)) {
            QuestionBank bank = bankMapper.selectOne(new LambdaQueryWrapper<QuestionBank>().eq(QuestionBank::getBankCode, bankId));
            if (bank == null) {
                return List.of();
            }
            questions = questions.stream().filter(q -> Objects.equals(q.getBankId(), bank.getId())).toList();
        }
        // tags filter is reserved for next iteration.
        return questions.stream().map(this::toQuestionMap).toList();
    }

    @Override
    public long getDueCount() {
        return reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>()
                .le(ReviewCard::getNextReviewAt, LocalDateTime.now()));
    }

    @Override
    public Map<String, Object> getReviewStats() {
        long totalCards = reviewCardMapper.selectCount(null);
        long dueCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>()
                .le(ReviewCard::getNextReviewAt, LocalDateTime.now()));
        long masteredCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>().ge(ReviewCard::getRepetitions, 3));
        long learningCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>().gt(ReviewCard::getRepetitions, 0).lt(ReviewCard::getRepetitions, 3));
        long newCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>().eq(ReviewCard::getRepetitions, 0));

        Map<String, Object> data = new HashMap<>();
        data.put("totalCards", totalCards);
        data.put("dueCount", dueCount);
        data.put("masteredCount", masteredCount);
        data.put("learningCount", learningCount);
        data.put("newCount", newCount);
        return data;
    }

    private int deriveQuality(boolean isCorrect, String sessionType) {
        if (!isCorrect) {
            return 1;
        }
        if ("spaced_review".equalsIgnoreCase(sessionType)) {
            return 5;
        }
        return 4;
    }

    private Sm2Result calculateSm2(ReviewCard card, int quality) {
        BigDecimal ef = card.getEaseFactor() == null ? new BigDecimal("2.50") : card.getEaseFactor();
        int interval = card.getIntervalDays() == null ? 0 : card.getIntervalDays();
        int repetitions = card.getRepetitions() == null ? 0 : card.getRepetitions();

        if (quality >= 3) {
            if (repetitions == 0) {
                interval = 1;
            } else if (repetitions == 1) {
                interval = 6;
            } else {
                interval = BigDecimal.valueOf(interval).multiply(ef).setScale(0, RoundingMode.HALF_UP).intValue();
            }
            repetitions += 1;
        } else {
            repetitions = 0;
            interval = 1;
        }

        BigDecimal q = BigDecimal.valueOf(quality);
        BigDecimal fiveMinusQ = BigDecimal.valueOf(5).subtract(q);
        BigDecimal delta = BigDecimal.valueOf(0.1)
                .subtract(fiveMinusQ.multiply(BigDecimal.valueOf(0.08).add(fiveMinusQ.multiply(BigDecimal.valueOf(0.02)))));
        ef = ef.add(delta);
        if (ef.compareTo(BigDecimal.valueOf(1.3)) < 0) {
            ef = BigDecimal.valueOf(1.3);
        }
        ef = ef.setScale(2, RoundingMode.HALF_UP);
        return new Sm2Result(ef, interval, repetitions);
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

    private record Sm2Result(BigDecimal easeFactor, int intervalDays, int repetitions) {
    }
}

