const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 连接数据库
connectDB();


// 配置CORS选项
const corsOptions = {
  origin: function(origin, callback) {
    // 允许您的域名和没有来源的请求（如同一来源的请求）
    const allowedOrigins = [
      'http://shuati.kkuun.cn', 
      'https://shuati.kkuun.cn',
      'http://142.171.229.172:5000',
      'http://142.171.229.172:8080'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy restriction'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};


// 中间件
app.use(cors(corsOptions)); // 启用CORS（使用白名单配置）

app.use(express.json({ limit: '30mb' })); // 解析JSON请求体，增加大小限制
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // 解析URL编码请求体

// API路由
app.use('/api', routes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `找不到路由: ${req.originalUrl}`
  });
});

// 错误处理中间件
app.use(errorHandler);

// 设置端口并启动服务器
const PORT = process.env.PORT || 5000;

// 尝试初始化应用程序设置
const initSettings = async () => {
  try {
    const Settings = require('./models/Settings');
    const { 
      defaultApiConfigs, 
      defaultImportSettings,
      defaultAISettings,
      defaultFontSettings
    } = require('./config');

    // 检查是否已存在设置
    const existingSettings = await Settings.findOne();
    
    if (!existingSettings) {
      // 创建默认设置
      const defaultSettings = new Settings({
        api_configs: defaultApiConfigs,
        import_max_concurrent: defaultImportSettings.import_max_concurrent,
        import_batch_delay: defaultImportSettings.import_batch_delay,
        explanation_api_index: defaultAISettings.explanation_api_index,
        autosave_interval: defaultAISettings.autosave_interval,
        knowledge_tree_api_index: defaultAISettings.knowledge_tree_api_index,
        design_process_api_index: defaultAISettings.design_process_api_index,
        font_settings: defaultFontSettings
      });

      await defaultSettings.save();
      console.log('已创建默认应用设置');
    }

    // 初始化API管理器
    const apiManager = require('./utils/apiManager');
    const settings = existingSettings || await Settings.findOne();
    
    if (settings && settings.api_configs) {
      // 清空现有配置
      apiManager.apiConfigs = [];
      
      // 添加有效的API配置
      for (const config of settings.api_configs) {
        if (config.api_key) {
          apiManager.addApiConfig(config);
        }
      }
      
      console.log(`已加载 ${apiManager.apiConfigs.length} 个有效的API配置`);
    }
  } catch (error) {
    console.error('初始化设置失败:', error.message);
  }
};

// 初始化统计数据
const initStatistics = async () => {
  try {
    const Statistics = require('./models/Statistics');
    
    // 检查是否已存在统计数据
    const existingStats = await Statistics.findOne();
    
    if (!existingStats) {
      // 创建默认统计数据
      const defaultStats = new Statistics({
        total_answered: 0,
        correct: 0,
        sessions: [],
        study_time: 0,
        wrong_questions: []
      });

      await defaultStats.save();
      console.log('已创建默认统计数据');
    }
  } catch (error) {
    console.error('初始化统计数据失败:', error.message);
  }
};

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);
  
  // 初始化应用设置和统计数据
  await initSettings();
  await initStatistics();
});

// 用于测试的导出
module.exports = app;