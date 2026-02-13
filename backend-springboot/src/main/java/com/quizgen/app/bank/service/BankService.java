package com.quizgen.app.bank.service;

import com.quizgen.app.bank.dto.BankResponse;
import com.quizgen.app.bank.dto.BankUpsertRequest;

import java.util.List;

public interface BankService {

    List<BankResponse> list();

    BankResponse create(BankUpsertRequest request);

    BankResponse update(String bankCode, BankUpsertRequest request);

    void delete(String bankCode);
}