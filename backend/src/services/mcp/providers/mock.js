/**
 * 模拟数据提供商
 * 用于开发和测试阶段，不依赖真实的AI服务
 */
const logger = require('../../../utils/logger');

// 模拟延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 模拟风格转换
 * @param {string} imageUrl - 原始图片URL
 * @param {string} styleId - 风格ID
 * @returns {Promise<Object>} 转换结果
 */
const applyStyle = async (imageUrl, styleId) => {
  logger.info(`模拟风格转换: 图片=${imageUrl}, 风格=${styleId}`);
  
  // 模拟处理延迟
  await delay(1500);
  
  // 从原始URL中提取文件名
  const fileName = imageUrl.split('/').pop();
  const baseName = fileName.split('.')[0];
  
  // 构造一个模拟的结果URL（实际上还是原图）
  const resultUrl = imageUrl;
  
  return {
    success: true,
    message: '风格转换成功',
    data: {
      originalUrl: imageUrl,
      resultUrl: resultUrl,
      styleId: styleId,
      styleName: getStyleNameById(styleId),
      processTime: 1.5
    }
  };
};

/**
 * 模拟动效处理
 * @param {string} imageUrl - 原始图片URL
 * @param {string} effectType - 动效类型
 * @param {Object} params - 动效参数
 * @returns {Promise<Object>} 处理结果
 */
const applyEffect = async (imageUrl, effectType, params = {}) => {
  logger.info(`模拟动效处理: 图片=${imageUrl}, 动效=${effectType}`);
  
  // 模拟处理延迟
  await delay(2000);
  
  // 从原始URL中提取文件名
  const fileName = imageUrl.split('/').pop();
  const baseName = fileName.split('.')[0];
  
  // 构造一个模拟的结果URL（实际上还是原图，但在真实环境中应该是GIF或视频）
  const resultUrl = imageUrl;
  
  return {
    success: true,
    message: '动效处理成功',
    data: {
      originalUrl: imageUrl,
      resultUrl: resultUrl,
      effectType: effectType,
      effectName: getEffectNameByType(effectType),
      processTime: 2.0
    }
  };
};

/**
 * 获取风格分类列表
 * @returns {Promise<Array>} 风格分类列表
 */
const getStyleCategories = async () => {
  logger.info('获取风格分类列表');
  
  // 模拟延迟
  await delay(300);
  
  return {
    success: true,
    message: '获取风格分类成功',
    data: [
      { id: 'popular', name: '热门风格', icon: '🔥' },
      { id: 'cartoon', name: '卡通动漫', icon: '🎭' },
      { id: 'painting', name: '绘画艺术', icon: '🎨' },
      { id: 'photo', name: '写实照片', icon: '📷' },
      { id: 'special', name: '特殊效果', icon: '✨' }
    ]
  };
};

/**
 * 获取指定分类下的风格列表
 * @param {string} categoryId - 分类ID
 * @returns {Promise<Array>} 风格列表
 */
