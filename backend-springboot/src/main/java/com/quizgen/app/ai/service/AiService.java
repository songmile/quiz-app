package com.quizgen.app.ai.service;

import java.util.Map;

public interface AiService {

    Map<String, Object> generateExplanation(String questionCode, boolean force);

    Map<String, Object> getExplanation(String questionCode);

    Map<String, Object> generateErrorAnalysis(String questionCode, String userAnswer, boolean force);

    Map<String, Object> getErrorAnalysis(String questionCode, String userAnswer);

    Map<String, Object> generateVariant(String questionCode, boolean force);

    Map<String, Object> getVariant(String questionCode);

    Map<String, Object> addVariantToQuestions(String questionCode);

    Map<String, Object> generateKnowledgeTree(String questionCode, boolean force);

    Map<String, Object> getKnowledgeTree(String questionCode);

    Map<String, Object> generateDesignProcess(String questionCode, boolean force);

    Map<String, Object> getDesignProcess(String questionCode);

    Map<String, Object> testConnection(Integer apiIndex);

    int clearExplanations();

    int clearErrorAnalyses();

    int clearVariants();
}
