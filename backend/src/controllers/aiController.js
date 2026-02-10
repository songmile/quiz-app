const Question = require('../models/Question');
const AIExplanation = require('../models/AIExplanation');
const ErrorAnalysis = require('../models/ErrorAnalysis');
const VariantQuestion = require('../models/VariantQuestion');
const KnowledgeTree = require('../models/KnowledgeTree');
const DesignProcess = require('../models/DesignProcess');
const Settings = require('../models/Settings');
const { AppError } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');

/**
 * 生成题目的AI解析
 * @route POST /api/ai/explanation/:questionId
 */
const generateExplanation = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询题目是否存在
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否已有解析
  const existingExplanation = await AIExplanation.findOne({ questionId });
  if (existingExplanation && !req.query.force) {
    return res.status(200).json({
      status: 'success',
      message: '已存在解析',
      data: existingExplanation
    });
  }

  // 启动异步生成解析
  aiService.generateExplanationAsync(question);

  res.status(202).json({
    status: 'success',
    message: 'AI解析生成已启动',
    questionId
  });
};

/**
 * 获取题目的AI解析
 * @route GET /api/ai/explanation/:questionId
 */
const getExplanation = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询解析
  const explanation = await AIExplanation.findOne({ questionId });
  
  if (!explanation) {
    // 检查题目是否存在
    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      throw new AppError('未找到题目', 404);
    }
    
    // 返回解析未找到，但不报错
    return res.status(200).json({
      status: 'success',
      message: '未找到AI解析',
      exists: false
    });
  }

  res.status(200).json({
    status: 'success',
    exists: true,
    data: explanation
  });
};

/**
 * 生成错误分析
 * @route POST /api/ai/error-analysis/:questionId
 */
const generateErrorAnalysis = async (req, res) => {
  const { questionId } = req.params;
  const { userAnswer } = req.body;
  
  if (!userAnswer) {
    throw new AppError('请提供用户答案', 400);
  }
  
  // 查询题目是否存在
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否已有这个错误答案的分析
  const existingAnalysis = await ErrorAnalysis.findOne({ 
    questionId, 
    userAnswer 
  });
  
  if (existingAnalysis && !req.query.force) {
    return res.status(200).json({
      status: 'success',
      message: '已存在错误分析',
      data: existingAnalysis
    });
  }

  // 启动异步生成错误分析
  aiService.generateErrorAnalysisAsync(question, userAnswer);

  res.status(202).json({
    status: 'success',
    message: '错误分析生成已启动',
    questionId,
    userAnswer
  });
};

/**
 * 获取错误分析
 * @route GET /api/ai/error-analysis/:questionId
 */
const getErrorAnalysis = async (req, res) => {
  const { questionId } = req.params;
  const { userAnswer } = req.query;
  
  // 构建查询条件
  const query = { questionId };
  if (userAnswer) {
    query.userAnswer = userAnswer;
  }
  
  // 查询错误分析
  const analyses = await ErrorAnalysis.find(query).sort({ generatedAt: -1 });
  
  if (analyses.length === 0) {
    // 检查题目是否存在
    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      throw new AppError('未找到题目', 404);
    }
    
    // 返回分析未找到，但不报错
    return res.status(200).json({
      status: 'success',
      message: '未找到错误分析',
      exists: false
    });
  }

  // 如果提供了特定userAnswer，返回单个分析，否则返回所有分析
  if (userAnswer && analyses.length > 0) {
    return res.status(200).json({
      status: 'success',
      exists: true,
      data: analyses[0]
    });
  }

  res.status(200).json({
    status: 'success',
    exists: true,
    count: analyses.length,
    data: analyses
  });
};

/**
 * 生成变种题
 * @route POST /api/ai/variant/:questionId
 */
const generateVariant = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询题目是否存在
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否已有变种题
  const existingVariant = await VariantQuestion.findOne({ originalQuestionId: questionId });
  if (existingVariant && !req.query.force) {
    return res.status(200).json({
      status: 'success',
      message: '已存在变种题',
      data: existingVariant
    });
  }

  // 启动异步生成变种题
  aiService.generateVariantAsync(question);

  res.status(202).json({
    status: 'success',
    message: '变种题生成已启动',
    questionId
  });
};

/**
 * 获取变种题
 * @route GET /api/ai/variant/:questionId
 */
const getVariant = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询变种题
  const variant = await VariantQuestion.findOne({ originalQuestionId: questionId });
  
  if (!variant) {
    // 检查题目是否存在
    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      throw new AppError('未找到题目', 404);
    }
    
    // 返回变种题未找到，但不报错
    return res.status(200).json({
      status: 'success',
      message: '未找到变种题',
      exists: false
    });
  }

  res.status(200).json({
    status: 'success',
    exists: true,
    data: variant
  });
};

/**
 * 添加变种题到题库
 * @route POST /api/ai/variant/:questionId/add
 */
