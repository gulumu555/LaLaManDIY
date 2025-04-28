/**
 * 打印服务控制器
 * 处理打印产品查询和订单创建
 */
const logger = require('../utils/logger');
const printProducts = require('../config/printProducts');

// 模拟订单数据库（实际项目中应使用真实数据库）
const orderDb = {
  orders: [],
  nextId: 10000,
  
  // 添加订单
  addOrder(order) {
    const newOrder = {
      ...order,
      orderId: `P${this.nextId++}`,
      createdAt: new Date().toISOString()
    };
    this.orders.push(newOrder);
    return newOrder;
  },
  
  // 根据ID获取订单
  getOrderById(orderId) {
    return this.orders.find(order => order.orderId === orderId);
  },
  
  // 获取用户订单列表
  getUserOrders(userId, page = 1, limit = 10) {
    const userOrders = this.orders.filter(order => order.userId === userId);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
      total: userOrders.length,
      page,
      limit,
      data: userOrders.slice(startIndex, endIndex)
    };
  }
};

/**
 * 获取打印产品列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getPrintProducts = (req, res) => {
  try {
    logger.info('请求获取打印产品列表');
    
    return res.status(200).json({
      success: true,
      message: '获取打印产品列表成功',
      data: printProducts
    });
  } catch (error) {
    logger.error(`获取打印产品列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取打印产品列表失败',
      error: error.message
    });
  }
};

/**
 * 创建打印订单
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const createPrintOrder = (req, res) => {
  try {
    const { 
      userId,
      imageUrl, 
      productType, 
      size, 
      quantity = 1, 
      addressInfo 
    } = req.body;
    
    logger.info(`创建打印订单: 用户=${userId}, 产品=${productType}, 尺寸=${size}`);
    
    // 验证参数
    if (!imageUrl || !productType || !size || !addressInfo) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数，需要提供imageUrl, productType, size和addressInfo'
      });
    }
    
    // 验证产品类型和尺寸
    const productList = printProducts[productType];
    if (!productList) {
      return res.status(400).json({
        success: false,
        message: `不支持的产品类型: ${productType}`
      });
    }
    
    const product = productList.find(p => p.size === size);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `产品 ${productType} 不支持尺寸: ${size}`
      });
    }
    
    // 计算价格
    const price = product.price * quantity;
    
    // 创建订单
    const newOrder = orderDb.addOrder({
      userId: userId || 'anonymous',
      imageUrl,
      productType,
      productName: product.name,
      size,
      quantity,
      price,
      totalPrice: price,
      status: 'pending',
      addressInfo,
      paymentStatus: 'unpaid'
    });
    
    return res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: {
        orderId: newOrder.orderId,
        totalPrice: newOrder.totalPrice,
        createdAt: newOrder.createdAt
      }
    });
  } catch (error) {
    logger.error(`创建打印订单失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '创建打印订单失败',
      error: error.message
    });
  }
};

/**
 * 获取订单详情
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getPrintOrderById = (req, res) => {
  try {
    const { orderId } = req.params;
    logger.info(`请求获取订单详情: ${orderId}`);
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID参数'
      });
    }
    
    const order = orderDb.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `未找到订单: ${orderId}`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '获取订单详情成功',
      data: order
    });
  } catch (error) {
    logger.error(`获取订单详情失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    });
  }
};

/**
 * 获取用户订单列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getUserOrders = (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    logger.info(`请求获取用户订单列表: 用户=${userId}, 页码=${page}, 每页=${limit}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID参数'
      });
    }
    
    const result = orderDb.getUserOrders(userId, page, limit);
    
    return res.status(200).json({
      success: true,
      message: '获取用户订单列表成功',
      data: result
    });
  } catch (error) {
    logger.error(`获取用户订单列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取用户订单列表失败',
      error: error.message
    });
  }
};

module.exports = {
  getPrintProducts,
  createPrintOrder,
  getPrintOrderById,
  getUserOrders
};
