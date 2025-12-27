/**
 * 动效处理控制器
 * 处理动效列表和动效生成请求
 */
const logger = require('../utils/logger');
const mcpService = require('../services/mcp');

/**
 * 获取可用动效列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getEffectsList = async (req, res) => {
  try {
    logger.info('请求获取动效列表');
    const result = await mcpService.getEffectsList();
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`获取动效列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取动效列表失败',
      error: error.message
    });
  }
};

/**
 * 应用动效处理
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const applyEffect = async (req, res) => {
  try {
    const { imageUrl, effectType, params } = req.body;
    logger.info(`请求动效处理: 图片=${imageUrl}, 动效=${effectType}`);
    
    // 验证参数
    if (!imageUrl || !effectType) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数，需要提供imageUrl和effectType'
      });
    }
    
    // 调用MCP服务进行动效处理
    const result = await mcpService.applyEffect(imageUrl, effectType, params || {});
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`动效处理失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '动效处理失败',
      error: error.message
    });
  }
};

module.exports = {
  getEffectsList,
  applyEffect
};
