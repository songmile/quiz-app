const Question = require('../models/Question');
const { generateUniqueId } = require('../utils/helpers');
const fs = require('fs').promises;
const path = require('path');

/**
 * 批量导入题目
 * @param {Array} questions 题目数组
 * @returns {Object} 导入结果
 */
const bulkImportQuestions = async (questions, bankId = null) => {
  // 记录已导入题目数和重复题目数
  let insertedCount = 0;
  let duplicateCount = 0;
  const importedQuestions = [];

  // 逐个导入题目，忽略重复ID的题目
  for (const question of questions) {
    if (!question.id) {
      question.id = generateUniqueId();
    }

    try {
      // 查询是否已存在相同ID或内容的题目
      const existingQuestion = await Question.findOne({
        $or: [
          { id: question.id },
          { text: question.text } // 检查题目内容是否重复
        ]
      });

      if (existingQuestion) {
        duplicateCount++;
        continue; // 跳过重复题目
      }

      // 创建新题目
      if (bankId) question.bankId = bankId;
      const newQuestion = await Question.create(question);
      importedQuestions.push(newQuestion);
      insertedCount++;
    } catch (error) {
      console.error(`导入题目失败: ${error.message}`, question);
      // 继续处理下一个题目
    }
  }

  return {
    insertedCount,
    duplicateCount,
    questions: importedQuestions
  };
};

/**
 * 清理重复题目
 * @returns {Object} 清理结果
 */
const cleanDuplicateQuestions = async () => {
  // 获取所有题目
  const allQuestions = await Question.find().sort({ createdAt: -1 });
  const originalCount = allQuestions.length;

  // 用于存储唯一题目
  const uniqueQuestions = new Map();
  const duplicateIds = [];

  // 按文本内容去重，保留最新的题目
  for (const question of allQuestions) {
    if (!uniqueQuestions.has(question.text)) {
      uniqueQuestions.set(question.text, question);
    } else {
      duplicateIds.push(question.id);
    }
  }

  // 删除重复题目
  if (duplicateIds.length > 0) {
    await Question.deleteMany({ id: { $in: duplicateIds } });
  }

  // 计算剩余题目数
  const currentCount = await Question.countDocuments();

  return {
    originalCount,
    currentCount,
    removedCount: originalCount - currentCount
  };
};

/**
 * 创建题库备份
 * @returns {Object} 备份信息
 */
