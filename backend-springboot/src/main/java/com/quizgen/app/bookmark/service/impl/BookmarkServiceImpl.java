package com.quizgen.app.bookmark.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.quizgen.app.bookmark.dto.BookmarkItemResponse;
import com.quizgen.app.bookmark.entity.Bookmark;
import com.quizgen.app.bookmark.mapper.BookmarkMapper;
import com.quizgen.app.bookmark.service.BookmarkService;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.question.dto.QuestionResponse;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.question.service.QuestionService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkMapper bookmarkMapper;
    private final QuestionMapper questionMapper;
    private final QuestionService questionService;

    public BookmarkServiceImpl(BookmarkMapper bookmarkMapper, QuestionMapper questionMapper, QuestionService questionService) {
        this.bookmarkMapper = bookmarkMapper;
        this.questionMapper = questionMapper;
        this.questionService = questionService;
    }

    @Override
    public List<BookmarkItemResponse> list() {
        return bookmarkMapper.selectList(new LambdaQueryWrapper<Bookmark>().orderByDesc(Bookmark::getCreatedAt)).stream()
                .map(this::toResponse)
                .filter(item -> item.getQuestion() != null)
                .toList();
    }

    @Override
    public List<String> ids() {
        return bookmarkMapper.selectList(new LambdaQueryWrapper<Bookmark>().orderByDesc(Bookmark::getCreatedAt)).stream()
                .map(item -> {
                    Question question = questionMapper.selectById(item.getQuestionId());
                    return question == null ? null : question.getQuestionCode();
                })
                .filter(code -> code != null)
                .toList();
    }

    @Override
    public void add(String questionCode) {
        Question question = findQuestion(questionCode);
        Bookmark exists = bookmarkMapper.selectOne(new LambdaQueryWrapper<Bookmark>().eq(Bookmark::getQuestionId, question.getId()));
        if (exists != null) {
            return;
        }
        Bookmark bookmark = new Bookmark();
        bookmark.setQuestionId(question.getId());
        bookmark.setCreatedAt(LocalDateTime.now());
        bookmarkMapper.insert(bookmark);
    }

    @Override
    public void remove(String questionCode) {
        Question question = findQuestion(questionCode);
        bookmarkMapper.delete(new LambdaQueryWrapper<Bookmark>().eq(Bookmark::getQuestionId, question.getId()));
    }

    private Question findQuestion(String code) {
        Question question = questionMapper.selectOne(new LambdaQueryWrapper<Question>().eq(Question::getQuestionCode, code));
        if (question == null) {
            throw new BusinessException(40404, "question not found");
        }
        return question;
    }

    private BookmarkItemResponse toResponse(Bookmark bookmark) {
        BookmarkItemResponse response = new BookmarkItemResponse();
        Question question = questionMapper.selectById(bookmark.getQuestionId());
        if (question == null) {
            return response;
        }
        response.setQuestionId(question.getQuestionCode());
        response.setCreatedAt(bookmark.getCreatedAt());
        QuestionResponse detail = questionService.getByCode(question.getQuestionCode());
        response.setQuestion(detail);
        return response;
    }
}