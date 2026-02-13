package com.quizgen.app.stats.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.entity.QuestionTag;
import com.quizgen.app.question.entity.QuestionTagRel;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.question.mapper.QuestionTagMapper;
import com.quizgen.app.question.mapper.QuestionTagRelMapper;
import com.quizgen.app.stats.service.StatsService;
import com.quizgen.app.study.entity.ReviewCard;
import com.quizgen.app.study.entity.StatisticsSnapshot;
import com.quizgen.app.study.entity.StudySession;
import com.quizgen.app.study.entity.UserAnswer;
import com.quizgen.app.study.entity.ViewHistory;
import com.quizgen.app.study.entity.WrongQuestion;
import com.quizgen.app.study.mapper.ReviewCardMapper;
import com.quizgen.app.study.mapper.StatisticsSnapshotMapper;
import com.quizgen.app.study.mapper.StudySessionMapper;
import com.quizgen.app.study.mapper.UserAnswerMapper;
import com.quizgen.app.study.mapper.ViewHistoryMapper;
import com.quizgen.app.study.mapper.WrongQuestionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StatsServiceImpl implements StatsService {

    private final StatisticsSnapshotMapper snapshotMapper;
    private final StudySessionMapper sessionMapper;
    private final WrongQuestionMapper wrongQuestionMapper;
    private final ViewHistoryMapper viewHistoryMapper;
    private final QuestionMapper questionMapper;
    private final UserAnswerMapper userAnswerMapper;
    private final ReviewCardMapper reviewCardMapper;
    private final QuestionBankMapper bankMapper;
    private final QuestionTagMapper tagMapper;
    private final QuestionTagRelMapper tagRelMapper;

    public StatsServiceImpl(
            StatisticsSnapshotMapper snapshotMapper,
            StudySessionMapper sessionMapper,
            WrongQuestionMapper wrongQuestionMapper,
            ViewHistoryMapper viewHistoryMapper,
            QuestionMapper questionMapper,
            UserAnswerMapper userAnswerMapper,
            ReviewCardMapper reviewCardMapper,
            QuestionBankMapper bankMapper,
            QuestionTagMapper tagMapper,
            QuestionTagRelMapper tagRelMapper
    ) {
        this.snapshotMapper = snapshotMapper;
        this.sessionMapper = sessionMapper;
        this.wrongQuestionMapper = wrongQuestionMapper;
        this.viewHistoryMapper = viewHistoryMapper;
        this.questionMapper = questionMapper;
        this.userAnswerMapper = userAnswerMapper;
        this.reviewCardMapper = reviewCardMapper;
        this.bankMapper = bankMapper;
        this.tagMapper = tagMapper;
        this.tagRelMapper = tagRelMapper;
    }

    @Override
    @Transactional
    public StudySession startStudySession(String mode) {
        StudySession session = new StudySession();
        session.setMode(mode == null || mode.isBlank() ? "normal" : mode);
        session.setStartedAt(LocalDateTime.now());
        session.setQuestionsAnswered(0);
        session.setCorrectAnswers(0);
        session.setCreatedAt(LocalDateTime.now());
        sessionMapper.insert(session);
        return session;
    }

    @Override
    @Transactional
    public long endStudySession() {
        StudySession session = sessionMapper.selectOne(new QueryWrapper<StudySession>()
                .isNull("ended_at")
                .orderByDesc("started_at")
                .last("limit 1"));
        if (session == null) {
            return 0L;
        }
        LocalDateTime endedAt = LocalDateTime.now();
        session.setEndedAt(endedAt);
        sessionMapper.updateById(session);

        long duration = Math.max(0L, Duration.between(session.getStartedAt(), endedAt).toMinutes());
        StatisticsSnapshot snapshot = ensureSnapshot();
        snapshot.setStudyMinutes((snapshot.getStudyMinutes() == null ? 0 : snapshot.getStudyMinutes()) + (int) duration);
        snapshot.setUpdatedAt(LocalDateTime.now());
        snapshotMapper.updateById(snapshot);
        return duration;
    }

    @Override
    @Transactional
    public void recordAnswer(Long questionId, boolean isCorrect) {
        StatisticsSnapshot snapshot = ensureSnapshot();
        snapshot.setTotalAnswered((snapshot.getTotalAnswered() == null ? 0 : snapshot.getTotalAnswered()) + 1);
        if (isCorrect) {
            snapshot.setTotalCorrect((snapshot.getTotalCorrect() == null ? 0 : snapshot.getTotalCorrect()) + 1);
        }
        snapshot.setWrongQuestionCount(wrongQuestionMapper.selectCount(null).intValue());
        snapshot.setUpdatedAt(LocalDateTime.now());
        snapshotMapper.updateById(snapshot);

        StudySession session = sessionMapper.selectOne(new QueryWrapper<StudySession>()
                .isNull("ended_at")
                .orderByDesc("started_at")
                .last("limit 1"));
        if (session != null) {
            session.setQuestionsAnswered((session.getQuestionsAnswered() == null ? 0 : session.getQuestionsAnswered()) + 1);
            if (isCorrect) {
                session.setCorrectAnswers((session.getCorrectAnswers() == null ? 0 : session.getCorrectAnswers()) + 1);
            }
            sessionMapper.updateById(session);
        }
    }

    @Override
    @Transactional
    public void addWrongQuestion(Long questionId) {
        WrongQuestion exists = wrongQuestionMapper.selectOne(new LambdaQueryWrapper<WrongQuestion>()
                .eq(WrongQuestion::getQuestionId, questionId));
        if (exists == null) {
            WrongQuestion wrong = new WrongQuestion();
            wrong.setQuestionId(questionId);
            wrong.setFirstWrongAt(LocalDateTime.now());
            wrong.setLastWrongAt(LocalDateTime.now());
            wrongQuestionMapper.insert(wrong);
        } else {
            exists.setLastWrongAt(LocalDateTime.now());
            wrongQuestionMapper.updateById(exists);
        }
        refreshWrongCount();
    }

    @Override
    @Transactional
    public void removeWrongQuestion(Long questionId) {
        wrongQuestionMapper.delete(new LambdaQueryWrapper<WrongQuestion>().eq(WrongQuestion::getQuestionId, questionId));
        refreshWrongCount();
    }

    @Override
    public List<Long> getWrongQuestionIds() {
        return wrongQuestionMapper.selectList(null).stream().map(WrongQuestion::getQuestionId).toList();
    }

    @Override
    @Transactional
    public void updateViewHistory(String view, int currentIndex) {
        ViewHistory history = viewHistoryMapper.selectOne(new LambdaQueryWrapper<ViewHistory>()
                .eq(ViewHistory::getViewKey, view));
        if (history == null) {
            history = new ViewHistory();
            history.setViewKey(view);
            history.setCurrentIndex(currentIndex);
            history.setUpdatedAt(LocalDateTime.now());
            viewHistoryMapper.insert(history);
            return;
        }
        history.setCurrentIndex(currentIndex);
        history.setUpdatedAt(LocalDateTime.now());
        viewHistoryMapper.updateById(history);
    }

    @Override
    public Map<String, Object> getStatsRaw() {
        StatisticsSnapshot snapshot = ensureSnapshot();
        Map<String, Object> data = new HashMap<>();
        data.put("total_answered", snapshot.getTotalAnswered());
        data.put("correct", snapshot.getTotalCorrect());
        data.put("study_time", snapshot.getStudyMinutes());
        data.put("wrong_questions", getWrongQuestionCodes());
        data.put("lastUpdated", snapshot.getUpdatedAt());
        return data;
    }

    @Override
    public Map<String, Object> getOverview() {
        StatisticsSnapshot snapshot = ensureSnapshot();
        long totalQuestions = questionMapper.selectCount(null);
        int totalAnswered = nullSafe(snapshot.getTotalAnswered());
        int correct = nullSafe(snapshot.getTotalCorrect());
        int studyMinutes = nullSafe(snapshot.getStudyMinutes());
        int wrongCount = wrongQuestionMapper.selectCount(null).intValue();

        double correctRate = totalAnswered == 0 ? 0D : (correct * 100D / totalAnswered);
        double completionRate = totalQuestions == 0 ? 0D : (totalAnswered * 100D / totalQuestions);

        Map<String, Object> study = new HashMap<>();
        study.put("total", studyMinutes);
        study.put("hours", studyMinutes / 60);
        study.put("minutes", studyMinutes % 60);
        study.put("formatted", (studyMinutes / 60) + "小时" + (studyMinutes % 60) + "分钟");

        Map<String, Object> data = new HashMap<>();
        data.put("totalQuestions", totalQuestions);
        data.put("totalAnswered", totalAnswered);
        data.put("correct", correct);
        data.put("correctRate", String.format(Locale.US, "%.1f", correctRate));
        data.put("completionRate", String.format(Locale.US, "%.1f", completionRate));
        data.put("wrongQuestionCount", wrongCount);
        data.put("studyTime", study);
        data.put("lastUpdated", snapshot.getUpdatedAt());
        return data;
    }

    @Override
    public Map<String, Object> getCategoryStats() {
        Map<Long, Question> questionMap = questionMapper.selectList(null).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));
        Map<String, Long> totalByType = questionMap.values().stream()
                .collect(Collectors.groupingBy(Question::getType, Collectors.counting()));

        Map<String, Integer> answeredByType = new HashMap<>();
        Map<String, Integer> correctByType = new HashMap<>();
        for (UserAnswer answer : userAnswerMapper.selectList(null)) {
            Question q = questionMap.get(answer.getQuestionId());
            if (q == null) {
                continue;
            }
            String type = q.getType();
            answeredByType.put(type, answeredByType.getOrDefault(type, 0) + 1);
            if (Boolean.TRUE.equals(answer.getIsCorrect())) {
                correctByType.put(type, correctByType.getOrDefault(type, 0) + 1);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, Long> entry : totalByType.entrySet()) {
            String type = entry.getKey();
            int answered = answeredByType.getOrDefault(type, 0);
            int correct = correctByType.getOrDefault(type, 0);
            Map<String, Object> item = new HashMap<>();
            item.put("total", entry.getValue());
            item.put("answered", answered);
            item.put("correct", correct);
            item.put("correctRate", answered == 0 ? "0.0" : String.format(Locale.US, "%.1f", correct * 100D / answered));
            result.put(type, item);
        }
        return result;
    }

    @Override
    public Map<String, Object> getWrongQuestions() {
        List<WrongQuestion> wrongs = wrongQuestionMapper.selectList(null);
        Set<Long> ids = wrongs.stream().map(WrongQuestion::getQuestionId).collect(Collectors.toSet());
        List<Question> questions = ids.isEmpty() ? Collections.emptyList() : questionMapper.selectBatchIds(ids);
        Map<Long, Question> map = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        Map<String, Integer> wrongTypes = new HashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();
        for (WrongQuestion w : wrongs) {
            Question q = map.get(w.getQuestionId());
            if (q == null) {
                continue;
            }
            wrongTypes.put(q.getType(), wrongTypes.getOrDefault(q.getType(), 0) + 1);
            Map<String, Object> row = new HashMap<>();
            row.put("id", q.getQuestionCode());
            row.put("type", q.getType());
            row.put("text", q.getText() == null ? "" : (q.getText().length() > 100 ? q.getText().substring(0, 100) + "..." : q.getText()));
            items.add(row);
        }

        long totalQuestions = questionMapper.selectCount(null);
        Map<String, Object> data = new HashMap<>();
        data.put("count", items.size());
        data.put("wrongRate", totalQuestions == 0 ? "0.0" : String.format(Locale.US, "%.1f", items.size() * 100D / totalQuestions));
        data.put("wrongTypes", wrongTypes);
        data.put("wrongIds", items.stream().map(i -> i.get("id")).toList());
        data.put("questions", items);
        return data;
    }

    @Override
    public List<Map<String, Object>> getSessions() {
        List<StudySession> sessions = sessionMapper.selectList(new QueryWrapper<StudySession>().orderByDesc("started_at"));
        return sessions.stream().map(s -> {
            Map<String, Object> row = new HashMap<>();
            row.put("id", s.getId());
            row.put("mode", s.getMode());
            row.put("start_time", s.getStartedAt());
            row.put("end_time", s.getEndedAt());
            row.put("questions_answered", nullSafe(s.getQuestionsAnswered()));
            row.put("correct_answers", nullSafe(s.getCorrectAnswers()));
            int answered = nullSafe(s.getQuestionsAnswered());
            int correct = nullSafe(s.getCorrectAnswers());
            row.put("correctRate", answered == 0 ? "0.0" : String.format(Locale.US, "%.1f", correct * 100D / answered));
            return row;
        }).toList();
    }

    @Override
    public Map<String, Object> getTrends() {
        List<Map<String, Object>> sessions = getSessions();
        if (sessions.size() < 3) {
            return Map.of("hasTrend", false, "message", "会话数量不足");
        }
        List<Double> rates = sessions.stream()
                .map(s -> Double.parseDouble(String.valueOf(s.get("correctRate"))))
                .toList();
        double recent = rates.subList(0, 3).stream().mapToDouble(Double::doubleValue).average().orElse(0D);
        double earlier = rates.size() <= 3 ? recent : rates.subList(3, rates.size()).stream().mapToDouble(Double::doubleValue).average().orElse(recent);
        String direction = recent > earlier ? "up" : (recent < earlier ? "down" : "stable");
        Map<String, Object> trend = new HashMap<>();
        trend.put("hasTrend", true);
        trend.put("direction", direction);
        trend.put("recentAverage", String.format(Locale.US, "%.1f", recent));
        trend.put("earlierAverage", String.format(Locale.US, "%.1f", earlier));
        trend.put("changePercentage", earlier == 0 ? "0.0" : String.format(Locale.US, "%.1f", (recent - earlier) * 100D / earlier));
        trend.put("description", "up".equals(direction) ? "正确率上升" : ("down".equals(direction) ? "正确率下降" : "正确率稳定"));

        Map<String, Object> payload = new HashMap<>();
        payload.put("hasTrend", true);
        payload.put("trend", trend);
        payload.put("errorTypes", getWrongQuestions().get("wrongTypes"));
        return payload;
    }

    @Override
    public Map<String, Object> getAdvisorSuggestions() {
        StatisticsSnapshot snapshot = ensureSnapshot();
        int totalAnswered = nullSafe(snapshot.getTotalAnswered());
        if (totalAnswered < 10) {
            return Map.of("hasEnoughData", false, "message", "学习数据不足");
        }
        int totalCorrect = nullSafe(snapshot.getTotalCorrect());
        double correctRate = totalAnswered == 0 ? 0D : totalCorrect * 100D / totalAnswered;
        List<String> advices = new ArrayList<>();
        if (correctRate < 60) {
            advices.add("建议先复习基础知识并重点回顾错题。");
        } else if (correctRate < 80) {
            advices.add("建议通过错题复盘和变式题训练提高稳定性。");
        } else {
            advices.add("建议提升题目难度并进行综合训练。");
        }
        advices.add("建议保持固定学习节奏，每天完成目标题量。");

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("correctRate", String.format(Locale.US, "%.1f", correctRate));
        analysis.put("totalAnswered", totalAnswered);
        analysis.put("wrongQuestionCount", wrongQuestionMapper.selectCount(null));
        analysis.put("studyTimeHours", nullSafe(snapshot.getStudyMinutes()) / 60);
        analysis.put("studyTimeMinutes", nullSafe(snapshot.getStudyMinutes()) % 60);

        Map<String, Object> plan = new HashMap<>();
        plan.put("dailyGoal", 10);
        plan.put("weeklyPlan", "5天新题 + 2天复习");
        plan.put("focusAreas", "错题高频类型");

        Map<String, Object> data = new HashMap<>();
        data.put("hasEnoughData", true);
        data.put("analysis", analysis);
        data.put("advices", advices);
        data.put("plan", plan);
        data.put("errorTypes", getWrongQuestions().get("wrongTypes"));
        return data;
    }

    @Override
    public Map<String, Object> getTimeline(String period, String startDate, String endDate, String category) {
        LocalDateTime end = endDate == null || endDate.isBlank() ? LocalDateTime.now() : LocalDate.parse(endDate).atTime(23, 59, 59);
        LocalDateTime start;
        if (startDate != null && !startDate.isBlank()) {
            start = LocalDate.parse(startDate).atStartOfDay();
        } else {
            start = switch (period == null ? "daily" : period) {
                case "weekly" -> end.minusDays(90);
                case "monthly" -> end.minusMonths(12);
                case "yearly" -> end.minusYears(5);
                default -> end.minusDays(30);
            };
        }

        List<UserAnswer> answers = userAnswerMapper.selectList(new LambdaQueryWrapper<UserAnswer>()
                .ge(UserAnswer::getAnsweredAt, start)
                .le(UserAnswer::getAnsweredAt, end)
                .orderByAsc(UserAnswer::getAnsweredAt));

        Map<Long, Question> questionMap = questionMapper.selectList(null).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        String p = period == null || period.isBlank() ? "daily" : period;
        DateTimeFormatter day = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter month = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<String, Map<String, Object>> timelineMap = new LinkedHashMap<>();
        for (UserAnswer answer : answers) {
            Question q = questionMap.get(answer.getQuestionId());
            if (q == null) {
                continue;
            }
            if (category != null && !category.isBlank() && !Objects.equals(category, q.getType())) {
                continue;
            }
            LocalDateTime t = answer.getAnsweredAt();
            String key = switch (p) {
                case "weekly" -> {
                    WeekFields wf = WeekFields.of(Locale.getDefault());
                    yield t.getYear() + "-W" + t.get(wf.weekOfWeekBasedYear());
                }
                case "monthly" -> t.format(month);
                case "yearly" -> String.valueOf(t.getYear());
                default -> t.format(day);
            };
            Map<String, Object> item = timelineMap.computeIfAbsent(key, k -> {
                Map<String, Object> v = new HashMap<>();
                v.put("period", k);
                v.put("total", 0);
                v.put("correct", 0);
                return v;
            });
            item.put("total", ((Integer) item.get("total")) + 1);
            if (Boolean.TRUE.equals(answer.getIsCorrect())) {
                item.put("correct", ((Integer) item.get("correct")) + 1);
            }
        }

        List<Map<String, Object>> timeline = new ArrayList<>();
        for (Map<String, Object> row : timelineMap.values()) {
            int total = (Integer) row.get("total");
            int correct = (Integer) row.get("correct");
            row.put("correctRate", total == 0 ? "0.0" : String.format(Locale.US, "%.1f", correct * 100D / total));
            timeline.add(row);
        }
        int totalAnswered = timeline.stream().mapToInt(r -> (Integer) r.get("total")).sum();
        int totalCorrect = timeline.stream().mapToInt(r -> (Integer) r.get("correct")).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("period", p);
        summary.put("startDate", start);
        summary.put("endDate", end);
        summary.put("totalAnswered", totalAnswered);
        summary.put("totalCorrect", totalCorrect);
        summary.put("correctRate", totalAnswered == 0 ? "0.0" : String.format(Locale.US, "%.1f", totalCorrect * 100D / totalAnswered));

        Map<String, Object> data = new HashMap<>();
        data.put("timeline", timeline);
        data.put("summary", summary);
        return data;
    }

    @Override
    public List<Map<String, Object>> getBankProgress() {
        List<QuestionBank> banks = bankMapper.selectList(null);
        List<Question> allQuestions = questionMapper.selectList(null);
        Map<Long, Question> questionMap = allQuestions.stream().collect(Collectors.toMap(Question::getId, q -> q));
        Map<Long, UserAnswer> latest = latestAnswersByQuestion();
        Set<Long> masteredIds = reviewCardMapper.selectList(new LambdaQueryWrapper<ReviewCard>().ge(ReviewCard::getRepetitions, 3))
                .stream().map(ReviewCard::getQuestionId).collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (QuestionBank bank : banks) {
            List<Question> qs = allQuestions.stream().filter(q -> Objects.equals(q.getBankId(), bank.getId())).toList();
            result.add(bankProgressRow(bank.getBankCode(), bank.getName(), qs, latest, masteredIds));
        }
        List<Question> ungrouped = allQuestions.stream().filter(q -> q.getBankId() == null).toList();
        if (!ungrouped.isEmpty()) {
            result.add(bankProgressRow(null, "未分组", ungrouped, latest, masteredIds));
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getTagProgress() {
        List<QuestionTag> tags = tagMapper.selectList(null);
        List<QuestionTagRel> rels = tagRelMapper.selectList(null);
        Map<Long, List<Long>> tagToQuestionIds = new HashMap<>();
        for (QuestionTagRel rel : rels) {
            tagToQuestionIds.computeIfAbsent(rel.getTagId(), k -> new ArrayList<>()).add(rel.getQuestionId());
        }
        Map<Long, UserAnswer> latest = latestAnswersByQuestion();
        Set<Long> masteredIds = reviewCardMapper.selectList(new LambdaQueryWrapper<ReviewCard>().ge(ReviewCard::getRepetitions, 3))
                .stream().map(ReviewCard::getQuestionId).collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (QuestionTag tag : tags) {
            List<Long> qIds = tagToQuestionIds.getOrDefault(tag.getId(), Collections.emptyList());
            int answered = 0;
            int correct = 0;
            int mastered = 0;
            for (Long qid : qIds) {
                if (latest.containsKey(qid)) {
                    answered++;
                    if (Boolean.TRUE.equals(latest.get(qid).getIsCorrect())) {
                        correct++;
                    }
                }
                if (masteredIds.contains(qid)) {
                    mastered++;
                }
            }
            Map<String, Object> row = new HashMap<>();
            row.put("tag", tag.getName());
            row.put("totalQuestions", qIds.size());
            row.put("answeredCount", answered);
            row.put("correctCount", correct);
            row.put("correctRate", answered == 0 ? "0.0" : String.format(Locale.US, "%.1f", correct * 100D / answered));
            row.put("masteredCount", mastered);
            row.put("masteryRate", qIds.isEmpty() ? "0.0" : String.format(Locale.US, "%.1f", mastered * 100D / qIds.size()));
            result.add(row);
        }
        return result;
    }

    @Override
    public Map<String, Object> getMasteryOverview() {
        long totalQuestions = questionMapper.selectCount(null);
        long totalCards = reviewCardMapper.selectCount(null);
        long masteredCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>().ge(ReviewCard::getRepetitions, 3));
        long learningCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>().gt(ReviewCard::getRepetitions, 0).lt(ReviewCard::getRepetitions, 3));
        long dueCount = reviewCardMapper.selectCount(new LambdaQueryWrapper<ReviewCard>().le(ReviewCard::getNextReviewAt, LocalDateTime.now()));

        Map<String, Object> data = new HashMap<>();
        data.put("totalQuestions", totalQuestions);
        data.put("masteredCount", masteredCount);
        data.put("learningCount", learningCount);
        data.put("newCount", Math.max(0, totalQuestions - totalCards));
        data.put("dueCount", dueCount);
        data.put("masteryRate", totalQuestions == 0 ? "0.0" : String.format(Locale.US, "%.1f", masteredCount * 100D / totalQuestions));
        return data;
    }

    @Override
    @Transactional
    public void resetStats() {
        snapshotMapper.delete(null);
        sessionMapper.delete(null);
        wrongQuestionMapper.delete(null);
        viewHistoryMapper.delete(null);
        StatisticsSnapshot snapshot = new StatisticsSnapshot();
        snapshot.setTotalAnswered(0);
        snapshot.setTotalCorrect(0);
        snapshot.setStudyMinutes(0);
        snapshot.setWrongQuestionCount(0);
        snapshot.setUpdatedAt(LocalDateTime.now());
        snapshotMapper.insert(snapshot);
    }

    private StatisticsSnapshot ensureSnapshot() {
        StatisticsSnapshot snapshot = snapshotMapper.selectOne(new QueryWrapper<StatisticsSnapshot>()
                .orderByAsc("id")
                .last("limit 1"));
        if (snapshot != null) {
            return snapshot;
        }
        StatisticsSnapshot init = new StatisticsSnapshot();
        init.setTotalAnswered(0);
        init.setTotalCorrect(0);
        init.setStudyMinutes(0);
        init.setWrongQuestionCount(0);
        init.setUpdatedAt(LocalDateTime.now());
        snapshotMapper.insert(init);
        return init;
    }

    private int nullSafe(Integer value) {
        return value == null ? 0 : value;
    }

    private void refreshWrongCount() {
        StatisticsSnapshot snapshot = ensureSnapshot();
        snapshot.setWrongQuestionCount(wrongQuestionMapper.selectCount(null).intValue());
        snapshot.setUpdatedAt(LocalDateTime.now());
        snapshotMapper.updateById(snapshot);
    }

    private List<String> getWrongQuestionCodes() {
        List<Long> ids = getWrongQuestionIds();
        if (ids.isEmpty()) {
            return Collections.emptyList();
        }
        return questionMapper.selectBatchIds(ids).stream().map(Question::getQuestionCode).toList();
    }

    private Map<Long, UserAnswer> latestAnswersByQuestion() {
        List<UserAnswer> all = userAnswerMapper.selectList(new QueryWrapper<UserAnswer>().orderByDesc("answered_at"));
        Map<Long, UserAnswer> latest = new HashMap<>();
        for (UserAnswer item : all) {
            latest.putIfAbsent(item.getQuestionId(), item);
        }
        return latest;
    }

    private Map<String, Object> bankProgressRow(String bankCode, String bankName, List<Question> questions, Map<Long, UserAnswer> latest, Set<Long> masteredIds) {
        int answered = 0;
        int correct = 0;
        int mastered = 0;
        for (Question q : questions) {
            if (latest.containsKey(q.getId())) {
                answered++;
                if (Boolean.TRUE.equals(latest.get(q.getId()).getIsCorrect())) {
                    correct++;
                }
            }
            if (masteredIds.contains(q.getId())) {
                mastered++;
            }
        }
        Map<String, Object> row = new HashMap<>();
        row.put("bankId", bankCode);
        row.put("bankName", bankName);
        row.put("totalQuestions", questions.size());
        row.put("answeredCount", answered);
        row.put("correctCount", correct);
        row.put("correctRate", answered == 0 ? "0.0" : String.format(Locale.US, "%.1f", correct * 100D / answered));
        row.put("masteredCount", mastered);
        row.put("masteryRate", questions.isEmpty() ? "0.0" : String.format(Locale.US, "%.1f", mastered * 100D / questions.size()));
        return row;
    }
}
