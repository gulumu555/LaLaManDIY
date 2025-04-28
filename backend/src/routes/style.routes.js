/**
 * 风格转换路由
 * 处理风格分类、风格列表和风格转换请求
 */
const express = require('express');
const styleController = require('../controllers/style.controller');

const router = express.Router();

// GET /api/style/categories - 获取风格分类列表
router.get('/categories', styleController.getStyleCategories);

// GET /api/style/category/:categoryId - 获取指定分类下的风格列表
router.get('/category/:categoryId', styleController.getStylesByCategory);

// POST /api/style/apply - 应用风格转换
router.post('/apply', styleController.applyStyle);

module.exports = router;
