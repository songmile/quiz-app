const Question = require('../models/Question');
const Settings = require('../models/Settings');
const apiManager = require('../utils/apiManager');
const { 
  generateUniqueId, 
  splitContentIntoChunks, 
  extractJsonFromText, 
  safeJsonParse
} = require('../utils/helpers');

// 导入进度和状态追踪
const importTasks = new Map();

/**
 * 启动异步题目导入
 * @param {String} content 题目内容文本
 * @param {String} mode 导入模式 (add或replace)
 * @returns {String} 导入任务ID
 */
const startImport = async (content, mode = 'add', bankId = null) => {
  // 生成唯一导入任务ID
  const importId = generateUniqueId();
  
  // 获取设置
  const settings = await Settings.findOne();
  const maxConcurrent = settings?.import_max_concurrent || 2;
  const batchDelay = settings?.import_batch_delay || 2;
  
  // 初始化导入任务状态
  importTasks.set(importId, {
    status: 'processing',
    mode,
    startTime: new Date(),
    totalChunks: 0,
    processedChunks: 0,
    successfulChunks: 0,
    failedChunks: 0,
    importedQuestions: [],
    errors: []
  });
  
  // 在后台启动导入过程
  processImport(importId, content, mode, maxConcurrent, batchDelay, bankId);
  
  return importId;
};

/**
 * 处理导入内容
 * @param {String} importId 导入任务ID
 * @param {String} content 题目内容
 * @param {String} mode 导入模式
 * @param {Number} maxConcurrent 最大并发请求数
 * @param {Number} batchDelay 批次延迟（秒）
 */
const processImport = async (importId, content, mode, maxConcurrent, batchDelay, bankId = null) => {
  try {
    // 获取导入任务状态
    const task = importTasks.get(importId);
    if (!task) return;
    
    // 如果是替换模式，先清空题库
    if (mode === 'replace') {
      await Question.deleteMany({});
    }
    
    // 分割内容为多个块
    const chunks = splitContentIntoChunks(content);
    task.totalChunks = chunks.length;
    
    // 更新任务状态
    importTasks.set(importId, task);
    
    // 使用Promise.all限制并发
    const processBatch = async (batchChunks) => {
      const promises = batchChunks.map(chunk => processChunk(importId, chunk, bankId));
      return await Promise.all(promises);
    };
    
    // 批量处理chunks，控制并发量
    for (let i = 0; i < chunks.length; i += maxConcurrent) {
      const batchChunks = chunks.slice(i, i + maxConcurrent);
      await processBatch(batchChunks);
      
      // 批次间延迟
      if (i + maxConcurrent < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay * 1000));
      }
    }
    
    // 完成导入
    task.status = 'completed';
    task.endTime = new Date();
    importTasks.set(importId, task);
    
    console.log(`导入任务 ${importId} 已完成: 共导入 ${task.importedQuestions.length} 道题`);
  } catch (error) {
    console.error(`导入任务 ${importId} 失败: ${error.message}`);
    
    // 更新任务状态为失败
    const task = importTasks.get(importId);
    if (task) {
      task.status = 'failed';
      task.error = error.message;
      importTasks.set(importId, task);
    }
  }
};

/**
 * 处理单个内容块
 * @param {String} importId 导入任务ID
 * @param {String} chunk 内容块
 * @returns {Promise<Array>} 处理后的题目数组
 */
const processChunk = async (importId, chunk, bankId = null) => {
  try {
    // 获取导入任务状态
    const task = importTasks.get(importId);
    if (!task) return [];
    
    // 使用AI处理块
    const questions = await processChunkWithAI(chunk);
    
    // 如果处理成功
    if (questions && Array.isArray(questions)) {
      // 给每个题目添加唯一ID和题库归属
      const processedQuestions = questions.map(q => {
        if (!q.id) {
          q.id = generateUniqueId();
        }
        if (bankId) {
          q.bankId = bankId;
        }
        return q;
      });
      
      // 导入题目
      const importedQuestions = await importQuestions(processedQuestions);
      
      // 更新任务状态
      task.processedChunks++;
      task.successfulChunks++;
      task.importedQuestions = [...task.importedQuestions, ...importedQuestions];
      importTasks.set(importId, task);
      
      return importedQuestions;
    } else {
      // 处理失败
      task.processedChunks++;
      task.failedChunks++;
      task.errors.push(`处理块 ${task.processedChunks} 失败: 无法解析返回结果`);
      importTasks.set(importId, task);
      
      return [];
    }
  } catch (error) {
    // 获取导入任务状态
    const task = importTasks.get(importId);
    if (task) {
      task.processedChunks++;
      task.failedChunks++;
      task.errors.push(`处理块 ${task.processedChunks} 失败: ${error.message}`);
      importTasks.set(importId, task);
    }
    
    console.error(`处理块失败: ${error.message}`);
    return [];
  }
};