const addVariantToQuestions = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询变种题
  const variant = await VariantQuestion.findOne({ originalQuestionId: questionId });
  
  if (!variant) {
    throw new AppError('未找到变种题', 404);
  }

  // 将变种题添加到题库
  const newQuestion = await aiService.addVariantToQuestions(variant);

  res.status(201).json({
    status: 'success',
    message: '变种题已添加到题库',
    data: newQuestion
  });
};

/**
 * 生成知识树
 * @route POST /api/ai/knowledge-tree/:questionId
 */
const generateKnowledgeTree = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询题目是否存在
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否已有知识树
  const existingTree = await KnowledgeTree.findOne({ questionId });
  if (existingTree && !req.query.force) {
    return res.status(200).json({
      status: 'success',
      message: '已存在知识树',
      data: existingTree
    });
  }

  // 启动异步生成知识树
  aiService.generateKnowledgeTreeAsync(question);

  res.status(202).json({
    status: 'success',
    message: '知识树生成已启动',
    questionId
  });
};

/**
 * 获取知识树
 * @route GET /api/ai/knowledge-tree/:questionId
 */
const getKnowledgeTree = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询知识树
  const tree = await KnowledgeTree.findOne({ questionId });
  
  if (!tree) {
    // 检查题目是否存在
    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      throw new AppError('未找到题目', 404);
    }
    
    // 返回知识树未找到，但不报错
    return res.status(200).json({
      status: 'success',
      message: '未找到知识树',
      exists: false
    });
  }

  res.status(200).json({
    status: 'success',
    exists: true,
    data: tree
  });
};

/**
 * 生成设计流程
 * @route POST /api/ai/design-process/:questionId
 */
const generateDesignProcess = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询题目是否存在
  const question = await Question.findOne({ id: questionId });
  
  if (!question) {
    throw new AppError('未找到题目', 404);
  }

  // 检查是否已有设计流程
  const existingProcess = await DesignProcess.findOne({ questionId });
  if (existingProcess && !req.query.force) {
    return res.status(200).json({
      status: 'success',
      message: '已存在设计流程',
      data: existingProcess
    });
  }

  // 启动异步生成设计流程
  aiService.generateDesignProcessAsync(question);

  res.status(202).json({
    status: 'success',
    message: '设计流程生成已启动',
    questionId
  });
};

/**
 * 获取设计流程
 * @route GET /api/ai/design-process/:questionId
 */
const getDesignProcess = async (req, res) => {
  const { questionId } = req.params;
  
  // 查询设计流程
  const process = await DesignProcess.findOne({ questionId });
  
  if (!process) {
    // 检查题目是否存在
    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      throw new AppError('未找到题目', 404);
    }
    
    // 返回设计流程未找到，但不报错
    return res.status(200).json({
      status: 'success',
      message: '未找到设计流程',
      exists: false
    });
  }

  res.status(200).json({
    status: 'success',
    exists: true,
    data: process
  });
};

/**
 * 测试API连接
 * @route POST /api/ai/test-connection
 */
const testApiConnection = async (req, res) => {
  const { apiIndex = 0 } = req.body;
  
  // 获取API配置
  const settings = await Settings.findOne();
  
  if (!settings || !settings.api_configs || apiIndex >= settings.api_configs.length) {
    throw new AppError('API配置不存在', 404);
  }

  const apiConfig = settings.api_configs[apiIndex];
  
  // 测试API连接
  const result = await aiService.testApiConnection(apiConfig);

  res.status(200).json({
    status: result.success ? 'success' : 'fail',
    message: result.message,
    data: result.data
  });
};

/**
 * 清除所有AI解析
 * @route DELETE /api/ai/explanations
 */
const clearExplanations = async (req, res) => {
  // 删除所有AI解析
  const result = await AIExplanation.deleteMany({});

  res.status(200).json({
    status: 'success',
    message: '所有AI解析已清除',
    count: result.deletedCount
  });
};

/**
 * 清除所有错误分析
 * @route DELETE /api/ai/error-analyses
 */
const clearErrorAnalyses = async (req, res) => {
  // 删除所有错误分析
  const result = await ErrorAnalysis.deleteMany({});

  res.status(200).json({
    status: 'success',
    message: '所有错误分析已清除',
    count: result.deletedCount
  });
};

/**
 * 清除所有变种题
 * @route DELETE /api/ai/variants
 */
const clearVariants = async (req, res) => {
  // 删除所有变种题
  const result = await VariantQuestion.deleteMany({});

  res.status(200).json({
    status: 'success',
    message: '所有变种题已清除',
    count: result.deletedCount
  });
};

module.exports = {
  generateExplanation,
  getExplanation,
  generateErrorAnalysis,
  getErrorAnalysis,
  generateVariant,
  getVariant,
  addVariantToQuestions,
  generateKnowledgeTree,
  getKnowledgeTree,
  generateDesignProcess,
  getDesignProcess,
  testApiConnection,
  clearExplanations,
  clearErrorAnalyses,
  clearVariants
};