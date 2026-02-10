const { v4: uuidv4 } = require('uuid');

/**
 * 生成唯一ID
 * @returns {String} UUID
 */
const generateUniqueId = () => {
  return uuidv4();
};

/**
 * 将内容分割成多个块，以便于API处理
 * @param {String} content 要分割的内容
 * @param {Number} chunkSize 块大小
 * @returns {Array<String>} 分割后的块
 */
const splitContentIntoChunks = (content, chunkSize = 1000) => {
  if (!content || !content.trim()) return [];

  const lines = content.split('\n');

  // 题目开始标记
  const questionMarkers = ['单选题', '多选题', '判断题', '填空题', '简答题'];
  const numberWithTypePattern = /^\d+[．.、)\s].*(单选|多选|判断|填空|简答)/;
  const typeStartPattern = /^(单选题?|多选题?|判断题?|填空题?|简答题?)[：:．.、\s]/;

  // 判断一行是否是新题目的开始
  const isQuestionStart = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (typeStartPattern.test(trimmed)) return true;
    if (numberWithTypePattern.test(trimmed)) return true;
    return false;
  };

  // 第一步：将内容分割为完整的题目块
  const questionBlocks = [];
  let currentBlock = [];

  for (const line of lines) {
    if (isQuestionStart(line) && currentBlock.length > 0) {
      questionBlocks.push(currentBlock.join('\n'));
      currentBlock = [];
    }
    currentBlock.push(line);
  }
  if (currentBlock.length > 0) {
    questionBlocks.push(currentBlock.join('\n'));
  }

  // 如果没有识别到题目边界，按空行分割作为后备
  if (questionBlocks.length <= 1 && content.length > chunkSize) {
    questionBlocks.length = 0;
    currentBlock = [];
    for (const line of lines) {
      if (line.trim() === '' && currentBlock.length > 0) {
        questionBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      } else {
        currentBlock.push(line);
      }
    }
    if (currentBlock.length > 0) {
      questionBlocks.push(currentBlock.join('\n'));
    }
  }

  // 第二步：将题目块组合成不超过 chunkSize 的 chunk
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const block of questionBlocks) {
    const blockSize = block.length;

    // 如果单个题目块就超过 chunkSize，单独作为一个 chunk
    if (blockSize > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n'));
        currentChunk = [];
        currentSize = 0;
      }
      chunks.push(block);
      continue;
    }

    // 如果加入当前块会超出限制，先保存当前 chunk
    if (currentSize + blockSize > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n\n'));
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(block);
    currentSize += blockSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks.length > 0 ? chunks : [content];
};

/**
 * 从文本中提取JSON
 * @param {String} text 包含JSON的文本
 * @returns {String|null} 提取的JSON文本或null
 */
const extractJsonFromText = (text) => {
  if (!text) return null;

  // 清理文本
  text = text.trim();

  // 如果内容被包在代码块中，提取出来
  if (text.includes("```json")) {
    const parts = text.split("```json", 2);
    if (parts.length > 1) {
      text = parts[1];
      if (text.includes("```")) {
        text = text.split("```", 2)[0].trim();
      }
    }
  } else if (text.includes("```")) {
    const parts = text.split("```", 2);
    if (parts.length > 1) {
      text = parts[1];
      if (text.includes("```")) {
        text = text.split("```", 2)[0].trim();
      }
    }
  }

  return text;
};

/**
 * 检查答案是否正确
 * @param {Object} question 问题对象
 * @param {String} userAnswer 用户答案
 * @returns {Boolean} 是否正确
 */
const checkAnswer = (question, userAnswer) => {
  const correctAnswer = question.answer.replace(/\s/g, "");
  userAnswer = userAnswer.replace(/\s/g, "");

  // 多选题特殊处理
  if (question.type === "多选题") {
    // 将正确答案转换为排序后的列表
    const correctOptions = correctAnswer.split(",").sort();
    const userOptions = userAnswer.split(",").sort();
    return JSON.stringify(correctOptions) === JSON.stringify(userOptions);
  }

  // 填空题特殊处理：允许部分匹配
  if (question.type === "填空题") {
    // 如果完全匹配
    if (correctAnswer === userAnswer) {
      return true;
    }

    // 尝试部分匹配（检查关键词）
    const correctKeywords = new Set(correctAnswer.toLowerCase().match(/\w+/g) || []);
    const userKeywords = new Set(userAnswer.toLowerCase().match(/\w+/g) || []);

    // 如果用户答案包含了正确答案的大部分关键词，也算部分正确
    if (correctKeywords.size > 0) {
      let commonKeywords = 0;
      for (const keyword of correctKeywords) {
        if (userKeywords.has(keyword)) {
          commonKeywords++;
        }
      }
      const matchRatio = commonKeywords / correctKeywords.size;
      // 如果匹配率超过80%，认为基本正确
      return matchRatio >= 0.8;
    }

    return false;
  }

  return correctAnswer === userAnswer;
};

/**
 * 格式化日期时间
 * @param {Date} date 日期对象
 * @returns {String} 格式化的日期时间字符串
 */