const getStylesByCategory = async (categoryId) => {
  logger.info(`获取风格列表: 分类=${categoryId}`);
  
  // 模拟延迟
  await delay(500);
  
  // 根据分类返回不同的风格列表
  let styles = [];
  
  switch (categoryId) {
    case 'popular':
      styles = [
        { id: 'comic', name: '漫画风格', previewUrl: '/mock/styles/comic.jpg' },
        { id: 'oil', name: '油画风格', previewUrl: '/mock/styles/oil.jpg' },
        { id: 'pixel', name: '像素风格', previewUrl: '/mock/styles/pixel.jpg' },
        { id: 'watercolor', name: '水彩风格', previewUrl: '/mock/styles/watercolor.jpg' }
      ];
      break;
    case 'cartoon':
      styles = [
        { id: 'anime', name: '日系动漫', previewUrl: '/mock/styles/anime.jpg' },
        { id: 'comic', name: '美漫风格', previewUrl: '/mock/styles/comic.jpg' },
        { id: 'pixel', name: '像素风格', previewUrl: '/mock/styles/pixel.jpg' },
        { id: 'chibi', name: '可爱Q版', previewUrl: '/mock/styles/chibi.jpg' }
      ];
      break;
    case 'painting':
      styles = [
        { id: 'oil', name: '油画风格', previewUrl: '/mock/styles/oil.jpg' },
        { id: 'watercolor', name: '水彩风格', previewUrl: '/mock/styles/watercolor.jpg' },
        { id: 'ink', name: '水墨画', previewUrl: '/mock/styles/ink.jpg' },
        { id: 'sketch', name: '素描风格', previewUrl: '/mock/styles/sketch.jpg' }
      ];
      break;
    case 'photo':
      styles = [
        { id: 'portrait', name: '人像写实', previewUrl: '/mock/styles/portrait.jpg' },
        { id: 'landscape', name: '风景写实', previewUrl: '/mock/styles/landscape.jpg' },
        { id: 'film', name: '电影胶片', previewUrl: '/mock/styles/film.jpg' },
        { id: 'hdr', name: 'HDR效果', previewUrl: '/mock/styles/hdr.jpg' }
      ];
      break;
    case 'special':
      styles = [
        { id: 'neon', name: '霓虹效果', previewUrl: '/mock/styles/neon.jpg' },
        { id: 'glitch', name: '故障艺术', previewUrl: '/mock/styles/glitch.jpg' },
        { id: 'vaporwave', name: '蒸汽波', previewUrl: '/mock/styles/vaporwave.jpg' },
        { id: 'mosaic', name: '马赛克', previewUrl: '/mock/styles/mosaic.jpg' }
      ];
      break;
    default:
      styles = [
        { id: 'comic', name: '漫画风格', previewUrl: '/mock/styles/comic.jpg' },
        { id: 'oil', name: '油画风格', previewUrl: '/mock/styles/oil.jpg' }
      ];
  }
  
  return {
    success: true,
    message: '获取风格列表成功',
    data: styles
  };
};

/**
 * 获取动效列表
 * @returns {Promise<Array>} 动效列表
 */
const getEffectsList = async () => {
  logger.info('获取动效列表');
  
  // 模拟延迟
  await delay(300);
  
  return {
    success: true,
    message: '获取动效列表成功',
    data: [
      { id: 'shake', name: '抖动效果', icon: '📳', previewUrl: '/mock/effects/shake.gif' },
      { id: 'zoom', name: '缩放效果', icon: '🔍', previewUrl: '/mock/effects/zoom.gif' },
      { id: 'rotate', name: '旋转效果', icon: '🔄', previewUrl: '/mock/effects/rotate.gif' },
      { id: 'flash', name: '闪烁效果', icon: '⚡', previewUrl: '/mock/effects/flash.gif' },
      { id: 'bounce', name: '弹跳效果', icon: '🏀', previewUrl: '/mock/effects/bounce.gif' },
      { id: 'glitch', name: '故障效果', icon: '👾', previewUrl: '/mock/effects/glitch.gif' }
    ]
  };
};

// 辅助函数：根据风格ID获取风格名称
function getStyleNameById(styleId) {
  const styleMap = {
    'comic': '漫画风格',
    'oil': '油画风格',
    'pixel': '像素风格',
    'watercolor': '水彩风格',
    'anime': '日系动漫',
    'chibi': '可爱Q版',
    'ink': '水墨画',
    'sketch': '素描风格',
    'portrait': '人像写实',
    'landscape': '风景写实',
    'film': '电影胶片',
    'hdr': 'HDR效果',
    'neon': '霓虹效果',
    'glitch': '故障艺术',
    'vaporwave': '蒸汽波',
    'mosaic': '马赛克'
  };
  
  return styleMap[styleId] || '未知风格';
}

// 辅助函数：根据动效类型获取动效名称
function getEffectNameByType(effectType) {
  const effectMap = {
    'shake': '抖动效果',
    'zoom': '缩放效果',
    'rotate': '旋转效果',
    'flash': '闪烁效果',
    'bounce': '弹跳效果',
    'glitch': '故障效果'
  };
  
  return effectMap[effectType] || '未知动效';
}

module.exports = {
  applyStyle,
  applyEffect,
  getStyleCategories,
  getStylesByCategory,
  getEffectsList
};
