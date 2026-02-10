const Question = require('../models/Question');
const AIExplanation = require('../models/AIExplanation');
const ErrorAnalysis = require('../models/ErrorAnalysis');
const VariantQuestion = require('../models/VariantQuestion');
const KnowledgeTree = require('../models/KnowledgeTree');
const DesignProcess = require('../models/DesignProcess');
const Settings = require('../models/Settings');
const apiManager = require('../utils/apiManager');
const { generateUniqueId, safeJsonParse, extractJsonFromText } = require('../utils/helpers');
const axios = require('axios');

/**
 * 异步生成AI解析
 * @param {Object} question 题目对象
 */
const generateExplanationAsync = async (question) => {
  try {
    // 获取设置
    const settings = await Settings.findOne();
    const apiIndex = settings?.explanation_api_index || 0;
    
    // 构建系统提示词
    const systemPrompt = `
你是一位专业的教育助手，需要为学习者提供清晰、易懂的题目解析。请遵循以下格式提供解析：

关键概念：列出题目涉及的核心概念和知识点
解析解释：用通俗易懂的语言解释答案，帮助学习者理解题目
知识扩展：简要提供相关知识点的扩展或应用场景
请确保解析清晰、准确，避免过于复杂的术语，用大白话讲解复杂概念。
`;

    // 准备提示内容
    const questionText = question.text || '';
    let optionsText = '';
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        optionsText += `${option.letter || ''}、${option.text || ''}\n`;
      }
    }
    
    const correctAnswer = question.answer || '';
    
    const userPrompt = `
请为以下题目提供解析：

题目类型：${question.type || '未知类型'}
题目内容：${questionText}
选项：
${optionsText}
正确答案：${correctAnswer}

请提供关键概念、详细解析和知识扩展，用大白话解释这道题。
`;

    // 准备请求数据
    const payload = {
      model: settings?.api_configs[apiIndex]?.model || "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: false,
      max_tokens: settings?.api_configs[apiIndex]?.max_tokens || 4096,
      temperature: 0.7,
    };
    
    // 创建请求ID
    const requestId = `explanation_${question.id}_${Date.now()}`;
    
    // 发送请求
    apiManager.addRequest(requestId, payload, 
      (reqId, result) => handleExplanationResult(reqId, result, question.id, apiIndex),
      apiIndex
    );
    
    console.log(`AI解析生成请求已发送，题目ID: ${question.id}`);
    return true;
  } catch (error) {
    console.error(`AI解析生成失败: ${error.message}`);
    return false;
  }
};

/**
 * 处理AI解析结果
 * @param {String} requestId 请求ID
 * @param {Object} result API结果
 * @param {String} questionId 题目ID
 * @param {Number} apiIndex 使用的API索引
 */
const handleExplanationResult = async (requestId, result, questionId, apiIndex) => {
  try {
    if (result.error) {
      console.error(`AI解析API错误: ${result.error}`);
      return;
    }
    
    // 获取生成的内容
    if (result.choices && result.choices.length > 0) {
      const explanation = result.choices[0]?.message?.content || '';
      
      // 检查是否已存在解析
      const existingExplanation = await AIExplanation.findOne({ questionId });
      
      if (existingExplanation) {
        // 更新现有解析
        existingExplanation.explanation = explanation;
        existingExplanation.apiIndex = apiIndex;
        existingExplanation.generatedAt = new Date();
        await existingExplanation.save();
      } else {
        // 创建新解析
        await AIExplanation.create({
          questionId,
          explanation,
          apiIndex,
          generatedAt: new Date()
        });
      }
      
      console.log(`AI解析已生成并保存，题目ID: ${questionId}`);
    }
  } catch (error) {
    console.error(`处理AI解析结果失败: ${error.message}`);
  }
};

/**
 * 异步生成错误分析
 * @param {Object} question 题目对象
 * @param {String} userAnswer 用户答案
 */
