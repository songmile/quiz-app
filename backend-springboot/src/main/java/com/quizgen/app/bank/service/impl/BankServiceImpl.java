package com.quizgen.app.bank.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.quizgen.app.bank.dto.BankResponse;
import com.quizgen.app.bank.dto.BankUpsertRequest;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.bank.service.BankService;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.common.util.CodeGenerator;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.mapper.QuestionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BankServiceImpl implements BankService {

    private final QuestionBankMapper bankMapper;
    private final QuestionMapper questionMapper;

    public BankServiceImpl(QuestionBankMapper bankMapper, QuestionMapper questionMapper) {
        this.bankMapper = bankMapper;
        this.questionMapper = questionMapper;
    }

    @Override
    public List<BankResponse> list() {
        List<QuestionBank> banks = bankMapper.selectList(new LambdaQueryWrapper<QuestionBank>().orderByDesc(QuestionBank::getCreatedAt));
        Map<Long, Long> countMap = new HashMap<>();
        for (QuestionBank bank : banks) {
            countMap.put(bank.getId(), questionMapper.selectCount(new LambdaQueryWrapper<Question>().eq(Question::getBankId, bank.getId())));
        }
        return banks.stream().map(b -> toResponse(b, countMap.getOrDefault(b.getId(), 0L))).toList();
    }

    @Override
    public BankResponse create(BankUpsertRequest request) {
        QuestionBank bank = new QuestionBank();
        bank.setBankCode(CodeGenerator.nextCode());
        bank.setName(request.getName());
        bank.setDescription(request.getDescription());
        bank.setCreatedAt(LocalDateTime.now());
        bankMapper.insert(bank);
        return toResponse(bank, 0L);
    }

    @Override
    public BankResponse update(String bankCode, BankUpsertRequest request) {
        QuestionBank bank = findByCode(bankCode);
        bank.setName(request.getName());
        bank.setDescription(request.getDescription());
        bankMapper.updateById(bank);
        Long count = questionMapper.selectCount(new LambdaQueryWrapper<Question>().eq(Question::getBankId, bank.getId()));
        return toResponse(bank, count);
    }

    @Override
    @Transactional
    public void delete(String bankCode) {
        QuestionBank bank = findByCode(bankCode);
        questionMapper.update(new Question(), new LambdaUpdateWrapper<Question>().set(Question::getBankId, null).eq(Question::getBankId, bank.getId()));
        bankMapper.deleteById(bank.getId());
    }

    private QuestionBank findByCode(String bankCode) {
        QuestionBank bank = bankMapper.selectOne(new LambdaQueryWrapper<QuestionBank>().eq(QuestionBank::getBankCode, bankCode));
        if (bank == null) {
            throw new BusinessException(40405, "bank not found");
        }
        return bank;
    }

    private BankResponse toResponse(QuestionBank bank, Long count) {
        BankResponse response = new BankResponse();
        response.setId(bank.getBankCode());
        response.setName(bank.getName());
        response.setDescription(bank.getDescription());
        response.setQuestionCount(count);
        return response;
    }
}