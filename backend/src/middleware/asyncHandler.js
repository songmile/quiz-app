/**
 * 异步处理中间件
 * 用于捕获异步路由处理器中的错误
 * 
 * @param {Function} fn 异步路由处理函数
 * @returns {Function} Express中间件函数
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;