/**
 * 打印服务路由
 * 处理打印产品查询和订单创建
 */
const express = require('express');
const printController = require('../controllers/print.controller');

const router = express.Router();

// GET /api/print/products - 获取打印产品列表
router.get('/products', printController.getPrintProducts);

// POST /api/print/order - 创建打印订单
router.post('/order', printController.createPrintOrder);

// GET /api/print/order/:orderId - 获取订单详情
router.get('/order/:orderId', printController.getPrintOrderById);

// GET /api/print/orders - 获取用户订单列表
router.get('/orders', printController.getUserOrders);

module.exports = router;
