const bankService = require('../services/bankService');
const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');

const getBanks = async (req, res) => {
  const banks = await bankService.getAllBanksWithCounts();
  res.status(200).json({ status: 'success', data: banks });
};

const createBank = async (req, res) => {
  if (!req.body.name) {
    throw new AppError('请提供题库名称', 400);
  }
  const bank = await bankService.createBank(req.body);
  res.status(201).json({ status: 'success', data: bank });
};

const updateBank = async (req, res) => {
  const bank = await bankService.updateBank(req.params.id, req.body);
  if (!bank) throw new AppError('未找到该题库', 404);
  res.status(200).json({ status: 'success', data: bank });
};

const deleteBank = async (req, res) => {
  await bankService.deleteBank(req.params.id);
  res.status(200).json({ status: 'success', message: '题库已删除' });
};

const getBankQuestions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const filter = { bankId: req.params.id };
  const total = await Question.countDocuments(filter);
  const questions = await Question.find(filter)
    .sort({ createdAt: -1 })
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

module.exports = { getBanks, createBank, updateBank, deleteBank, getBankQuestions };