const createBackup = async () => {
  try {
    // 获取当前时间戳
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const backupId = generateUniqueId();
    
    // 创建备份目录（如果不存在）
    const backupDir = path.join(process.env.DATA_DIR || 'data', 'backups');
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    // 备份文件名
    const backupFilename = `questions_backup_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);
    
    // 获取所有题目
    const questions = await Question.find();
    
    // 写入备份文件
    await fs.writeFile(backupPath, JSON.stringify(questions, null, 2));
    
    return {
      backupId,
      filename: backupFilename,
      path: backupPath,
      timestamp,
      questionCount: questions.length
    };
  } catch (error) {
    console.error('创建备份失败:', error);
    throw new Error(`创建备份失败: ${error.message}`);
  }
};

/**
 * 恢复题库备份
 * @param {String} backupId 备份ID或文件名
 * @returns {Object} 恢复结果
 */
// const restoreBackup = async (backupId) => {
//   try {
//     // 备份目录
//     const backupDir = path.join(process.env.DATA_DIR || 'data', 'backups');
//     console.log('备份目录路径:', backupDir, '当前工作目录:', process.cwd());
    
//     // 查找匹配的备份文件
//     let files;
//     try {
//       files = await fs.readdir(backupDir);
//       console.log('找到的备份文件:', files);
//     } catch (err) {
//       console.error(`读取备份目录失败: ${err.message}`);
      
//       // 尝试多种可能的路径
//       const alternatePaths = [
//         './data/backups',
//         '../data/backups',
//         '/root/spring-boot-quiz-app/backend/data/backups'
//       ];
      
//       for (const altPath of alternatePaths) {
//         try {
//           console.log(`尝试替代路径: ${altPath}`);
//           files = await fs.readdir(altPath);
//           console.log(`在 ${altPath} 中找到备份文件:`, files);
//           // 如果成功找到文件，更新备份目录
//           backupDir = altPath;
//           break;
//         } catch (innerErr) {
//           console.log(`路径 ${altPath} 读取失败`);
//         }
//       }
      
//       if (!files) {
//         throw new Error(`无法读取备份目录: ${backupDir}`);
//       }
//     }
    
//     let backupFile = files.find(file => file === backupId);
    
//     // 如果没找到精确匹配，尝试包含匹配
//     if (!backupFile) {
//       backupFile = files.find(file => file.includes(backupId));
//     }
    
//     if (!backupFile) {
//       throw new Error(`未找到备份: ${backupId}，可用的备份文件: ${files.join(', ')}`);
//     }
    
//     const backupPath = path.join(backupDir, backupFile);
//     console.log('使用的备份文件路径:', backupPath);
    
//     // 读取备份文件
//     const backupDataStr = await fs.readFile(backupPath, 'utf8');
//     const questions = JSON.parse(backupDataStr);
    
//     // 验证备份数据
//     if (!Array.isArray(questions)) {
//       throw new Error('无效的备份文件格式');
//     }
    
//     // 清空现有题目
//     await Question.deleteMany({});
    
//     // 导入备份题目
//     await Question.insertMany(questions);
    
//     return {
//       backupId,
//       filename: backupFile,
//       timestamp: new Date().toISOString(),
//       questionCount: questions.length
//     };
//   } catch (error) {
//     console.error('恢复备份失败:', error);
//     throw new Error(`恢复备份失败: ${error.message}`);
//   }
// };



const restoreBackup = async (backupId) => {
  try {
    console.log('收到的备份ID:', backupId); // 记录前端传入的ID

    // 备份目录 - 与 createBackup 保持一致
    const backupDir = path.join(process.env.DATA_DIR || 'data', 'backups');
    
    // 获取目录中的所有文件
    const files = await fs.readdir(backupDir);
    console.log('备份目录中的文件:', files);
    
    // 关键修改: 将日期格式的ID转换为文件名格式
    // 前端传入的格式可能是: "2025/03/14 10:30:25"
    // 而文件名可能是: "questions_backup_2025-03-14T10-30-25.json"
    
    let backupFile = null;
    
    // 1. 直接匹配（以防ID已经是文件名）
    if (files.includes(backupId)) {
      backupFile = backupId;
    } 
    // 2. 将日期格式转换为文件名可能的部分并查找
    else {
      // 尝试转换日期格式为ISO字符串格式的一部分
      const dateMatch = backupId.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
      
      if (dateMatch) {
        // 提取日期部分
        const [_, year, month, day, hour, minute, second] = dateMatch;
        
        // 可能的日期格式
        const possibleFormats = [
          `${year}-${month}-${day}T${hour}-${minute}-${second}`,
          `${year}-${month}-${day}T${hour}:${minute}:${second}`,
          `${year}-${month}-${day}_${hour}-${minute}-${second}`
        ];
        
        console.log('尝试的日期格式:', possibleFormats);
        
        // 查找包含这些格式的文件
        for (const format of possibleFormats) {
          const matchingFile = files.find(file => file.includes(format));
          if (matchingFile) {
            backupFile = matchingFile;
            console.log('找到匹配的备份文件:', matchingFile);
            break;
          }
        }
      }
      
      // 如果还没找到，尝试基于部分内容匹配
      if (!backupFile) {
        // 根据日期中的一部分尝试匹配
        const partialMatch = backupId.replace(/[\/:\s]/g, ''); // 20250314103025
        console.log('尝试部分匹配:', partialMatch);
        
        backupFile = files.find(file => {
          const cleanFile = file.replace(/[-_.]/g, '');
          return cleanFile.includes(partialMatch);
        });
      }
    }
    
    if (!backupFile) {
      throw new Error(`未找到匹配的备份文件: ${backupId}\n可用文件: ${files.join(', ')}`);
    }
    
    const backupPath = path.join(backupDir, backupFile);
    console.log('使用备份文件路径:', backupPath);
    
    // 读取备份文件
    const backupDataStr = await fs.readFile(backupPath, 'utf8');
    const questions = JSON.parse(backupDataStr);
    
    // 验证备份数据
    if (!Array.isArray(questions)) {
      throw new Error('无效的备份文件格式');
    }
    
    // 清空现有题目
    await Question.deleteMany({});
    
    // 导入备份题目
    await Question.insertMany(questions);
    
    return {
      backupId,
      filename: backupFile,
      timestamp: new Date().toISOString(),
      questionCount: questions.length
    };
  } catch (error) {
    console.error('恢复备份失败:', error);
    throw new Error(`恢复备份失败: ${error.message}`);
  }
};
















/**
 * 获取题目详情
 * @param {String} questionId 题目ID
 * @returns {Object} 题目详情
 */
const getQuestionDetail = async (questionId) => {
  const question = await Question.findOne({ id: questionId });
  if (!question) {
    throw new Error('未找到题目');
  }
  return question;
};

/**
 * 搜索题目
 * @param {String} keyword 搜索关键词
 * @param {String} type 题目类型
 * @returns {Array} 匹配的题目
 */
const searchQuestions = async (keyword, type = null) => {
  const searchQuery = {
    $or: [
      { text: { $regex: keyword, $options: 'i' } }
    ]
  };
  
  if (type) {
    searchQuery.type = type;
  }
  
  return await Question.find(searchQuery).limit(100);
};

module.exports = {
  bulkImportQuestions,
  cleanDuplicateQuestions,
  createBackup,
  restoreBackup,
  getQuestionDetail,
  searchQuestions
};