/**
 * 健康检查路由
 * 用于监控服务是否正常运行
 */
const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

// GET /api/health - 获取服务健康状态
router.get('/', healthController.checkHealth);

module.exports = router;
