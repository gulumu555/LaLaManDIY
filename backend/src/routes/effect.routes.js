/**
 * 动效处理路由
 * 处理动效列表和动效生成请求
 */
const express = require('express');
const effectController = require('../controllers/effect.controller');

const router = express.Router();

// GET /api/effect/list - 获取可用动效列表
router.get('/list', effectController.getEffectsList);

// POST /api/effect/apply - 应用动效处理
router.post('/apply', effectController.applyEffect);

module.exports = router;