const generateErrorAnalysisAsync = async (question, userAnswer) => {
  try {
    // 获取设置
    const settings = await Settings.findOne();
    const apiIndex = settings?.explanation_api_index || 0;
    
    // 构建系统提示词
    const systemPrompt = `
你是一位专业的教育分析师，需要分析学习者的错误，找出易错点和难点。请按照以下格式提供分析：

错误类型：分析这个错误属于哪种类型（如概念混淆、细节遗漏、理解偏差等）
易错原因：分析为什么学习者容易在这个题目上犯错
知识盲点：指出可能存在的知识盲点或误解
改进建议：提供具体的学习建议，帮助克服这个难点

请确保分析深入、具体，直击错误本质，避免空泛的建议。针对不同题型（单选、多选、判断、填空）提供相应的分析策略。
`;

    // 准备提示内容
    const questionText = question.text || '';
    let optionsText = '';
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        optionsText += `${option.letter || ''}、${option.text || ''}\n`;
      }
    }
    
    const correctAnswer = question.answer || '';
    
    const userPrompt = `
请分析以下题目的错误：

题目类型：${question.type || '未知类型'}
题目内容：${questionText}
选项：
${optionsText}
正确答案：${correctAnswer}
学生答案：${userAnswer}

请分析这个错误的原因、难点和易错点，并提供针对性的学习建议。
`;

    // 准备请求数据
    const payload = {
      model: settings?.api_configs[apiIndex]?.model || "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: false,
      max_tokens: settings?.api_configs[apiIndex]?.max_tokens || 4096,
      temperature: 0.7,
    };
    
    // 创建请求ID
    const requestId = `error_analysis_${question.id}_${userAnswer}_${Date.now()}`;
    
    // 发送请求
    apiManager.addRequest(requestId, payload, 
      (reqId, result) => handleErrorAnalysisResult(reqId, result, question.id, userAnswer, apiIndex),
      apiIndex
    );
    
    console.log(`错误分析生成请求已发送，题目ID: ${question.id}, 用户答案: ${userAnswer}`);
    return true;
  } catch (error) {
    console.error(`错误分析生成失败: ${error.message}`);
    return false;
  }
};

/**
 * 处理错误分析结果
 * @param {String} requestId 请求ID
 * @param {Object} result API结果
 * @param {String} questionId 题目ID
 * @param {String} userAnswer 用户答案
 * @param {Number} apiIndex 使用的API索引
 */
const handleErrorAnalysisResult = async (requestId, result, questionId, userAnswer, apiIndex) => {
  try {
    if (result.error) {
      console.error(`错误分析API错误: ${result.error}`);
      return;
    }
    
    // 获取生成的内容
    if (result.choices && result.choices.length > 0) {
      const analysis = result.choices[0]?.message?.content || '';
      
      // 检查是否已存在相同题目和答案的分析
      const existingAnalysis = await ErrorAnalysis.findOne({ 
        questionId, 
        userAnswer 
      });
      
      if (existingAnalysis) {
        // 更新现有分析
        existingAnalysis.analysis = analysis;
        existingAnalysis.apiIndex = apiIndex;
        existingAnalysis.generatedAt = new Date();
        await existingAnalysis.save();
      } else {
        // 创建新分析
        await ErrorAnalysis.create({
          questionId,
          userAnswer,
          analysis,
          apiIndex,
          generatedAt: new Date()
        });
      }
      
      console.log(`错误分析已生成并保存，题目ID: ${questionId}, 用户答案: ${userAnswer}`);
    }
  } catch (error) {
    console.error(`处理错误分析结果失败: ${error.message}`);
  }
};

/**
 * 异步生成变种题
 * @param {Object} question 题目对象
 */
