/**
 * 风格转换控制器
 * 处理风格分类、风格列表和风格转换请求
 */
const logger = require('../utils/logger');
const mcpService = require('../services/mcp');

/**
 * 获取风格分类列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getStyleCategories = async (req, res) => {
  try {
    logger.info('请求获取风格分类列表');
    const result = await mcpService.getStyleCategories();
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`获取风格分类失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取风格分类失败',
      error: error.message
    });
  }
};

/**
 * 获取指定分类下的风格列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getStylesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    logger.info(`请求获取分类 ${categoryId} 下的风格列表`);
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: '缺少分类ID参数'
      });
    }
    
    const result = await mcpService.getStylesByCategory(categoryId);
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`获取风格列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取风格列表失败',
      error: error.message
    });
  }
};

/**
 * 应用风格转换
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const applyStyle = async (req, res) => {
  try {
    const { imageUrl, styleId } = req.body;
    logger.info(`请求风格转换: 图片=${imageUrl}, 风格=${styleId}`);
    
    // 验证参数
    if (!imageUrl || !styleId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数，需要提供imageUrl和styleId'
      });
    }
    
    // 调用MCP服务进行风格转换
    const result = await mcpService.applyStyle(imageUrl, styleId);
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`风格转换失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '风格转换失败',
      error: error.message
    });
  }
};

module.exports = {
  getStyleCategories,
  getStylesByCategory,
  applyStyle
};
