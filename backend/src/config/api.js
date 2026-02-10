/**
 * 外部API配置默认值
 */
const defaultApiConfigs = [
  {
    api_key: process.env.DEFAULT_API_KEY || '',
    api_url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    chunk_size: 1000,
    max_tokens: 4096,
    name: '主要API'
  },
  {
    api_key: '',
    api_url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    chunk_size: 1000, 
    max_tokens: 4096,
    name: '备用API'
  },
  {
    api_key: '',
    api_url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-7B-Instruct', 
    chunk_size: 1000,
    max_tokens: 4096,
    name: '知识树API'
  },
  {
    api_key: '',
    api_url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    chunk_size: 1000,
    max_tokens: 4096,
    name: '设计流程API'
  }
];

/**
 * 导入设置的默认值
 */
const defaultImportSettings = {
  import_max_concurrent: 2,
  import_batch_delay: 2
};

/**
 * AI解析设置默认值
 */
const defaultAISettings = {
  explanation_api_index: 0,
  autosave_interval: 5,
  knowledge_tree_api_index: 2,
  design_process_api_index: 3
};

/**
 * 字体设置默认值
 */
const defaultFontSettings = {
  question_font_size: 12,
  option_font_size: 11,
  answer_font_size: 11,
  explanation_font_size: 11,
  ai_font_size: 11,
  error_font_size: 11,
  variant_font_size: 11
};

module.exports = {
  defaultApiConfigs,
  defaultImportSettings,
  defaultAISettings,
  defaultFontSettings
};