const generateVariantAsync = async (question) => {
  try {
    // 获取设置
    const settings = await Settings.findOne();
    const apiIndex = settings?.explanation_api_index || 0;
    
    // 构建系统提示词
    const systemPrompt = `
你是一位专业的题库设计师，需要为学习者创建变种题目，帮助巩固知识点。请根据原题目，创建一道难度相当但不完全相同的变种题目。

变种题目应该：
1. 测试相同的核心知识点
2. 使用不同的表述或情境
3. 保持相似的难度级别
4. 设计合理的干扰项（选择题）
5. 提供详细的答案解析

请以JSON格式返回变种题：
{
  "type": "题目类型",
  "text": "题目内容",
  "options": [
    {"letter": "A", "text": "选项A内容"},
    {"letter": "B", "text": "选项B内容"}
  ],
  "answer": "正确答案",
  "explanation": "答案解析",
  "relation": "与原题的关系说明"
}
`;

    // 准备提示内容
    const questionText = question.text || '';
    let optionsText = '';
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        optionsText += `${option.letter || ''}、${option.text || ''}\n`;
      }
    }
    
    const correctAnswer = question.answer || '';
    const explanation = question.explanation || '';
    
    const userPrompt = `
请为以下题目创建一道变种题：

题目类型：${question.type || '未知类型'}
题目内容：${questionText}
选项：
${optionsText}
正确答案：${correctAnswer}
解析：${explanation}

请创建一道测试相同知识点但表述不同的变种题，返回JSON格式的结果。
`;

    // 准备请求数据
    const payload = {
      model: settings?.api_configs[apiIndex]?.model || "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: false,
      max_tokens: settings?.api_configs[apiIndex]?.max_tokens || 4096,
      temperature: 0.7,
    };
    
    // 创建请求ID
    const requestId = `variant_${question.id}_${Date.now()}`;
    
    // 发送请求
    apiManager.addRequest(requestId, payload, 
      (reqId, result) => handleVariantResult(reqId, result, question.id, apiIndex),
      apiIndex
    );
    
    console.log(`变种题生成请求已发送，题目ID: ${question.id}`);
    return true;
  } catch (error) {
    console.error(`变种题生成失败: ${error.message}`);
    return false;
  }
};

/**
 * 处理变种题结果
 * @param {String} requestId 请求ID
 * @param {Object} result API结果
 * @param {String} questionId 题目ID
 * @param {Number} apiIndex 使用的API索引
 */
const handleVariantResult = async (requestId, result, questionId, apiIndex) => {
  try {
    if (result.error) {
      console.error(`变种题API错误: ${result.error}`);
      return;
    }
    
    // 获取生成的内容
    if (result.choices && result.choices.length > 0) {
      const variantText = result.choices[0]?.message?.content || '';
      
      // 提取JSON
      const jsonText = extractJsonFromText(variantText);
      let variantData = null;
      
      try {
        // 尝试解析JSON
        variantData = safeJsonParse(jsonText);
      } catch (error) {
        console.error(`变种题JSON解析失败: ${error.message}`);
      }
      
      // 检查是否已存在变种题
      const existingVariant = await VariantQuestion.findOne({ 
        originalQuestionId: questionId 
      });
      
      if (existingVariant) {
        // 如果成功解析为JSON
        if (variantData && typeof variantData === 'object') {
          // 更新变种题数据
          existingVariant.type = variantData.type || existingVariant.type;
          existingVariant.text = variantData.text || existingVariant.text;
          existingVariant.options = variantData.options || existingVariant.options;
          existingVariant.answer = variantData.answer || existingVariant.answer;
          existingVariant.explanation = variantData.explanation || existingVariant.explanation;
          existingVariant.relation = variantData.relation || existingVariant.relation;
        }
        
        // 不管是否成功解析，都保存原始内容
        existingVariant.rawContent = variantText;
        existingVariant.apiIndex = apiIndex;
        existingVariant.generatedAt = new Date();
        await existingVariant.save();
      } else {
        // 创建新变种题
        if (variantData && typeof variantData === 'object') {
          // 创建结构化的变种题
          await VariantQuestion.create({
            originalQuestionId: questionId,
            type: variantData.type || '未知类型',
            text: variantData.text || '',
            options: variantData.options || [],
            answer: variantData.answer || '',
            explanation: variantData.explanation || '',
            relation: variantData.relation || '',
            rawContent: variantText,
            apiIndex,
            generatedAt: new Date()
          });
        } else {
          // 如果解析失败，保存原始文本
          await VariantQuestion.create({
            originalQuestionId: questionId,
            rawContent: variantText,
            apiIndex,
            generatedAt: new Date()
          });
        }
      }
      
      console.log(`变种题已生成并保存，题目ID: ${questionId}`);
    }
  } catch (error) {
    console.error(`处理变种题结果失败: ${error.message}`);
  }
};