/**
 * 使用AI处理内容块
 * @param {String} chunk 内容块
 * @returns {Promise<Array>} 格式化后的题目数组
 */
const processChunkWithAI = async (chunk) => {
  // 构建提示词
  const systemPrompt = `
你是一位专业的题库格式化助手。你的任务是将提供的文本内容转换为标准的JSON格式。

请将每个题目解析为以下格式，并将所有题目组合为一个JSON数组：
[
  {
    "type": "题目类型",
    "text": "题目内容",
    "options": [
      {"letter": "A", "text": "选项A内容"},
      {"letter": "B", "text": "选项B内容"}
    ],
    "answer": "正确答案",
    "explanation": "答案解析"
  }
]

题目类型包括：单选题、多选题、判断题、填空题等
正确答案格式：
- 单选题：单个字母如"A"
- 多选题：逗号分隔的字母如"A,C,D"
- 判断题：为"对"或"错"
- 填空题：将答案原文放入答案字段

请直接返回有效的JSON数组，不要添加任何解释、注释或其他文本。确保JSON格式完全正确，所有属性名和字符串值必须用双引号包裹。
`;

  const userPrompt = `以下是需要格式化的题库内容：\n\n${chunk}`;
  
  // 获取设置中的API配置
  const settings = await Settings.findOne();
  const apiIndex = 0; // 默认使用第一个API配置
  
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
  const requestId = `import_${generateUniqueId()}`;
  
  // 发送请求
  apiManager.addRequest(requestId, payload, null, apiIndex, { timeout: 120000 });
  
  // 等待结果
  const result = await apiManager.waitForResult(requestId, 120000); // 2分钟超时
  
  if (!result) {
    throw new Error('API请求超时');
  }
  
  if (result.error) {
    throw new Error(`API错误: ${result.error}`);
  }
  
  // 获取生成的内容
  if (result.choices && result.choices.length > 0) {
    const content = result.choices[0]?.message?.content || '';
    
    // 提取JSON内容
    const jsonText = extractJsonFromText(content);
    
    // 尝试解析JSON
    const questions = safeJsonParse(jsonText, null);
    
    if (!questions) {
      throw new Error('无法解析JSON响应');
    }
    
    return questions;
  }
  
  throw new Error('API返回结果格式不正确');
};

/**
 * 导入题目到数据库
 * @param {Array} questions 题目数组
 * @returns {Promise<Array>} 成功导入的题目
 */
const importQuestions = async (questions) => {
  // 验证题目格式
  const validQuestions = questions.filter(q => {
    return q.text && q.type && q.answer !== undefined;
  });
  
  // 存储成功导入的题目
  const importedQuestions = [];
  
  // 批量保存题目
  for (const question of validQuestions) {
    try {
      // 检查是否已存在相同ID或内容的题目
      const existingQuestion = await Question.findOne({
        $or: [
          { id: question.id },
          { text: question.text } // 检查题目内容是否重复
        ]
      });
      
      // 如果已存在，跳过
      if (existingQuestion) {
        continue;
      }
      
      // 创建新题目
      const newQuestion = await Question.create(question);
      importedQuestions.push(newQuestion);
    } catch (error) {
      console.error(`导入题目失败: ${error.message}`, question);
      // 继续处理下一题
    }
  }
  
  return importedQuestions;
};

/**
 * 获取导入任务状态
 * @param {String} importId 导入任务ID
 * @returns {Object|null} 导入任务状态
 */
const getImportStatus = (importId) => {
  if (!importTasks.has(importId)) {
    return null;
  }
  
  const task = importTasks.get(importId);
  
  // 计算进度百分比
  let progressPercentage = 0;
  if (task.totalChunks > 0) {
    progressPercentage = (task.processedChunks / task.totalChunks) * 100;
  }
  
  // 计算耗时
  let duration = 0;
  if (task.startTime) {
    const endTime = task.endTime || new Date();
    duration = (endTime - task.startTime) / 1000; // 秒
  }
  
  return {
    id: importId,
    status: task.status,
    mode: task.mode,
    progress: {
      total: task.totalChunks,
      processed: task.processedChunks,
      successful: task.successfulChunks,
      failed: task.failedChunks,
      percentage: progressPercentage.toFixed(1)
    },
    importedCount: task.importedQuestions.length,
    duration: duration.toFixed(1),
    errors: task.errors.slice(0, 10) // 只返回前10个错误
  };
};

/**
 * 清理过期的导入任务
 * 定期清理完成超过1小时的任务
 */
const cleanupImportTasks = () => {
  const now = new Date();
  
  for (const [importId, task] of importTasks.entries()) {
    // 清理完成超过1小时的任务
    if (task.endTime && (now - task.endTime) > 3600000) {
      importTasks.delete(importId);
    }
  }
};

// 每小时清理一次过期任务
setInterval(cleanupImportTasks, 3600000);

module.exports = {
  startImport,
  getImportStatus
};