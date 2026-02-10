const Settings = require('../models/Settings');
const { AppError } = require('../middleware/errorHandler');
const { defaultApiConfigs, defaultImportSettings, defaultAISettings, defaultFontSettings } = require('../config');
const apiManager = require('../utils/apiManager');
const fs = require('fs').promises;
const path = require('path');

/**
 * 获取所有设置
 * @route GET /api/settings
 */
const getSettings = async (req, res) => {
  // 查询设置
  let settings = await Settings.findOne();
  
  // 如果设置不存在，创建默认设置
  if (!settings) {
    settings = await Settings.create({
      api_configs: defaultApiConfigs,
      import_max_concurrent: defaultImportSettings.import_max_concurrent,
      import_batch_delay: defaultImportSettings.import_batch_delay,
      explanation_api_index: defaultAISettings.explanation_api_index,
      autosave_interval: defaultAISettings.autosave_interval,
      knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
      design_process_api_index: defaultAISettings.design_process_api_index,
      font_settings: defaultFontSettings
    });
  }

  // 处理API密钥，不直接返回完整的密钥
  const sanitizedSettings = JSON.parse(JSON.stringify(settings));
  if (sanitizedSettings.api_configs) {
    sanitizedSettings.api_configs = sanitizedSettings.api_configs.map(config => {
      if (config.api_key) {
        const keyLength = config.api_key.length;
        if (keyLength > 8) {
          // 只显示前4位和后4位，中间用*代替
          config.api_key = `${config.api_key.substring(0, 4)}****${config.api_key.substring(keyLength - 4)}`;
        } else if (keyLength > 0) {
          // 如果密钥很短，只显示第一位和最后一位
          config.api_key = `${config.api_key.substring(0, 1)}****${config.api_key.substring(keyLength - 1)}`;
        }
      }
      return config;
    });
  }

  res.status(200).json({
    status: 'success',
    data: sanitizedSettings
  });
};



// 获取备份文件列表
const getBackupFiles = async (req, res) => {
  try {
    // 使用确定的路径
    const backupDir = '/root/spring-boot-quiz-app/backend/data/backups';
    console.log('查找备份文件的目录:', backupDir);
    
    // 获取文件列表
    const files = await fs.readdir(backupDir);
    console.log('找到的备份文件:', files);
    
    // 过滤掉非JSON文件
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // 生成文件信息
    const fileList = await Promise.all(jsonFiles.map(async (file) => {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      // 尝试读取文件内容的开头来确定文件类型（题目备份还是完整备份）
      let fileType = '未知';
      let questionCount = 0;
      
      try {
        // 只读取文件开头部分以检查格式
        const fileHandle = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(1024);
        await fileHandle.read(buffer, 0, 1024, 0);
        await fileHandle.close();
        
        const content = buffer.toString('utf8');
        
        // 判断文件类型和内容
        if (content.includes('"questions"') && content.includes('"settings"')) {
          fileType = '完整备份';
        } else if (content.startsWith('[') && content.includes('"id"') && content.includes('"text"')) {
          fileType = '题目备份';
          // 粗略估计题目数量
          questionCount = (content.match(/"id":/g) || []).length;
        }
      } catch (err) {
        console.log(`读取文件 ${file} 头部失败:`, err);
      }
      
      return {
        filename: file,
        size: stats.size,
        createdAt: stats.mtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        type: fileType,
        questionCount
      };
    }));
    
    // 按修改日期排序（新的在前）
    fileList.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    
    res.status(200).json({
      status: 'success',
      data: fileList
    });
  } catch (error) {
    console.error('获取备份文件列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: `获取备份文件列表失败: ${error.message}`
    });
  }
};


/**
 * 更新设置
 * @route PUT /api/settings
 */
const updateSettings = async (req, res) => {
  // 查询设置
  let settings = await Settings.findOne();
  
  // 如果设置不存在，创建默认设置
  if (!settings) {
    settings = await Settings.create({
      api_configs: defaultApiConfigs,
      import_max_concurrent: defaultImportSettings.import_max_concurrent,
      import_batch_delay: defaultImportSettings.import_batch_delay,
      explanation_api_index: defaultAISettings.explanation_api_index,
      autosave_interval: defaultAISettings.autosave_interval,
      knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
      design_process_api_index: defaultAISettings.design_process_api_index,
      font_settings: defaultFontSettings
    });
  }

  // 只更新允许更新的字段
  const allowedFields = [
    'import_max_concurrent',
    'import_batch_delay',
    'explanation_api_index',
    'autosave_interval',
    'knowledge_tree_api_index',
    'design_process_api_index'
  ];
  
  // 过滤请求主体
  const filteredBody = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  }

  // 更新设置
  settings = await Settings.findOneAndUpdate(
    {},
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    message: '设置已更新',
    data: settings
  });
};