/**
 * 将变种题添加到题库
 * @param {Object} variant 变种题对象
 * @returns {Promise<Object>} 新题目
 */
const addVariantToQuestions = async (variant) => {
  // 检查变种题是否有必要的字段
  if (!variant.text || !variant.type || !variant.answer) {
    throw new Error('变种题缺少必要字段');
  }
  
  // 创建新题目
  const newQuestion = await Question.create({
    id: generateUniqueId(),
    type: variant.type,
    text: variant.text,
    options: variant.options || [],
    answer: variant.answer,
    explanation: variant.explanation || ''
  });
  
  return newQuestion;
};

/**
 * 异步生成知识树
 * @param {Object} question 题目对象
 */
const generateKnowledgeTreeAsync = async (question) => {
  try {
    // 获取设置
    const settings = await Settings.findOne();
    const apiIndex = settings?.knowledge_tree_api_index || 2; // 默认使用专门的知识树API
    
    // 构建系统提示词
    const systemPrompt = `
你是一位专业的知识图谱生成专家，需要分析问题中隐含的知识体系，并生成一个清晰的知识树。

请分析以下问题，确定其核心知识点，然后创建一个知识树，展示该知识点在整个知识体系中的位置。
知识树应该：
1. 从领域的顶层概念开始
2. 逐步细化到问题中的具体知识点
3. 显示知识点之间的层级和关联关系
4. 明确标记出题目直接相关的知识点

返回格式要求：
1. 以JSON格式返回，包含树状结构和节点属性
2. 每个节点都有唯一ID、名称、描述、层级和是否为核心知识点的标记
3. 使用children数组表示子节点
4. 为不同层级的节点提供建议的颜色代码

格式示例：
{
  "root": {
    "id": "root",
    "name": "Spring框架",
    "description": "企业级Java应用程序开发框架",
    "level": 0,
    "is_core": false,
    "color": "#CCCCCC",
    "children": [
      {
        "id": "node1",
        "name": "Spring Boot",
        "description": "简化Spring应用开发的框架",
        "level": 1,
        "is_core": false,
        "color": "#AAAAAA",
        "children": []
      },
      {
        "id": "node2",
        "name": "自动配置",
        "description": "Spring Boot的核心特性",
        "level": 1,
        "is_core": true,
        "color": "#FF5733",
        "children": []
      }
    ]
  }
}

请确保生成的知识树既深入又宽广，能够帮助学习者理解该知识点在整个知识体系中的位置和重要性。
核心知识点请使用醒目的颜色（如红色#FF5733），非核心知识点可以使用渐变色来表示层级关系。
`;

    // 准备提示内容
    const questionText = question.text || '';
    let optionsText = '';
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        optionsText += `${option.letter || ''}、${option.text || ''}\n`;
      }
    }
    
    const correctAnswer = question.answer || '';
    const explanation = question.explanation || '';
    
    const userPrompt = `
请为以下题目生成知识树：

题目类型：${question.type || '未知类型'}
题目内容：${questionText}
选项：
${optionsText}
正确答案：${correctAnswer}
解析：${explanation}

请分析这道题目所考察的核心知识点，并在整个知识体系中定位它的位置，生成一个完整的知识树。
请确保返回的是有效的JSON格式，包含完整的树状结构和必要的节点属性。
`;

    // 准备请求数据
    const payload = {
      model: settings?.api_configs[apiIndex]?.model || "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: false,
      max_tokens: settings?.api_configs[apiIndex]?.max_tokens || 4096,
      temperature: 0.7,
    };
    
    // 创建请求ID
    const requestId = `knowledge_tree_${question.id}_${Date.now()}`;
    
    // 发送请求
    apiManager.addRequest(requestId, payload, 
      (reqId, result) => handleKnowledgeTreeResult(reqId, result, question.id, apiIndex),
      apiIndex
    );
    
    console.log(`知识树生成请求已发送，题目ID: ${question.id}`);
    return true;
  } catch (error) {
    console.error(`知识树生成失败: ${error.message}`);
    return false;
  }
};

