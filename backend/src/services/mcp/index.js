/**
 * MCP (Model Control Panel) 服务
 * 统一管理不同的AI模型服务，实现无缝切换
 */
const config = require('./config');
const logger = require('../../utils/logger');

// 动态导入当前配置的提供商
const getProvider = () => {
  const providerName = config.currentProvider;
  
  try {
    // 尝试加载指定的提供商
    const provider = require(`./providers/${providerName}`);
    logger.info(`已加载 ${providerName} 提供商`);
    return provider;
  } catch (error) {
    // 如果指定提供商不存在，回退到mock
    logger.warn(`提供商 ${providerName} 加载失败，使用mock替代: ${error.message}`);
    return require('./providers/mock');
  }
};

/**
 * 风格转换服务
 * @param {string} imageUrl - 原始图片URL
 * @param {string} styleId - 风格ID
 * @returns {Promise<Object>} 转换结果
 */
const applyStyle = async (imageUrl, styleId) => {
  const provider = getProvider();
  logger.info(`使用 ${config.currentProvider} 提供商处理风格转换`);
  return provider.applyStyle(imageUrl, styleId);
};

/**
 * 动效处理服务
 * @param {string} imageUrl - 原始图片URL
 * @param {string} effectType - 动效类型
 * @param {Object} params - 动效参数
 * @returns {Promise<Object>} 处理结果
 */
const applyEffect = async (imageUrl, effectType, params = {}) => {
  const provider = getProvider();
  logger.info(`使用 ${config.currentProvider} 提供商处理动效`);
  return provider.applyEffect(imageUrl, effectType, params);
};

/**
 * 获取可用风格分类
 * @returns {Promise<Array>} 风格分类列表
 */
const getStyleCategories = async () => {
  const provider = getProvider();
  return provider.getStyleCategories();
};

/**
 * 获取指定分类下的风格列表
 * @param {string} categoryId - 分类ID
 * @returns {Promise<Array>} 风格列表
 */
const getStylesByCategory = async (categoryId) => {
  const provider = getProvider();
  return provider.getStylesByCategory(categoryId);
};

/**
 * 获取可用动效列表
 * @returns {Promise<Array>} 动效列表
 */
const getEffectsList = async () => {
  const provider = getProvider();
  return provider.getEffectsList();
};

module.exports = {
  applyStyle,
  applyEffect,
  getStyleCategories,
  getStylesByCategory,
  getEffectsList,
  
  // 提供商管理
  getProviderConfig: config.getProviderConfig,
  getAllProviders: config.getAllProviders,
  switchProvider: config.switchProvider
};