/**
 * 更新API配置
 * @route PUT /api/settings/api/:index
 */
const updateApiConfig = async (req, res) => {
  const { index } = req.params;
  const apiIndex = parseInt(index);
  
  // 查询设置
  let settings = await Settings.findOne();
  
  // 如果设置不存在，创建默认设置
  if (!settings) {
    settings = await Settings.create({
      api_configs: defaultApiConfigs,
      import_max_concurrent: defaultImportSettings.import_max_concurrent,
      import_batch_delay: defaultImportSettings.import_batch_delay,
      explanation_api_index: defaultAISettings.explanation_api_index,
      autosave_interval: defaultAISettings.autosave_interval,
      knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
      design_process_api_index: defaultAISettings.design_process_api_index,
      font_settings: defaultFontSettings
    });
  }

  // 检查API索引是否有效
  if (apiIndex < 0 || apiIndex >= settings.api_configs.length) {
    throw new AppError('无效的API索引', 400);
  }

  // 更新指定索引的API配置
  const newConfig = {
    ...settings.api_configs[apiIndex],
    ...req.body
  };

  // 更新数据库
  settings.api_configs[apiIndex] = newConfig;
  await settings.save();

  // 更新API管理器中的配置
  if (apiManager.updateApiConfig(apiIndex, newConfig)) {
    console.log(`API配置 ${apiIndex} 已更新`);
  }

  // 处理API密钥，不直接返回完整的密钥
  const responseConfig = { ...newConfig };
  if (responseConfig.api_key) {
    const keyLength = responseConfig.api_key.length;
    if (keyLength > 8) {
      // 只显示前4位和后4位，中间用*代替
      responseConfig.api_key = `${responseConfig.api_key.substring(0, 4)}****${responseConfig.api_key.substring(keyLength - 4)}`;
    } else if (keyLength > 0) {
      // 如果密钥很短，只显示第一位和最后一位
      responseConfig.api_key = `${responseConfig.api_key.substring(0, 1)}****${responseConfig.api_key.substring(keyLength - 1)}`;
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'API配置已更新',
    data: responseConfig
  });
};

/**
 * 更新字体设置
 * @route PUT /api/settings/fonts
 */
const updateFontSettings = async (req, res) => {
  // 查询设置
  let settings = await Settings.findOne();
  
  // 如果设置不存在，创建默认设置
  if (!settings) {
    settings = await Settings.create({
      api_configs: defaultApiConfigs,
      import_max_concurrent: defaultImportSettings.import_max_concurrent,
      import_batch_delay: defaultImportSettings.import_batch_delay,
      explanation_api_index: defaultAISettings.explanation_api_index,
      autosave_interval: defaultAISettings.autosave_interval,
      knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
      design_process_api_index: defaultAISettings.design_process_api_index,
      font_settings: defaultFontSettings
    });
  }

  // 允许更新的字体设置字段
  const allowedFields = [
    'question_font_size',
    'option_font_size',
    'answer_font_size',
    'explanation_font_size',
    'ai_font_size',
    'error_font_size',
    'variant_font_size'
  ];
  
  // 过滤请求主体
  const filteredFontSettings = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      filteredFontSettings[field] = req.body[field];
    }
  }

  // 更新字体设置
  settings.font_settings = {
    ...settings.font_settings,
    ...filteredFontSettings
  };

  await settings.save();

  res.status(200).json({
    status: 'success',
    message: '字体设置已更新',
    data: settings.font_settings
  });
};

/**
 * 更新导入设置
 * @route PUT /api/settings/import
 */
const updateImportSettings = async (req, res) => {
  // 查询设置
  let settings = await Settings.findOne();
  
  // 如果设置不存在，创建默认设置
  if (!settings) {
    settings = await Settings.create({
      api_configs: defaultApiConfigs,
      import_max_concurrent: defaultImportSettings.import_max_concurrent,
      import_batch_delay: defaultImportSettings.import_batch_delay,
      explanation_api_index: defaultAISettings.explanation_api_index,
      autosave_interval: defaultAISettings.autosave_interval,
      knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
      design_process_api_index: defaultAISettings.design_process_api_index,
      font_settings: defaultFontSettings
    });
  }

  // 允许更新的导入设置字段
  const allowedFields = [
    'import_max_concurrent',
    'import_batch_delay'
  ];
  
  // 过滤请求主体
  const filteredBody = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  }

  // 更新设置
  settings = await Settings.findOneAndUpdate(
    {},
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    message: '导入设置已更新',
    data: {
      import_max_concurrent: settings.import_max_concurrent,
      import_batch_delay: settings.import_batch_delay
    }
  });
};

