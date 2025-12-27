/**
 * 健康检查控制器
 * 提供服务状态监控功能
 */
const os = require('os');
const logger = require('../utils/logger');

/**
 * 检查服务健康状态
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const checkHealth = (req, res) => {
  logger.info('健康检查请求');
  
  // 收集系统信息
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hostname: os.hostname(),
    memory: {
      free: os.freemem(),
      total: os.totalmem()
    },
    cpu: os.cpus().length
  };
  
  res.status(200).json(healthInfo);
};

module.exports = {
  checkHealth
};
