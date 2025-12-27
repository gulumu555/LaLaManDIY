/**
 * LaLaManDIY 后端服务入口文件
 * 提供图片处理、风格转换、动效生成和打印订单等API服务
 */

// 导入依赖
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 导入路由
const healthRoutes = require('./routes/health.routes');
const uploadRoutes = require('./routes/upload.routes');
const styleRoutes = require('./routes/style.routes');
const effectRoutes = require('./routes/effect.routes');
const printRoutes = require('./routes/print.routes');

// 导入工具
const logger = require('./utils/logger');

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置日志
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 创建上传目录（如果不存在）
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 静态文件服务（用于访问上传的图片）
app.use('/uploads', express.static(uploadsDir));

// 注册路由
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/style', styleRoutes);
app.use('/api/effect', effectRoutes);
app.use('/api/print', printRoutes);

// 全局错误处理
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${err.stack}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`服务器运行在 http://localhost:${PORT}`);
  logger.info('按 Ctrl+C 停止服务');
});

module.exports = app;