/**
 * 处理知识树结果
 * @param {String} requestId 请求ID
 * @param {Object} result API结果
 * @param {String} questionId 题目ID
 * @param {Number} apiIndex 使用的API索引
 */
const handleKnowledgeTreeResult = async (requestId, result, questionId, apiIndex) => {
  try {
    if (result.error) {
      console.error(`知识树API错误: ${result.error}`);
      return;
    }
    
    // 获取生成的内容
    if (result.choices && result.choices.length > 0) {
      const treeText = result.choices[0]?.message?.content || '';
      
      // 提取JSON
      const jsonText = extractJsonFromText(treeText);
      let treeData = null;
      
      try {
        // 尝试解析JSON
        treeData = safeJsonParse(jsonText);
      } catch (error) {
        console.error(`知识树JSON解析失败: ${error.message}`);
      }
      
      // 检查是否已存在知识树
      const existingTree = await KnowledgeTree.findOne({ questionId });
      
      if (existingTree) {
        // 如果成功解析为JSON
        if (treeData && typeof treeData === 'object') {
          // 更新知识树数据
          existingTree.treeData = treeData;
        }
        
        // 不管是否成功解析，都保存原始内容
        existingTree.rawText = treeText;
        existingTree.apiIndex = apiIndex;
        existingTree.generatedAt = new Date();
        await existingTree.save();
      } else {
        // 创建新知识树
        await KnowledgeTree.create({
          questionId,
          treeData: treeData || {},
          rawText: treeText,
          apiIndex,
          generatedAt: new Date()
        });
      }
      
      console.log(`知识树已生成并保存，题目ID: ${questionId}`);
    }
  } catch (error) {
    console.error(`处理知识树结果失败: ${error.message}`);
  }
};

/**
 * 异步生成设计流程
 * @param {Object} question 题目对象
 */
