const axios = require('axios');

/**
 * API管理器 - 处理多个API配置和请求调度
 */
class ApiManager {
  constructor() {
    // API配置列表
    this.apiConfigs = [];
    // 当前使用的API索引
    this.currentApiIndex = 0;
    // 请求队列
    this.requestQueue = [];
    // 请求结果字典
    this.results = new Map();
    // 是否正在运行
    this.running = true;
    // 请求间隔（秒）
    this.requestInterval = 1.0;
    // 节流窗口大小（秒）
    this.throttleWindow = 60;
    // 节流窗口内最大请求数
    this.maxRequestsPerWindow = 20;
    // 请求时间记录
    this.requestTimestamps = [];
    // 启动工作线程
    this._processQueue();
  }

  /**
   * 添加API配置
   * @param {Object} config API配置对象
   * @returns {Boolean} 是否添加成功
   */
  addApiConfig(config) {
    if (config && config.api_key) {
      this.apiConfigs.push(config);
      return true;
    }
    return false;
  }

  /**
   * 更新API配置
   * @param {Number} index 配置索引
   * @param {Object} config 新的配置对象
   * @returns {Boolean} 是否更新成功
   */
  updateApiConfig(index, config) {
    if (0 <= index && index < this.apiConfigs.length) {
      this.apiConfigs[index] = config;
      return true;
    }
    return false;
  }

  /**
   * 获取下一个API配置（轮询方式）
   * @returns {Object|null} API配置对象或空
   */
  getNextApiConfig() {
    if (!this.apiConfigs || this.apiConfigs.length === 0) {
      return null;
    }

    // 只选择有API密钥的配置
    const validConfigs = this.apiConfigs.filter(cfg => cfg.api_key);
    if (validConfigs.length === 0) {
      return null;
    }

    const config = validConfigs[this.currentApiIndex % validConfigs.length];
    this.currentApiIndex = (this.currentApiIndex + 1) % validConfigs.length;
    return config;
  }

  /**
   * 添加API请求到队列
   * @param {String} requestId 请求ID
   * @param {Object} payload 请求载荷
   * @param {Function} callback 回调函数
   * @param {Number} specificApiIndex 指定API索引
   * @returns {String} 请求ID
   */
  addRequest(requestId, payload, callback = null, specificApiIndex = null, options = {}) {
    this.requestQueue.push({ requestId, payload, callback, specificApiIndex, options });
    this._processQueue();
    return requestId;
  }

  /**
   * 获取请求结果
   * @param {String} requestId 请求ID
   * @returns {Object|null} 结果对象或空
   */
  getResult(requestId) {
    if (this.results.has(requestId)) {
      const result = this.results.get(requestId);
      this.results.delete(requestId);
      return result;
    }
    return null;
  }

  /**
   * 等待并获取请求结果
   * @param {String} requestId 请求ID
   * @param {Number} timeout 超时（毫秒）
   * @returns {Promise<Object|null>} 结果对象或空
   */
  async waitForResult(requestId, timeout = null) {
    const startTime = Date.now();
    
    while (timeout === null || Date.now() - startTime < timeout) {
      const result = this.getResult(requestId);
      if (result !== null) {
        return result;
      }
      
      // 等待100毫秒
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
  }

  /**
   * 检查是否应该限制请求频率
   * @returns {Boolean} 是否应该限制
   */
  _shouldThrottle() {
    // 清理过期的时间戳
    const currentTime = Date.now() / 1000;
    this.requestTimestamps = this.requestTimestamps.filter(
      t => currentTime - t < this.throttleWindow
    );

    // 检查当前窗口内的请求数
    return this.requestTimestamps.length >= this.maxRequestsPerWindow;
  }

  /**
   * 处理请求队列
   */
  async _processQueue() {
    if (!this.running) return;

    try {
      // 检查是否需要限制请求频率
      if (this._shouldThrottle()) {
        setTimeout(() => this._processQueue(), 1000);
        return;
      }

      // 获取下一个请求
      if (this.requestQueue.length === 0) {
        setTimeout(() => this._processQueue(), 100);
        return;
      }

      const { requestId, payload, callback, specificApiIndex, options } = this.requestQueue.shift();

      // 获取API配置
      let apiConfig;
      if (specificApiIndex !== null && 0 <= specificApiIndex && specificApiIndex < this.apiConfigs.length) {
        apiConfig = this.apiConfigs[specificApiIndex];
        if (!apiConfig.api_key) {
          apiConfig = this.getNextApiConfig();
        }
      } else {
        apiConfig = this.getNextApiConfig();
      }

      if (!apiConfig) {
        // 没有可用的API配置
        this.results.set(requestId, { error: "没有可用的API配置" });
        if (callback) callback(requestId, { error: "没有可用的API配置" });
        setTimeout(() => this._processQueue(), 100);
        return;
      }

      // 执行请求
      this._executeRequest(requestId, apiConfig, payload, callback, options);

      // 更新请求计数和时间戳
      const currentTime = Date.now() / 1000;
      this.requestTimestamps.push(currentTime);

      // 请求发送后短暂暂停，避免过快发送请求
      setTimeout(() => this._processQueue(), this.requestInterval * 1000);
    } catch (error) {
      console.error(`API队列处理错误: ${error.message}`);
      setTimeout(() => this._processQueue(), 1000);
    }
  }

  /**
   * 执行API请求
   * @param {String} requestId 请求ID
   * @param {Object} apiConfig API配置
   * @param {Object} payload 请求载荷
   * @param {Function} callback 回调函数
   */
  async _executeRequest(requestId, apiConfig, payload, callback, options = {}) {
    try {
      // 准备请求头
      const headers = {
        "Authorization": `Bearer ${apiConfig.api_key}`,
        "Content-Type": "application/json"
      };

      // 超时时间：优先使用调用方传入的值，默认30s
      const requestTimeout = options.timeout || 30000;

      // 尝试发送请求，增加重试机制
      let maxRetries = 2;
      let retryCount = 0;
      let response = null;
      let lastError = null;

      while (retryCount < maxRetries) {
        try {
          response = await axios.post(
            apiConfig.api_url,
            payload,
            {
              headers,
              timeout: requestTimeout
            }
          );
          // 请求成功，跳出循环
          break;
        } catch (error) {
          // 超时或连接错误，尝试重试
          lastError = error;
          retryCount += 1;
          if (retryCount >= maxRetries) {
            break; // 重试次数用完，跳出循环
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 每次重试等待时间增加
        }
      }

      // 如果达到最大重试次数仍未成功
      if (response === null) {
        throw lastError || new Error("无法连接到API服务器");
      }

      // 处理响应
      let result;
      if (response.status === 200) {
        result = response.data;
      } else {
        result = {
          error: `API错误: HTTP ${response.status}`,
          response: response.data
        };
      }

      // 存储结果
      this.results.set(requestId, result);

      // 调用回调函数（如果有）
      if (callback) {
        callback(requestId, result);
      }
    } catch (error) {
      // 处理异常
      const errorResult = {
        error: `请求异常: ${error.message}`
      };
      this.results.set(requestId, errorResult);

      if (callback) {
        callback(requestId, errorResult);
      }
    }
  }

  /**
   * 关闭API管理器
   */
  shutdown() {
    this.running = false;
  }
}

// 创建单例实例
const apiManager = new ApiManager();

module.exports = apiManager;