const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');
const { generateUniqueId, parseQuestionsFromText } = require('../utils/helpers');
const questionService = require('../services/questionService');
const importService = require('../services/importService');

/**
 * 获取所有题目
 * @route GET /api/questions
 */
const getQuestions = async (req, res) => {
  // 支持分页
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  // 支持筛选
  const filter = {};
  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.search) {
    filter.text = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.bankId) {
    filter.bankId = req.query.bankId;
  }
  if (req.query.bankId === 'null') {
    filter.bankId = null;
  }
  if (req.query.tags) {
    filter.tags = { $in: req.query.tags.split(',') };
  }

  // 支持排序
  const sort = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy;
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sort[sortField] = sortOrder;
  } else {
    // 默认按创建时间排序
    sort.createdAt = -1;
  }

  // 查询总数
  const total = await Question.countDocuments(filter);

  // 查询题目
  const questions = await Question.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    count: questions.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: questions
  });
};

/**
 * 获取单个题目
 * @route GET /api/questions/:id
 */
const getQuestion = async (req, res) => {
  const question = await Question.findOne({ id: req.params.id });

  if (!question) {
    throw new AppError('未找到该题目', 404);
  }

  res.status(200).json({
    status: 'success',
    data: question
  });
};

/**
 * 创建题目
 * @route POST /api/questions
 */
const createQuestion = async (req, res) => {
  // 数据验证
  if (!req.body.text || !req.body.type || !req.body.answer) {
    throw new AppError('请提供完整的题目信息: 题目内容、类型和答案', 400);
  }

  // 生成唯一ID
  const questionId = req.body.id || generateUniqueId();

  // 检查ID是否已存在
  const existingQuestion = await Question.findOne({ id: questionId });
  if (existingQuestion) {
    throw new AppError('题目ID已存在', 400);
  }

  // 创建题目
  const newQuestion = await Question.create({
    ...req.body,
    id: questionId
  });

  res.status(201).json({
    status: 'success',
    data: newQuestion
  });
};

/**
 * 更新题目
 * @route PUT /api/questions/:id
 */
const updateQuestion = async (req, res) => {
  const question = await Question.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!question) {
    throw new AppError('未找到该题目', 404);
  }

  res.status(200).json({
    status: 'success',
    data: question
  });
};

/**
 * 删除题目
 * @route DELETE /api/questions/:id
 */
const deleteQuestion = async (req, res) => {
  const question = await Question.findOneAndDelete({ id: req.params.id });

  if (!question) {
    throw new AppError('未找到该题目', 404);
  }

  res.status(200).json({
    status: 'success',
    message: '题目已删除'
  });
};

/**
 * 导入题目
 * @route POST /api/questions/import
 */
const importQuestions = async (req, res) => {
  // 数据验证
  if (!req.body.questions || !Array.isArray(req.body.questions)) {
    throw new AppError('请提供题目数组', 400);
  }

  const { questions, mode = 'add', bankId, tags } = req.body;

  // 如果是替换模式，先清空所有题目
  if (mode === 'replace') {
    await Question.deleteMany({});
  }

  // 为每个题目生成唯一ID（如果没有），并附加标签
  const processedQuestions = questions.map(question => ({
    ...question,
    id: question.id || generateUniqueId(),
    tags: question.tags || tags || []
  }));

  // 批量导入
  const result = await questionService.bulkImportQuestions(processedQuestions, bankId || null);

  res.status(200).json({
    status: 'success',
    message: `成功导入 ${result.insertedCount} 道题目`,
    added: result.insertedCount,
    duplicates: result.duplicateCount,
    data: result.questions
  });
};

/**
 * 使用本地解析器导入文本格式题目
 * @route POST /api/questions/import/text
 */
const importTextQuestions = async (req, res) => {
  const { content, mode = 'add', bankId, tags } = req.body;

  if (!content || !content.trim()) {
    throw new AppError('请提供题目文本内容', 400);
  }

  // 本地解析文本
  const parsed = parseQuestionsFromText(content);

  if (parsed.length === 0) {
    throw new AppError('未能从文本中解析出任何题目，请检查格式', 400);
  }

  // 如果是替换模式，先清空
  if (mode === 'replace') {
    await Question.deleteMany({});
  }

  // 附加标签
  const processedQuestions = parsed.map(q => ({
    ...q,
    tags: q.tags || (tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [])
  }));

  // 批量导入
  const result = await questionService.bulkImportQuestions(processedQuestions, bankId || null);

  res.status(200).json({
    status: 'success',
    message: `成功解析 ${parsed.length} 道题目，导入 ${result.insertedCount} 道`,
    parsed: parsed.length,
    added: result.insertedCount,
    duplicates: result.duplicateCount,
    data: result.questions
  });
};

/**
 * 使用AI智能导入题目
 * @route POST /api/questions/import/ai
 */
const importQuestionsWithAI = async (req, res) => {
  // 数据验证
  if (!req.body.content) {
    throw new AppError('请提供题目内容', 400);
  }

  const { content, mode = 'add', bankId } = req.body;

  // 开始异步导入
  const importId = await importService.startImport(content, mode, bankId || null);

  res.status(202).json({
    status: 'success',
    message: '题目导入已开始处理',
    importId,
    mode
  });
};

/**
 * 获取导入任务状态
 * @route GET /api/questions/import/status/:importId
 */
const getImportStatus = async (req, res) => {
  const { importId } = req.params;

  if (!importId) {
    throw new AppError('请提供导入任务ID', 400);
  }

  const status = importService.getImportStatus(importId);

  if (!status) {
    throw new AppError('未找到该导入任务', 404);
  }

  res.status(200).json({
    status: 'success',
    data: status
  });
};

/**
 * 清理重复题目
 * @route POST /api/questions/clean-duplicates
 */
const cleanDuplicates = async (req, res) => {
  const result = await questionService.cleanDuplicateQuestions();

  res.status(200).json({
    status: 'success',
    message: `已清除 ${result.removedCount} 道重复题目`,
    originalCount: result.originalCount,
    currentCount: result.currentCount
  });
};

/**
 * 创建题库备份
 * @route POST /api/questions/backup
 */
const createBackup = async (req, res) => {
  const result = await questionService.createBackup();

  res.status(200).json({
    status: 'success',
    message: '备份已创建',
    backupId: result.backupId,
    filename: result.filename,
    timestamp: result.timestamp,
    questionCount: result.questionCount
  });
};

/**
 * 恢复题库备份
 * @route POST /api/questions/restore
 */
const restoreBackup = async (req, res) => {
  // 数据验证
  if (!req.body.backupId) {
    throw new AppError('请提供备份ID', 400);
  }

  const result = await questionService.restoreBackup(req.body.backupId);

  res.status(200).json({
    status: 'success',
    message: '题库已恢复',
    questionCount: result.questionCount
  });
};

/**
 * 获取所有标签
 * @route GET /api/questions/tags/all
 */
const getAllTags = async (req, res) => {
  const tags = await Question.distinct('tags');
  res.status(200).json({
    status: 'success',
    data: tags.filter(t => t)
  });
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
  importTextQuestions,
  importQuestionsWithAI,
  getImportStatus,
  cleanDuplicates,
  createBackup,
  restoreBackup,
  getAllTags
};