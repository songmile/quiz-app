/**
 * 错误处理中间件
 * 处理应用程序中的所有错误，提供统一的错误响应格式
 */

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 默认错误状态码和消息
  err.statusCode = err.statusCode || 500;
  err.message = err.message || '服务器错误';

  // 区分开发环境和生产环境的错误响应
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：返回详细错误信息
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // 生产环境：返回简洁的错误信息
    // 对于可操作的错误，返回错误消息
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // 对于编程错误或未知错误，不泄露错误详情
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: '发生了错误'
      });
    }
  }
};

module.exports = {
  AppError,
  errorHandler
};