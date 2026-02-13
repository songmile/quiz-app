package com.quizgen.app.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.quizgen.app.ai.entity.AiDesignProcess;
import com.quizgen.app.ai.entity.AiErrorAnalysis;
import com.quizgen.app.ai.entity.AiExplanation;
import com.quizgen.app.ai.entity.AiKnowledgeTree;
import com.quizgen.app.ai.entity.AiVariantQuestion;
import com.quizgen.app.ai.mapper.AiDesignProcessMapper;
import com.quizgen.app.ai.mapper.AiErrorAnalysisMapper;
import com.quizgen.app.ai.mapper.AiExplanationMapper;
import com.quizgen.app.ai.mapper.AiKnowledgeTreeMapper;
import com.quizgen.app.ai.mapper.AiVariantQuestionMapper;
import com.quizgen.app.ai.service.AiService;
import com.quizgen.app.bank.entity.QuestionBank;
import com.quizgen.app.bank.mapper.QuestionBankMapper;
import com.quizgen.app.common.error.BusinessException;
import com.quizgen.app.question.dto.QuestionOptionDto;
import com.quizgen.app.question.dto.QuestionResponse;
import com.quizgen.app.question.dto.QuestionUpsertRequest;
import com.quizgen.app.question.entity.Question;
import com.quizgen.app.question.entity.QuestionOption;
import com.quizgen.app.question.mapper.QuestionMapper;
import com.quizgen.app.question.mapper.QuestionOptionMapper;
import com.quizgen.app.question.service.QuestionService;
import com.quizgen.app.setting.entity.ApiConfig;
import com.quizgen.app.setting.entity.AppSetting;
import com.quizgen.app.setting.mapper.ApiConfigMapper;
import com.quizgen.app.setting.mapper.AppSettingMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiServiceImpl implements AiService {

    private static final String SETTING_EXPLANATION_INDEX = "explanation_api_index";
    private static final String SETTING_KNOWLEDGE_TREE_INDEX = "knowledge_tree_api_index";
    private static final String SETTING_DESIGN_PROCESS_INDEX = "design_process_api_index";

    private final QuestionMapper questionMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final QuestionBankMapper questionBankMapper;
    private final QuestionService questionService;
    private final AiExplanationMapper explanationMapper;
    private final AiErrorAnalysisMapper errorAnalysisMapper;
    private final AiVariantQuestionMapper variantMapper;
    private final AiKnowledgeTreeMapper knowledgeTreeMapper;
    private final AiDesignProcessMapper designProcessMapper;
    private final ApiConfigMapper apiConfigMapper;
    private final AppSettingMapper appSettingMapper;
    private final ObjectMapper objectMapper;

    public AiServiceImpl(
            QuestionMapper questionMapper,
            QuestionOptionMapper questionOptionMapper,
            QuestionBankMapper questionBankMapper,
            QuestionService questionService,
            AiExplanationMapper explanationMapper,
            AiErrorAnalysisMapper errorAnalysisMapper,
            AiVariantQuestionMapper variantMapper,
            AiKnowledgeTreeMapper knowledgeTreeMapper,
            AiDesignProcessMapper designProcessMapper,
            ApiConfigMapper apiConfigMapper,
            AppSettingMapper appSettingMapper,
            ObjectMapper objectMapper
    ) {
        this.questionMapper = questionMapper;
        this.questionOptionMapper = questionOptionMapper;
        this.questionBankMapper = questionBankMapper;
        this.questionService = questionService;
        this.explanationMapper = explanationMapper;
        this.errorAnalysisMapper = errorAnalysisMapper;
        this.variantMapper = variantMapper;
        this.knowledgeTreeMapper = knowledgeTreeMapper;
        this.designProcessMapper = designProcessMapper;
        this.apiConfigMapper = apiConfigMapper;
        this.appSettingMapper = appSettingMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public Map<String, Object> generateExplanation(String questionCode, boolean force) {
        Question question = findQuestionByCode(questionCode);
        AiExplanation existing = explanationMapper.selectOne(new LambdaQueryWrapper<AiExplanation>()
                .eq(AiExplanation::getQuestionId, question.getId()));

        if (existing != null && !force) {
            Map<String, Object> result = new HashMap<>();
            result.put("exists", true);
            result.put("message", "already exists");
            result.put("data", toExplanationData(existing));
            return result;
        }

        ApiConfig config = resolveConfigBySettingKey(SETTING_EXPLANATION_INDEX, 0);
        String prompt = "请用通俗易懂的方式解释这道题。输出结构：关键概念、解题思路、易错点、知识扩展。\\n\\n"
                + "题型: " + nullSafe(question.getType()) + "\\n"
                + "题干: " + nullSafe(question.getText()) + "\\n"
                + "选项:\\n" + buildOptionsText(question.getId()) + "\\n"
                + "正确答案: " + nullSafe(question.getAnswer()) + "\\n"
                + "题目解析: " + nullSafe(question.getExplanation());

        String content = callChatCompletion(config, "你是专业刷题助手。", prompt);

        AiExplanation saved = existing == null ? new AiExplanation() : existing;
        saved.setQuestionId(question.getId());
        saved.setContent(content);
        saved.setApiConfigId(config.getId());
        saved.setGeneratedAt(LocalDateTime.now());
        if (saved.getId() == null) {
            explanationMapper.insert(saved);
        } else {
            explanationMapper.updateById(saved);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("exists", true);
        result.put("message", "generated");
        result.put("data", toExplanationData(saved));
        return result;
    }

    @Override
    public Map<String, Object> getExplanation(String questionCode) {
        Question question = findQuestionByCode(questionCode);
        AiExplanation explanation = explanationMapper.selectOne(new LambdaQueryWrapper<AiExplanation>()
                .eq(AiExplanation::getQuestionId, question.getId()));
        Map<String, Object> result = new HashMap<>();
        if (explanation == null) {
            result.put("exists", false);
            result.put("message", "not found");
            return result;
        }
        result.put("exists", true);
        result.put("data", toExplanationData(explanation));
        return result;
    }

    @Override
    public Map<String, Object> generateErrorAnalysis(String questionCode, String userAnswer, boolean force) {
        if (!StringUtils.hasText(userAnswer)) {
            throw new BusinessException(40031, "userAnswer is required");
        }

        Question question = findQuestionByCode(questionCode);
        String normalizedAnswer = userAnswer.trim();
        AiErrorAnalysis existing = errorAnalysisMapper.selectOne(new LambdaQueryWrapper<AiErrorAnalysis>()
                .eq(AiErrorAnalysis::getQuestionId, question.getId())
                .eq(AiErrorAnalysis::getUserAnswer, normalizedAnswer));

        if (existing != null && !force) {
            Map<String, Object> result = new HashMap<>();
            result.put("exists", true);
            result.put("message", "already exists");
            result.put("data", toErrorData(existing));
            return result;
        }

        ApiConfig config = resolveConfigBySettingKey(SETTING_EXPLANATION_INDEX, 0);
        String prompt = "请分析学生错因并给出改进建议。输出结构：错误类型、错误原因、知识盲点、改进建议。\\n\\n"
                + "题型: " + nullSafe(question.getType()) + "\\n"
                + "题干: " + nullSafe(question.getText()) + "\\n"
                + "选项:\\n" + buildOptionsText(question.getId()) + "\\n"
                + "正确答案: " + nullSafe(question.getAnswer()) + "\\n"
                + "学生答案: " + normalizedAnswer + "\\n"
                + "题目解析: " + nullSafe(question.getExplanation());

        String content = callChatCompletion(config, "你是专业教学诊断助手。", prompt);

        AiErrorAnalysis saved = existing == null ? new AiErrorAnalysis() : existing;
        saved.setQuestionId(question.getId());
        saved.setUserAnswer(normalizedAnswer);
        saved.setContent(content);
        saved.setApiConfigId(config.getId());
        saved.setGeneratedAt(LocalDateTime.now());
        if (saved.getId() == null) {
            errorAnalysisMapper.insert(saved);
        } else {
            errorAnalysisMapper.updateById(saved);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("exists", true);
        result.put("message", "generated");
        result.put("data", toErrorData(saved));
        return result;
    }

    @Override
    public Map<String, Object> getErrorAnalysis(String questionCode, String userAnswer) {
        Question question = findQuestionByCode(questionCode);

        if (StringUtils.hasText(userAnswer)) {
            AiErrorAnalysis one = errorAnalysisMapper.selectOne(new LambdaQueryWrapper<AiErrorAnalysis>()
                    .eq(AiErrorAnalysis::getQuestionId, question.getId())
                    .eq(AiErrorAnalysis::getUserAnswer, userAnswer.trim())
                    .orderByDesc(AiErrorAnalysis::getGeneratedAt)
                    .last("LIMIT 1"));
            Map<String, Object> result = new HashMap<>();
            if (one == null) {
                result.put("exists", false);
                result.put("message", "not found");
            } else {
                result.put("exists", true);
                result.put("data", toErrorData(one));
            }
            return result;
        }

        List<AiErrorAnalysis> list = errorAnalysisMapper.selectList(new LambdaQueryWrapper<AiErrorAnalysis>()
                .eq(AiErrorAnalysis::getQuestionId, question.getId())
                .orderByDesc(AiErrorAnalysis::getGeneratedAt));
        Map<String, Object> result = new HashMap<>();
        if (list.isEmpty()) {
            result.put("exists", false);
            result.put("message", "not found");
            return result;
        }
        result.put("exists", true);
        result.put("count", list.size());
        result.put("data", list.stream().map(this::toErrorData).toList());
        return result;
    }

    @Override
    public Map<String, Object> generateVariant(String questionCode, boolean force) {
        Question question = findQuestionByCode(questionCode);
        AiVariantQuestion existing = variantMapper.selectOne(new LambdaQueryWrapper<AiVariantQuestion>()
                .eq(AiVariantQuestion::getQuestionId, question.getId()));

        if (existing != null && !force) {
            Map<String, Object> result = new HashMap<>();
            result.put("exists", true);
            result.put("message", "already exists");
            result.put("data", toVariantData(existing));
            return result;
        }

        ApiConfig config = resolveConfigBySettingKey(SETTING_EXPLANATION_INDEX, 0);
        String prompt = "请基于原题生成一道同知识点、同难度的变式题。"
                + "必须返回 JSON 对象，字段包括 type,text,options,answer,explanation,relation。\\n\\n"
                + "原题题型: " + nullSafe(question.getType()) + "\\n"
                + "原题题干: " + nullSafe(question.getText()) + "\\n"
                + "原题选项:\\n" + buildOptionsText(question.getId()) + "\\n"
                + "原题答案: " + nullSafe(question.getAnswer()) + "\\n"
                + "原题解析: " + nullSafe(question.getExplanation());

        String raw = callChatCompletion(config, "你是专业题目设计助手。", prompt);
        String payload = normalizeJsonPayload(raw, "variant");

        AiVariantQuestion saved = existing == null ? new AiVariantQuestion() : existing;
        saved.setQuestionId(question.getId());
        saved.setVariantPayloadJson(payload);
        saved.setGeneratedAt(LocalDateTime.now());
        if (saved.getId() == null) {
            variantMapper.insert(saved);
        } else {
            variantMapper.updateById(saved);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("exists", true);
        result.put("message", "generated");
        result.put("data", toVariantData(saved));
        return result;
    }

    @Override
    public Map<String, Object> getVariant(String questionCode) {
        Question question = findQuestionByCode(questionCode);
        AiVariantQuestion variant = variantMapper.selectOne(new LambdaQueryWrapper<AiVariantQuestion>()
                .eq(AiVariantQuestion::getQuestionId, question.getId()));
        Map<String, Object> result = new HashMap<>();
        if (variant == null) {
            result.put("exists", false);
            result.put("message", "not found");
            return result;
        }
        result.put("exists", true);
        result.put("data", toVariantData(variant));
        return result;
    }

    @Override
    public Map<String, Object> addVariantToQuestions(String questionCode) {
        Question origin = findQuestionByCode(questionCode);
        AiVariantQuestion variant = variantMapper.selectOne(new LambdaQueryWrapper<AiVariantQuestion>()
                .eq(AiVariantQuestion::getQuestionId, origin.getId()));
        if (variant == null) {
            throw new BusinessException(40431, "variant not found");
        }

        JsonNode node = parsePayloadNode(variant.getVariantPayloadJson());
        if (node == null || !node.isObject()) {
            throw new BusinessException(40032, "invalid variant payload");
        }

        QuestionUpsertRequest request = new QuestionUpsertRequest();
        request.setType(readText(node, "type", origin.getType()));
        request.setText(readText(node, "text", null));
        request.setAnswer(readText(node, "answer", null));
        request.setExplanation(readText(node, "explanation", null));
        if (!StringUtils.hasText(request.getText()) || !StringUtils.hasText(request.getAnswer()) || !StringUtils.hasText(request.getType())) {
            throw new BusinessException(40033, "variant payload lacks type/text/answer");
        }

        if (origin.getBankId() != null) {
            QuestionBank bank = questionBankMapper.selectById(origin.getBankId());
            if (bank != null) {
                request.setBankId(bank.getBankCode());
            }
        }

        JsonNode optionsNode = node.get("options");
        if (optionsNode != null && optionsNode.isArray()) {
            List<QuestionOptionDto> options = new ArrayList<>();
            for (JsonNode optionNode : optionsNode) {
                String letter = readText(optionNode, "letter", null);
                String text = readText(optionNode, "text", null);
                if (!StringUtils.hasText(letter) || !StringUtils.hasText(text)) {
                    continue;
                }
                QuestionOptionDto dto = new QuestionOptionDto();
                dto.setLetter(letter);
                dto.setText(text);
                options.add(dto);
            }
            request.setOptions(options);
        }

        QuestionResponse created = questionService.create(request);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "variant added");
        result.put("data", created);
        return result;
    }

    @Override
    public Map<String, Object> generateKnowledgeTree(String questionCode, boolean force) {
        Question question = findQuestionByCode(questionCode);
        AiKnowledgeTree existing = knowledgeTreeMapper.selectOne(new LambdaQueryWrapper<AiKnowledgeTree>()
                .eq(AiKnowledgeTree::getQuestionId, question.getId()));

        if (existing != null && !force) {
            Map<String, Object> result = new HashMap<>();
            result.put("exists", true);
            result.put("message", "already exists");
            result.put("data", toKnowledgeTreeData(existing));
            return result;
        }

        ApiConfig config = resolveConfigBySettingKey(SETTING_KNOWLEDGE_TREE_INDEX, 2);
        String prompt = "请输出该题对应的知识树，返回 JSON 对象，至少包含 root 与 children 层级。\\n\\n"
                + "题型: " + nullSafe(question.getType()) + "\\n"
                + "题干: " + nullSafe(question.getText()) + "\\n"
                + "选项:\\n" + buildOptionsText(question.getId()) + "\\n"
                + "正确答案: " + nullSafe(question.getAnswer()) + "\\n"
                + "题目解析: " + nullSafe(question.getExplanation());

        String raw = callChatCompletion(config, "你是知识图谱构建助手。", prompt);
        String payload = normalizeJsonPayload(raw, "knowledge_tree");

        AiKnowledgeTree saved = existing == null ? new AiKnowledgeTree() : existing;
        saved.setQuestionId(question.getId());
        saved.setTreePayloadJson(payload);
        saved.setGeneratedAt(LocalDateTime.now());
        if (saved.getId() == null) {
            knowledgeTreeMapper.insert(saved);
        } else {
            knowledgeTreeMapper.updateById(saved);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("exists", true);
        result.put("message", "generated");
        result.put("data", toKnowledgeTreeData(saved));
        return result;
    }

    @Override
    public Map<String, Object> getKnowledgeTree(String questionCode) {
        Question question = findQuestionByCode(questionCode);
        AiKnowledgeTree tree = knowledgeTreeMapper.selectOne(new LambdaQueryWrapper<AiKnowledgeTree>()
                .eq(AiKnowledgeTree::getQuestionId, question.getId()));
        Map<String, Object> result = new HashMap<>();
        if (tree == null) {
            result.put("exists", false);
            result.put("message", "not found");
            return result;
        }
        result.put("exists", true);
        result.put("data", toKnowledgeTreeData(tree));
        return result;
    }

    @Override
    public Map<String, Object> generateDesignProcess(String questionCode, boolean force) {
        Question question = findQuestionByCode(questionCode);
        AiDesignProcess existing = designProcessMapper.selectOne(new LambdaQueryWrapper<AiDesignProcess>()
                .eq(AiDesignProcess::getQuestionId, question.getId()));

        if (existing != null && !force) {
            Map<String, Object> result = new HashMap<>();
            result.put("exists", true);
            result.put("message", "already exists");
            result.put("data", toDesignProcessData(existing));
            return result;
        }

        ApiConfig config = resolveConfigBySettingKey(SETTING_DESIGN_PROCESS_INDEX, 3);
        String prompt = "请输出该题的命题设计过程与解题流程，返回 JSON 对象。"
                + "包含 design_analysis 与 flowcharts(mermaid)。\\n\\n"
                + "题型: " + nullSafe(question.getType()) + "\\n"
                + "题干: " + nullSafe(question.getText()) + "\\n"
                + "选项:\\n" + buildOptionsText(question.getId()) + "\\n"
                + "正确答案: " + nullSafe(question.getAnswer()) + "\\n"
                + "题目解析: " + nullSafe(question.getExplanation());

        String raw = callChatCompletion(config, "你是命题分析专家。", prompt);
        String payload = normalizeJsonPayload(raw, "design_process");

        AiDesignProcess saved = existing == null ? new AiDesignProcess() : existing;
        saved.setQuestionId(question.getId());
        saved.setProcessPayloadJson(payload);
        saved.setGeneratedAt(LocalDateTime.now());
        if (saved.getId() == null) {
            designProcessMapper.insert(saved);
        } else {
            designProcessMapper.updateById(saved);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("exists", true);
        result.put("message", "generated");
        result.put("data", toDesignProcessData(saved));
        return result;
    }

    @Override
    public Map<String, Object> getDesignProcess(String questionCode) {
        Question question = findQuestionByCode(questionCode);
        AiDesignProcess process = designProcessMapper.selectOne(new LambdaQueryWrapper<AiDesignProcess>()
                .eq(AiDesignProcess::getQuestionId, question.getId()));
        Map<String, Object> result = new HashMap<>();
        if (process == null) {
            result.put("exists", false);
            result.put("message", "not found");
            return result;
        }
        result.put("exists", true);
        result.put("data", toDesignProcessData(process));
        return result;
    }

    @Override
    public Map<String, Object> testConnection(Integer apiIndex) {
        int index = apiIndex == null ? 0 : apiIndex;
        Map<String, Object> result = new HashMap<>();
        try {
            ApiConfig config = resolveConfigByIndex(index);
            String content = callChatCompletion(config, "You are a helpful assistant.", "Hello, this is a connection test.");
            Map<String, Object> data = new HashMap<>();
            data.put("apiIndex", index);
            data.put("apiConfigName", config.getName());
            data.put("snippet", content.length() > 160 ? content.substring(0, 160) : content);
            result.put("success", true);
            result.put("message", "connection success");
            result.put("data", data);
        } catch (Exception ex) {
            result.put("success", false);
            result.put("message", ex.getMessage());
            result.put("data", null);
        }
        return result;
    }

    @Override
    public int clearExplanations() { return explanationMapper.delete(new QueryWrapper<>()); }

    @Override
    public int clearErrorAnalyses() { return errorAnalysisMapper.delete(new QueryWrapper<>()); }

    @Override
    public int clearVariants() { return variantMapper.delete(new QueryWrapper<>()); }

    private Question findQuestionByCode(String code) {
        Question question = questionMapper.selectOne(new LambdaQueryWrapper<Question>().eq(Question::getQuestionCode, code));
        if (question == null) {
            throw new BusinessException(40404, "question not found");
        }
        return question;
    }

    private String buildOptionsText(Long questionId) {
        List<QuestionOption> options = questionOptionMapper.selectList(new LambdaQueryWrapper<QuestionOption>()
                .eq(QuestionOption::getQuestionId, questionId)
                .orderByAsc(QuestionOption::getSortOrder));
        if (options.isEmpty()) {
            return "(无选项)";
        }
        StringBuilder sb = new StringBuilder();
        for (QuestionOption option : options) {
            sb.append(option.getOptionKey()).append(". ").append(option.getOptionText()).append("\n");
        }
        return sb.toString();
    }

    private ApiConfig resolveConfigBySettingKey(String settingKey, int defaultIndex) {
        int index = readIntSetting(settingKey, defaultIndex);
        return resolveConfigByIndex(index);
    }

    private ApiConfig resolveConfigByIndex(int index) {
        List<ApiConfig> configs = apiConfigMapper.selectList(new QueryWrapper<ApiConfig>().orderByAsc("id"));
        if (configs.isEmpty()) {
            throw new BusinessException(40040, "no api config found");
        }
        if (index < 0 || index >= configs.size()) {
            throw new BusinessException(40041, "api config index out of range: " + index);
        }
        ApiConfig config = configs.get(index);
        if (Boolean.FALSE.equals(config.getEnabled())) {
            throw new BusinessException(40042, "api config is disabled: " + index);
        }
        if (!StringUtils.hasText(config.getApiUrl())) {
            throw new BusinessException(40043, "api url is empty");
        }
        if (!StringUtils.hasText(config.getApiKeyCipher())) {
            throw new BusinessException(40044, "api key is empty");
        }
        return config;
    }

    private int readIntSetting(String key, int defaultValue) {
        AppSetting setting = appSettingMapper.selectOne(new LambdaQueryWrapper<AppSetting>().eq(AppSetting::getSettingKey, key));
        if (setting == null || !StringUtils.hasText(setting.getSettingValueJson())) {
            return defaultValue;
        }
        String raw = setting.getSettingValueJson().trim();
        try {
            JsonNode node = objectMapper.readTree(raw);
            if (node.isNumber()) {
                return node.asInt();
            }
            if (node.isObject() && node.get("value") != null && node.get("value").isNumber()) {
                return node.get("value").asInt();
            }
        } catch (Exception ignored) {
        }
        try {
            return Integer.parseInt(raw);
        } catch (Exception ignored) {
            return defaultValue;
        }
    }

    private String callChatCompletion(ApiConfig config, String systemPrompt, String userPrompt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", StringUtils.hasText(config.getModel()) ? config.getModel() : "Qwen/Qwen2.5-7B-Instruct");
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(message("system", systemPrompt));
        messages.add(message("user", userPrompt));
        payload.put("messages", messages);
        payload.put("stream", false);
        payload.put("max_tokens", config.getMaxTokens() == null ? 4096 : config.getMaxTokens());
        payload.put("temperature", 0.7);

        try {
            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(config.getApiUrl()))
                    .header("Authorization", "Bearer " + config.getApiKeyCipher())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(20))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(50031, "api error status " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || !StringUtils.hasText(contentNode.asText())) {
                throw new BusinessException(50032, "api response has no message content");
            }
            return contentNode.asText();
        } catch (BusinessException ex) {
            throw ex;
        } catch (IOException | InterruptedException ex) {
            throw new BusinessException(50033, "api request failed: " + ex.getMessage());
        }
    }

    private String normalizeJsonPayload(String raw, String payloadType) {
        JsonNode node = extractJsonNode(raw);
        if (node != null) {
            try {
                return objectMapper.writeValueAsString(node);
            } catch (JsonProcessingException e) {
                throw new BusinessException(50034, "serialize json payload failed: " + e.getMessage());
            }
        }
        ObjectNode fallback = objectMapper.createObjectNode();
        fallback.put("payloadType", payloadType);
        fallback.put("rawText", raw);
        try {
            return objectMapper.writeValueAsString(fallback);
        } catch (JsonProcessingException e) {
            throw new BusinessException(50035, "serialize fallback payload failed: " + e.getMessage());
        }
    }

    private JsonNode extractJsonNode(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String text = raw.trim();
        try {
            return objectMapper.readTree(text);
        } catch (Exception ignored) {
        }

        int objStart = text.indexOf('{');
        int objEnd = text.lastIndexOf('}');
        if (objStart >= 0 && objEnd > objStart) {
            try {
                return objectMapper.readTree(text.substring(objStart, objEnd + 1));
            } catch (Exception ignored) {
            }
        }

        int arrStart = text.indexOf('[');
        int arrEnd = text.lastIndexOf(']');
        if (arrStart >= 0 && arrEnd > arrStart) {
            try {
                return objectMapper.readTree(text.substring(arrStart, arrEnd + 1));
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private JsonNode parsePayloadNode(String payloadJson) {
        if (!StringUtils.hasText(payloadJson)) {
            return null;
        }
        try {
            return objectMapper.readTree(payloadJson);
        } catch (Exception ex) {
            return null;
        }
    }

    private Map<String, Object> toExplanationData(AiExplanation entity) {
        Map<String, Object> data = new HashMap<>();
        data.put("questionId", findQuestionCodeById(entity.getQuestionId()));
        data.put("content", entity.getContent());
        data.put("generatedAt", entity.getGeneratedAt());
        data.put("apiConfigId", entity.getApiConfigId());
        return data;
    }

    private Map<String, Object> toErrorData(AiErrorAnalysis entity) {
        Map<String, Object> data = new HashMap<>();
        data.put("questionId", findQuestionCodeById(entity.getQuestionId()));
        data.put("userAnswer", entity.getUserAnswer());
        data.put("content", entity.getContent());
        data.put("generatedAt", entity.getGeneratedAt());
        data.put("apiConfigId", entity.getApiConfigId());
        return data;
    }

    private Map<String, Object> toVariantData(AiVariantQuestion entity) {
        Map<String, Object> data = new HashMap<>();
        data.put("questionId", findQuestionCodeById(entity.getQuestionId()));
        data.put("generatedAt", entity.getGeneratedAt());
        data.put("payload", parsePayloadAsObject(entity.getVariantPayloadJson()));
        return data;
    }

    private Map<String, Object> toKnowledgeTreeData(AiKnowledgeTree entity) {
        Map<String, Object> data = new HashMap<>();
        data.put("questionId", findQuestionCodeById(entity.getQuestionId()));
        data.put("generatedAt", entity.getGeneratedAt());
        data.put("payload", parsePayloadAsObject(entity.getTreePayloadJson()));
        return data;
    }

    private Map<String, Object> toDesignProcessData(AiDesignProcess entity) {
        Map<String, Object> data = new HashMap<>();
        data.put("questionId", findQuestionCodeById(entity.getQuestionId()));
        data.put("generatedAt", entity.getGeneratedAt());
        data.put("payload", parsePayloadAsObject(entity.getProcessPayloadJson()));
        return data;
    }

    private Object parsePayloadAsObject(String json) {
        if (!StringUtils.hasText(json)) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            if (node.isObject()) {
                return objectMapper.convertValue(node, new TypeReference<Map<String, Object>>() {});
            }
            if (node.isArray()) {
                return objectMapper.convertValue(node, new TypeReference<List<Object>>() {});
            }
            return node.asText();
        } catch (Exception ex) {
            return json;
        }
    }

    private String findQuestionCodeById(Long id) {
        if (id == null) {
            return null;
        }
        Question question = questionMapper.selectById(id);
        return question == null ? null : question.getQuestionCode();
    }

    private String readText(JsonNode node, String key, String defaultValue) {
        if (node == null || !node.has(key) || node.get(key).isNull()) {
            return defaultValue;
        }
        String value = node.get(key).asText();
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    private Map<String, String> message(String role, String content) {
        Map<String, String> map = new HashMap<>();
        map.put("role", role);
        map.put("content", content);
        return map;
    }

    private String nullSafe(String value) { return value == null ? "" : value; }
}