const formatDateTime = (date = new Date()) => {
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * 安全解析JSON
 * @param {String} jsonString JSON字符串
 * @param {any} defaultValue 解析失败时的默认值
 * @returns {any} 解析结果或默认值
 */
const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`JSON解析错误: ${error.message}`);
    return defaultValue;
  }
};

/**
 * 本地解析标准格式的题目文本
 * 支持格式：
 *   单选题：题目内容
 *   A. 选项A
 *   B. 选项B
 *   答案：A
 *   解析：解析内容
 *
 * @param {String} text 题目文本
 * @returns {Array} 解析后的题目数组
 */
const parseQuestionsFromText = (text) => {
  if (!text || !text.trim()) return [];

  const questions = [];
  // 按空行或题目类型标记分割题目块
  const typePattern = /^(单选题|多选题|判断题|填空题|简答题)[：:．.、]/;
  const numberPattern = /^\d+[．.、)\s]/;

  const lines = text.split('\n');
  const blocks = [];
  let currentBlock = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // 空行或新题目标记 → 切分
    if (trimmed === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      continue;
    }
    // 如果当前行以题目类型开头，且已有内容，切分
    if (typePattern.test(trimmed) && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [];
    }
    // 如果当前行以数字编号开头且包含题目类型关键词，也切分
    if (numberPattern.test(trimmed) && currentBlock.length > 0) {
      const hasType = ['单选题', '多选题', '判断题', '填空题', '简答题'].some(t => trimmed.includes(t));
      if (hasType) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    }
    currentBlock.push(trimmed);
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  // 解析每个题目块
  for (const block of blocks) {
    const question = parseSingleQuestion(block);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
};

/**
 * 解析单个题目块
 */
const parseSingleQuestion = (lines) => {
  if (!lines || lines.length === 0) return null;

  let type = '';
  let text = '';
  let options = [];
  let answer = '';
  let explanation = '';

  // 题目类型关键词
  const typeMap = {
    '单选': '单选题', '多选': '多选题', '判断': '判断题',
    '填空': '填空题', '简答': '简答题'
  };

  // 选项正则：A. / A、/ A) / A．
  const optionPattern = /^([A-Za-z])[.．、)\s]\s*(.+)/;
  // 答案正则
  const answerPattern = /^(答案|正确答案|参考答案)[：:．.\s]\s*(.+)/;
  // 解析正则
  const explanationPattern = /^(解析|解答|分析|详解)[：:．.\s]\s*(.+)/;
  // 题目类型正则
  const typeLinePattern = /^(?:\d+[．.、)\s]*)?(单选题?|多选题?|判断题?|填空题?|简答题?)[：:．.、\s]\s*(.+)/;

  let i = 0;

  // 第一行：尝试提取题目类型和题目内容
  const firstLine = lines[0];
  const typeMatch = firstLine.match(typeLinePattern);
  if (typeMatch) {
    const rawType = typeMatch[1];
    for (const [key, val] of Object.entries(typeMap)) {
      if (rawType.includes(key)) { type = val; break; }
    }
    text = typeMatch[2].trim();
    i = 1;
  } else {
    // 没有类型前缀，整行作为题目内容
    text = firstLine.replace(/^\d+[．.、)\s]*/, '').trim();
    i = 1;
  }

  // 继续解析剩余行
  let collectingExplanation = false;
  for (; i < lines.length; i++) {
    const line = lines[i];

    // 答案行
    const ansMatch = line.match(answerPattern);
    if (ansMatch) {
      answer = ansMatch[2].trim();
      collectingExplanation = false;
      continue;
    }

    // 解析行
    const expMatch = line.match(explanationPattern);
    if (expMatch) {
      explanation = expMatch[2].trim();
      collectingExplanation = true;
      continue;
    }

    // 如果正在收集解析内容（多行解析）
    if (collectingExplanation) {
      explanation += '\n' + line;
      continue;
    }

    // 选项行
    const optMatch = line.match(optionPattern);
    if (optMatch) {
      options.push({
        letter: optMatch[1].toUpperCase(),
        text: optMatch[2].trim()
      });
      continue;
    }

    // 其他行追加到题目内容
    if (!answer && options.length === 0) {
      text += '\n' + line;
    }
  }

  // 如果没有内容，跳过
  if (!text) return null;

  // 自动推断题目类型
  if (!type) {
    if (options.length > 0) {
      if (answer && answer.includes(',')) {
        type = '多选题';
      } else {
        type = '单选题';
      }
    } else if (/^(对|错|正确|错误|√|×|true|false)$/i.test(answer)) {
      type = '判断题';
    } else {
      type = '填空题';
    }
  }

  return {
    id: generateUniqueId(),
    type,
    text,
    options: options.length > 0 ? options : [],
    answer,
    explanation
  };
};

module.exports = {
  generateUniqueId,
  splitContentIntoChunks,
  extractJsonFromText,
  checkAnswer,
  formatDateTime,
  safeJsonParse,
  parseQuestionsFromText
};