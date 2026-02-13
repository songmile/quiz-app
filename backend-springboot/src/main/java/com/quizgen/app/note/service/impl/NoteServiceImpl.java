package com.quizgen.app.note.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.note.dto.NoteResponse;
import com.quizgen.app.note.dto.NoteUpsertRequest;
import com.quizgen.app.note.entity.Note;
import com.quizgen.app.note.mapper.NoteMapper;
import com.quizgen.app.note.service.NoteService;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteServiceImpl implements NoteService {

    private final NoteMapper noteMapper;
    private final QuestionMapper questionMapper;

    public NoteServiceImpl(NoteMapper noteMapper, QuestionMapper questionMapper) {
        this.noteMapper = noteMapper;
        this.questionMapper = questionMapper;
    }

    @Override
    public List<NoteResponse> list(int page, int limit, String search) {
        LambdaQueryWrapper<Note> wrapper = new LambdaQueryWrapper<>();
        if (search != null && !search.isBlank()) {
            wrapper.like(Note::getContent, search);
        }
        wrapper.orderByDesc(Note::getUpdatedAt);
        Page<Note> result = noteMapper.selectPage(new Page<>(page, limit), wrapper);
        return result.getRecords().stream().map(this::toResponse).toList();
    }

    @Override
    public long total(String search) {
        LambdaQueryWrapper<Note> wrapper = new LambdaQueryWrapper<>();
        if (search != null && !search.isBlank()) {
            wrapper.like(Note::getContent, search);
        }
        return noteMapper.selectCount(wrapper);
    }

    @Override
    public List<NoteResponse> byQuestionCode(String questionCode) {
        Question question = findQuestion(questionCode);
        return noteMapper.selectList(new LambdaQueryWrapper<Note>()
                        .eq(Note::getQuestionId, question.getId())
                        .orderByDesc(Note::getCreatedAt))
                .stream().map(this::toResponse).toList();
    }

    @Override
    public NoteResponse create(NoteUpsertRequest request) {
        Question question = findQuestion(request.getQuestionId());
        Note note = new Note();
        note.setQuestionId(question.getId());
        note.setContent(request.getContent());
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        noteMapper.insert(note);
        return toResponse(note);
    }

    @Override
    public NoteResponse update(String id, NoteUpsertRequest request) {
        Note note = noteMapper.selectById(Long.parseLong(id));
        if (note == null) {
            throw new BusinessException(40406, "note not found");
        }
        note.setContent(request.getContent());
        note.setUpdatedAt(LocalDateTime.now());
        noteMapper.updateById(note);
        return toResponse(note);
    }

    @Override
    public void delete(String id) {
        noteMapper.deleteById(Long.parseLong(id));
    }

    private Question findQuestion(String questionCode) {
        Question question = questionMapper.selectOne(new LambdaQueryWrapper<Question>().eq(Question::getQuestionCode, questionCode));
        if (question == null) {
            throw new BusinessException(40404, "question not found");
        }
        return question;
    }

    private NoteResponse toResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(String.valueOf(note.getId()));
        Question q = questionMapper.selectById(note.getQuestionId());
        response.setQuestionId(q == null ? null : q.getQuestionCode());
        response.setContent(note.getContent());
        response.setCreatedAt(note.getCreatedAt());
        response.setUpdatedAt(note.getUpdatedAt());
        return response;
    }
}