/**
 * 重置设置为默认值
 * @route POST /api/settings/reset
 */
const resetSettings = async (req, res) => {
  // 删除现有设置
  await Settings.deleteMany({});
  
  // 创建默认设置
  const settings = await Settings.create({
    api_configs: defaultApiConfigs,
    import_max_concurrent: defaultImportSettings.import_max_concurrent,
    import_batch_delay: defaultImportSettings.import_batch_delay,
    explanation_api_index: defaultAISettings.explanation_api_index,
    autosave_interval: defaultAISettings.autosave_interval,
    knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
    design_process_api_index: defaultAISettings.design_process_api_index,
    font_settings: defaultFontSettings
  });

  // 重置API管理器
  apiManager.apiConfigs = [];
  for (const config of defaultApiConfigs) {
    if (config.api_key) {
      apiManager.addApiConfig(config);
    }
  }

  res.status(200).json({
    status: 'success',
    message: '设置已重置为默认值',
    data: settings
  });
};

/**
 * 备份所有数据
 * @route POST /api/settings/backup
 */
const backupData = async (req, res) => {
  try {
    // 获取当前时间戳
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    
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
    const backupFilename = `quiz_app_backup_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);
    
    // 收集要备份的数据
    const Question = require('../models/Question');
    const AIExplanation = require('../models/AIExplanation');
    const ErrorAnalysis = require('../models/ErrorAnalysis');
    const VariantQuestion = require('../models/VariantQuestion');
    const KnowledgeTree = require('../models/KnowledgeTree');
    const DesignProcess = require('../models/DesignProcess');
    const Statistics = require('../models/Statistics');
    
    const questions = await Question.find();
    const explanations = await AIExplanation.find();
    const errorAnalyses = await ErrorAnalysis.find();
    const variants = await VariantQuestion.find();
    const knowledgeTrees = await KnowledgeTree.find();
    const designProcesses = await DesignProcess.find();
    const stats = await Statistics.findOne();
    const settings = await Settings.findOne();
    
    // 创建备份数据对象
    const backupData = {
      timestamp,
      questions,
      explanations,
      errorAnalyses,
      variants,
      knowledgeTrees,
      designProcesses,
      stats,
      settings
    };
    
    // 写入备份文件
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    res.status(200).json({
      status: 'success',
      message: '数据备份已创建',
      backup: {
        filename: backupFilename,
        path: backupPath,
        timestamp,
        stats: {
          questions: questions.length,
          explanations: explanations.length,
          errorAnalyses: errorAnalyses.length,
          variants: variants.length,
          knowledgeTrees: knowledgeTrees.length,
          designProcesses: designProcesses.length
        }
      }
    });
  } catch (error) {
    console.error('备份失败:', error);
    throw new AppError(`备份数据失败: ${error.message}`, 500);
  }
};

/**
 * 恢复备份数据
 * @route POST /api/settings/restore
 */
const restoreData = async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      throw new AppError('请提供备份文件名', 400);
    }
    
    // 备份目录
    const backupDir = path.join(process.env.DATA_DIR || 'data', 'backups');
    const backupPath = path.join(backupDir, filename);
    
    // 检查文件是否存在
    try {
      await fs.access(backupPath);
    } catch (err) {
      throw new AppError(`备份文件不存在: ${filename}`, 404);
    }
    
    // 读取备份文件
    const backupDataStr = await fs.readFile(backupPath, 'utf8');
    const backupData = JSON.parse(backupDataStr);
    
    // 验证备份数据
    if (!backupData.questions || !Array.isArray(backupData.questions)) {
      throw new AppError('无效的备份文件格式', 400);
    }
    
    // 创建当前数据的备份，以便恢复失败时可以回滚
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const rollbackFilename = `pre_restore_backup_${timestamp}.json`;
    const rollbackPath = path.join(backupDir, rollbackFilename);
    
    // 收集当前数据
    const Question = require('../models/Question');
    const AIExplanation = require('../models/AIExplanation');
    const ErrorAnalysis = require('../models/ErrorAnalysis');
    const VariantQuestion = require('../models/VariantQuestion');
    const KnowledgeTree = require('../models/KnowledgeTree');
    const DesignProcess = require('../models/DesignProcess');
    const Statistics = require('../models/Statistics');
    
    const currentQuestions = await Question.find();
    const currentExplanations = await AIExplanation.find();
    const currentErrorAnalyses = await ErrorAnalysis.find();
    const currentVariants = await VariantQuestion.find();
    const currentKnowledgeTrees = await KnowledgeTree.find();
    const currentDesignProcesses = await DesignProcess.find();
    const currentStats = await Statistics.findOne();
    const currentSettings = await Settings.findOne();
    
    // 创建当前数据备份
    const currentData = {
      timestamp,
      questions: currentQuestions,
      explanations: currentExplanations,
      errorAnalyses: currentErrorAnalyses,
      variants: currentVariants,
      knowledgeTrees: currentKnowledgeTrees,
      designProcesses: currentDesignProcesses,
      stats: currentStats,
      settings: currentSettings
    };
    
    // 写入当前数据备份
    await fs.writeFile(rollbackPath, JSON.stringify(currentData, null, 2));
    
    // 开始恢复数据
    // 1. 清空现有数据
    await Question.deleteMany({});
    await AIExplanation.deleteMany({});
    await ErrorAnalysis.deleteMany({});
    await VariantQuestion.deleteMany({});
    await KnowledgeTree.deleteMany({});
    await DesignProcess.deleteMany({});
    await Statistics.deleteMany({});
    await Settings.deleteMany({});
    
    // 2. 导入备份数据
    // 导入题目
    if (backupData.questions && backupData.questions.length > 0) {
      await Question.insertMany(backupData.questions);
    }
    
    // 导入AI解析
    if (backupData.explanations && backupData.explanations.length > 0) {
      await AIExplanation.insertMany(backupData.explanations);
    }
    
    // 导入错误分析
    if (backupData.errorAnalyses && backupData.errorAnalyses.length > 0) {
      await ErrorAnalysis.insertMany(backupData.errorAnalyses);
    }
    
    // 导入变种题
    if (backupData.variants && backupData.variants.length > 0) {
      await VariantQuestion.insertMany(backupData.variants);
    }
    
    // 导入知识树
    if (backupData.knowledgeTrees && backupData.knowledgeTrees.length > 0) {
      await KnowledgeTree.insertMany(backupData.knowledgeTrees);
    }
    
    // 导入设计流程
    if (backupData.designProcesses && backupData.designProcesses.length > 0) {
      await DesignProcess.insertMany(backupData.designProcesses);
    }
    
    // 导入统计数据
    if (backupData.stats) {
      await Statistics.create(backupData.stats);
    }
    
    // 导入设置
    if (backupData.settings) {
      await Settings.create(backupData.settings);
      
      // 更新API管理器
      apiManager.apiConfigs = [];
      for (const config of backupData.settings.api_configs) {
        if (config.api_key) {
          apiManager.addApiConfig(config);
        }
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: '数据已从备份恢复',
      stats: {
        questions: backupData.questions ? backupData.questions.length : 0,
        explanations: backupData.explanations ? backupData.explanations.length : 0,
        errorAnalyses: backupData.errorAnalyses ? backupData.errorAnalyses.length : 0,
        variants: backupData.variants ? backupData.variants.length : 0,
        knowledgeTrees: backupData.knowledgeTrees ? backupData.knowledgeTrees.length : 0,
        designProcesses: backupData.designProcesses ? backupData.designProcesses.length : 0
      },
      rollback: {
        filename: rollbackFilename,
        path: rollbackPath
      }
    });
  } catch (error) {
    console.error('恢复失败:', error);
    throw new AppError(`恢复数据失败: ${error.message}`, 500);
  }
};

/**
 * 更改数据存储路径
 * @route PUT /api/settings/data-path
 */
const updateDataPath = async (req, res) => {
  const { path: newPath } = req.body;
  
  if (!newPath) {
    throw new AppError('请提供新的数据存储路径', 400);
  }

  try {
    // 检查目录是否存在，如果不存在则创建
    await fs.mkdir(newPath, { recursive: true });
    
    // 更新环境变量
    process.env.DATA_DIR = newPath;
    
    // TODO: 如果需要，将现有数据文件复制到新路径
    
    res.status(200).json({
      status: 'success',
      message: '数据存储路径已更新',
      path: newPath
    });
  } catch (error) {
    throw new AppError(`更新数据存储路径失败: ${error.message}`, 500);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateApiConfig,
  updateFontSettings,
  updateImportSettings,
  resetSettings,
  backupData,
  restoreData,
  updateDataPath,
  getBackupFiles
};