const generateDesignProcessAsync = async (question) => {
  try {
    // 获取设置
    const settings = await Settings.findOne();
    const apiIndex = settings?.design_process_api_index || 3; // 默认使用专门的设计流程API
    
    // 构建系统提示词
    const systemPrompt = `
你是一位专业的考题设计分析专家，需要详细解析题目的设计思路、选项构造逻辑，并生成一个完整的流程图。

请分析以下题目，揭示其设计过程，特别关注：
1. 题目的核心测试点和设计意图
2. 正确选项的构造思路
3. 错误选项的设计思路（为什么这些选项看起来合理但实际上是错误的）
4. 如何通过选项设计来测试对知识点的真正理解
5. 题目描述的专业领域中的实际流程或过程

返回格式要求：
1. 以JSON格式返回，包含设计流程的各个步骤
2. 包含设计思路解析和流程图描述
3. 流程图要采用mermaid格式，使用flowchart或graph TD类型
4. 需要提供三个流程图，分别展示不同的角度：题目设计过程、解题思路、以及题目描述的专业领域实际流程

格式示例：
{
  "design_analysis": {
    "core_concept": "该题目主要考察的核心概念",
    "design_intent": "出题人设计此题的意图",
    "option_analysis": {
      "correct_option": {
        "logic": "为什么这个选项是正确的",
        "knowledge_point": "涉及的具体知识点"
      },
      "wrong_options": [
        {
          "option": "A",
          "trap_logic": "这个错误选项的设计逻辑",
          "common_misunderstanding": "反映了什么常见的误解"
        }
      ]
    }
  },
  "flowcharts": [
    {
      "title": "题目设计流程图",
      "description": "展示从知识点到题目构建的流程",
      "mermaid_code": "graph TD\\nA[确定核心知识点] --> B[设计题干]\\nB --> C[构造正确选项]\\nB --> D[设计干扰项]\\nC --> E[完成题目]\\nD --> E"
    },
    {
      "title": "解题思路流程图",
      "description": "展示正确解题的思考过程",
      "mermaid_code": "flowchart TD\\nA[理解题干] --> B{判断关键条件}\\nB -->|条件A| C[排除选项X]\\nB -->|条件B| D[确认选项Y]\\nC --> E[得出答案]\\nD --> E"
    },
    {
      "title": "专业领域实际流程图",
      "description": "展示题目和选项所描述的实际专业领域流程",
      "mermaid_code": "flowchart TD\\nA[起始步骤] --> B[处理步骤1]\\nB --> C[处理步骤2]\\nC --> D{决策点}\\nD -->|条件1| E[结果1]\\nD -->|条件2| F[结果2]"
    }
  ],
  "actual_process_flowcharts": [
    {
      "title": "专业领域实际流程图",
      "description": "展示题目和选项所描述的实际专业领域流程",
      "mermaid_code": "flowchart TD\\nA[起始步骤] --> B[处理步骤1]\\nB --> C[处理步骤2]\\nC --> D{决策点}\\nD -->|条件1| E[结果1]\\nD -->|条件2| F[结果2]"
    }
  ]
}

请确保流程图清晰、准确，能够直观地展示题目设计过程、解题思路和题目所描述的专业领域实际流程。
`;

    // 准备提示内容
    const questionText = question.text || '';
    let optionsText = '';
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        optionsText += `${option.letter || ''}、${option.text || ''}\n`;
      }
    }
    
    const correctAnswer = question.answer || '';
    const explanation = question.explanation || '';
    
    const userPrompt = `
请为以下题目生成详细的设计过程分析和流程图：

题目类型：${question.type || '未知类型'}
题目内容：${questionText}
选项：
${optionsText}
正确答案：${correctAnswer}
解析：${explanation}

请详细分析：
1. 这道题目想测试的核心知识点
2. 如何设计题干来测试这个知识点
3. 正确选项的构造逻辑
4. 每个错误选项的设计意图（为什么会吸引人选择它）
5. 完整的题目设计流程

请使用mermaid格式提供三个流程图：一个展示题目设计过程，一个展示解题思路，一个专业领域实际流程图。
请确保返回的是有效的JSON格式，包含完整的分析和流程图代码。
`;

    // 准备请求数据
    const payload = {
      model: settings?.api_configs[apiIndex]?.model || "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: false,
      max_tokens: settings?.api_configs[apiIndex]?.max_tokens || 4096,
      temperature: 0.7,
    };
    
    // 创建请求ID
    const requestId = `design_process_${question.id}_${Date.now()}`;
    
    // 发送请求
    apiManager.addRequest(requestId, payload, 
      (reqId, result) => handleDesignProcessResult(reqId, result, question.id, apiIndex),
      apiIndex
    );
    
    console.log(`设计流程生成请求已发送，题目ID: ${question.id}`);
    return true;
  } catch (error) {
    console.error(`设计流程生成失败: ${error.message}`);
    return false;
  }
};

/**
 * 处理设计流程结果
 * @param {String} requestId 请求ID
 * @param {Object} result API结果
 * @param {String} questionId 题目ID
 * @param {Number} apiIndex 使用的API索引
 */
