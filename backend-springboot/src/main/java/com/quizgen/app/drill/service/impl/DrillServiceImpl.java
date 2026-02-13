package com.quizgen.app.drill.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.quizgen.app.drill.service.DrillService;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.study.entity.UserAnswer;
import com.quizgen.app.study.mapper.UserAnswerMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class DrillServiceImpl implements DrillService {

    private final QuestionMapper questionMapper;
    private final UserAnswerMapper userAnswerMapper;

    public DrillServiceImpl(QuestionMapper questionMapper, UserAnswerMapper userAnswerMapper) {
        this.questionMapper = questionMapper;
        this.userAnswerMapper = userAnswerMapper;
    }

    @Override
    public Map<String, Object> analyzeWeakness() {
        List<Question> questions = questionMapper.selectList(null);
        List<UserAnswer> answers = userAnswerMapper.selectList(new QueryWrapper<UserAnswer>());
        Map<Long, Question> qMap = questions.stream().collect(java.util.stream.Collectors.toMap(Question::getId, q -> q));

        Map<String, int[]> category = new LinkedHashMap<>();
        for (UserAnswer answer : answers) {
            Question q = qMap.get(answer.getQuestionId());
            if (q == null) {
                continue;
            }
            int[] stat = category.computeIfAbsent(q.getType(), k -> new int[]{0, 0});
            stat[0] += 1;
            if (Boolean.TRUE.equals(answer.getIsCorrect())) {
                stat[1] += 1;
            }
        }

        Map<String, Object> categoryWeakness = new LinkedHashMap<>();
        for (Map.Entry<String, int[]> e : category.entrySet()) {
            int total = e.getValue()[0];
            int correct = e.getValue()[1];
            Map<String, Object> item = new HashMap<>();
            item.put("total", total);
            item.put("correct", correct);
            item.put("rate", total == 0 ? 0 : Math.round(correct * 100f / total));
            categoryWeakness.put(e.getKey(), item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("categoryWeakness", categoryWeakness);
        return result;
    }

    @Override
    public Map<String, Object> startDrill(int count) {
        int size = count < 1 ? 20 : count;
        List<Question> questions = questionMapper.selectList(null);
        List<UserAnswer> answers = userAnswerMapper.selectList(new QueryWrapper<UserAnswer>().orderByDesc("answered_at"));

        Map<Long, int[]> questionStats = new HashMap<>();
        for (UserAnswer answer : answers) {
            int[] stat = questionStats.computeIfAbsent(answer.getQuestionId(), k -> new int[]{0, 0});
            stat[0] += 1;
            if (Boolean.TRUE.equals(answer.getIsCorrect())) {
                stat[1] += 1;
            }
        }

        List<Question> sorted = new ArrayList<>(questions);
        sorted.sort((a, b) -> Double.compare(priority(questionStats, b.getId()), priority(questionStats, a.getId())));
        if (sorted.size() > size) {
            sorted = sorted.subList(0, size);
        }
        Collections.shuffle(sorted);

        List<Map<String, Object>> rows = sorted.stream().map(this::toQuestionMap).toList();
        Map<String, Object> result = new HashMap<>();
        result.put("totalQuestions", rows.size());
        result.put("questions", rows);
        result.put("analysis", analyzeWeakness().get("categoryWeakness"));
        return result;
    }

    private double priority(Map<Long, int[]> stats, Long questionId) {
        int[] s = stats.get(questionId);
        if (s == null || s[0] == 0) {
            return 0.5;
        }
        double accuracy = s[1] * 1D / s[0];
        return 1 - accuracy;
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

