const QuestionBank = require('../models/QuestionBank');
const Question = require('../models/Question');
const { generateUniqueId } = require('../utils/helpers');

const getOrCreateBank = async (name) => {
  let bank = await QuestionBank.findOne({ name });
  if (!bank) {
    bank = await QuestionBank.create({
      id: generateUniqueId(),
      name,
      questionCount: 0
    });
  }
  return bank;
};

const getAllBanksWithCounts = async () => {
  const banks = await QuestionBank.find().sort({ createdAt: -1 });
  const counts = await Question.aggregate([
    { $match: { bankId: { $ne: null } } },
    { $group: { _id: '$bankId', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  counts.forEach(c => { countMap[c._id] = c.count; });

  return banks.map(bank => ({
    ...bank.toObject(),
    questionCount: countMap[bank.id] || 0
  }));
};

const createBank = async (data) => {
  const bank = await QuestionBank.create({
    id: generateUniqueId(),
    name: data.name,
    description: data.description || ''
  });
  return bank;
};

const updateBank = async (bankId, data) => {
  const bank = await QuestionBank.findOneAndUpdate(
    { id: bankId },
    { name: data.name, description: data.description },
    { new: true }
  );
  return bank;
};

const deleteBank = async (bankId) => {
  await Question.updateMany({ bankId }, { bankId: null });
  await QuestionBank.findOneAndDelete({ id: bankId });
};

module.exports = {
  getOrCreateBank,
  getAllBanksWithCounts,
  createBank,
  updateBank,
  deleteBank
};