const handleDesignProcessResult = async (requestId, result, questionId, apiIndex) => {
  try {
    if (result.error) {
      console.error(`设计流程API错误: ${result.error}`);
      return;
    }
    
    // 获取生成的内容
    if (result.choices && result.choices.length > 0) {
      const processText = result.choices[0]?.message?.content || '';
      
      // 提取JSON
      const jsonText = extractJsonFromText(processText);
      let processData = null;
      
      try {
        // 尝试解析JSON
        processData = safeJsonParse(jsonText);
      } catch (error) {
        console.error(`设计流程JSON解析失败: ${error.message}`);
      }
      
      // 提取流程图代码
      let flowcharts = [];
      if (processData && processData.flowcharts && Array.isArray(processData.flowcharts)) {
        flowcharts = processData.flowcharts.map(chart => ({
          title: chart.title || '',
          description: chart.description || '',
          mermaidCode: chart.mermaid_code || ''
        }));
      }
      
      // 检查是否已存在设计流程
      const existingProcess = await DesignProcess.findOne({ questionId });
      
      if (existingProcess) {
        // 如果成功解析为JSON
        if (processData && typeof processData === 'object') {
          // 更新设计流程数据
          existingProcess.processData = processData;
        }
        
        // 更新流程图
        if (flowcharts.length > 0) {
          existingProcess.flowcharts = flowcharts;
        }
        
        // 不管是否成功解析，都保存原始内容
        existingProcess.rawText = processText;
        existingProcess.apiIndex = apiIndex;
        existingProcess.generatedAt = new Date();
        await existingProcess.save();
      } else {
        // 创建新设计流程
        await DesignProcess.create({
          questionId,
          processData: processData || {},
          flowcharts,
          rawText: processText,
          apiIndex,
          generatedAt: new Date()
        });
      }
      
      console.log(`设计流程已生成并保存，题目ID: ${questionId}`);
    }
  } catch (error) {
    console.error(`处理设计流程结果失败: ${error.message}`);
  }
};

/**
 * 测试API连接
 * @param {Object} apiConfig API配置
 * @returns {Object} 测试结果
 */
const testApiConnection = async (apiConfig) => {
  try {
    if (!apiConfig.api_key) {
      return {
        success: false,
        message: 'API密钥为空',
        data: null
      };
    }
    
    // 准备一个简单的测试请求
    const payload = {
      model: apiConfig.model,
      messages: [
        {
          role: "user",
          content: "Hello, this is a test."
        }
      ],
      max_tokens: 100,
      stream: false,
      temperature: 0.7
    };
    
    // 准备请求头
    const headers = {
      "Authorization": `Bearer ${apiConfig.api_key}`,
      "Content-Type": "application/json"
    };
    
    // 发送请求
    console.log(`正在测试API连接: ${apiConfig.api_url}`);
    const startTime = new Date();
    
    const response = await axios.post(
      apiConfig.api_url,
      payload,
      {
        headers,
        timeout: 20000 // 20秒超时
      }
    );
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    // 检查响应
    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0]?.message?.content || '';
      
      return {
        success: true,
        message: `API连接成功，响应时间: ${duration.toFixed(2)}秒`,
        data: {
          duration,
          response: {
            status: response.status,
            content: content,
            model: response.data.model,
            usage: response.data.usage
          }
        }
      };
    } else {
      return {
        success: false,
        message: `API连接成功但响应格式不正确，状态码: ${response.status}`,
        data: {
          duration,
          response: response.data
        }
      };
    }
  } catch (error) {
    console.error(`API连接测试失败: ${error.message}`);
    
    // 格式化错误信息
    let errorMessage = `API连接失败: ${error.message}`;
    let errorData = null;
    
    if (error.response) {
      // 服务器返回了错误状态码
      errorMessage = `API错误: HTTP ${error.response.status}`;
      errorData = {
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // 请求发送了但没有收到响应
      errorMessage = '无法连接到API服务器，请检查URL和网络连接';
    }
    
    return {
      success: false,
      message: errorMessage,
      data: errorData
    };
  }
};

module.exports = {
  generateExplanationAsync,
  generateErrorAnalysisAsync,
  generateVariantAsync,
  addVariantToQuestions,
  generateKnowledgeTreeAsync,
  generateDesignProcessAsync,
  testApiConnection
};