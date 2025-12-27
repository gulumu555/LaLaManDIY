/**
 * 文件上传控制器
 * 处理图片上传并返回可访问的URL
 */
const path = require('path');
const logger = require('../utils/logger');
const storageService = require('../services/storage');

/**
 * 上传单张图片
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const uploadImage = async (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    logger.info(`文件上传成功: ${req.file.filename}`);

    // 如果使用本地存储，构建访问URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // 返回上传成功信息
    return res.status(200).json({
      success: true,
      message: '图片上传成功',
      data: {
        fileId: path.parse(req.file.filename).name, // 不含扩展名的文件名作为ID
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error(`上传图片失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '上传图片失败',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage
};
