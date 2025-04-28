/**
 * imageProcessing.js - 图像处理服务模块
 * 
 * 这个模块负责处理图像相关的功能，包括：
 * - 图像压缩
 * - 图像裁剪
 * - 图像格式转换
 * - 图像滤镜效果
 */

// 获取全局App实例
const app = getApp();

/**
 * 压缩图片
 * @param {string} imagePath - 图片路径
 * @param {number} quality - 压缩质量(0-100)
 * @returns {Promise<string>} 压缩后的图片路径
 */
function compressImage(imagePath, quality = 80) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: imagePath,
      quality: quality,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (err) => {
        console.error('压缩图片失败:', err);
        // 如果压缩失败，返回原图
        resolve(imagePath);
      }
    });
  });
}

/**
 * 裁剪图片
 * @param {string} imagePath - 图片路径
 * @param {Object} cropOptions - 裁剪选项
 * @returns {Promise<string>} 裁剪后的图片路径
 */
function cropImage(imagePath, cropOptions) {
  return new Promise((resolve, reject) => {
    // 微信小程序没有直接提供裁剪API，这里可以使用canvas实现
    // 为简化实现，这里只返回原图路径
    console.log('裁剪图片功能尚未实现，返回原图');
    resolve(imagePath);
  });
}

/**
 * 获取图片信息
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>} 图片信息
 */
function getImageInfo(imagePath) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: imagePath,
      success: (res) => {
        resolve({
          width: res.width,
          height: res.height,
          path: res.path,
          orientation: res.orientation,
          type: res.type
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 应用滤镜效果
 * @param {string} imagePath - 图片路径
 * @param {string} filterType - 滤镜类型
 * @returns {Promise<string>} 应用滤镜后的图片路径
 */
function applyFilter(imagePath, filterType) {
  return new Promise((resolve, reject) => {
    // 微信小程序没有直接提供滤镜API，这里可以使用canvas实现
    // 为简化实现，这里只返回原图路径
    console.log(`应用${filterType}滤镜功能尚未实现，返回原图`);
    resolve(imagePath);
  });
}

/**
 * 保存图片到相册
 * @param {string} imagePath - 图片路径
 * @returns {Promise<boolean>} 是否保存成功
 */
function saveImageToAlbum(imagePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        resolve(true);
      },
      fail: (err) => {
        console.error('保存图片到相册失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 检查图片是否合规
 * @param {string} imagePath - 图片路径
 * @returns {Promise<boolean>} 是否合规
 */
function checkImageCompliance(imagePath) {
  return new Promise((resolve) => {
    // 实际项目中，这里应该调用内容安全API检查图片
    // 为简化实现，这里直接返回合规
    console.log('图片合规性检查功能尚未实现，默认返回合规');
    resolve(true);
  });
}

/**
 * 预处理上传图片
 * @param {string} imagePath - 图片路径
 * @returns {Promise<string>} 预处理后的图片路径
 */
function preprocessImage(imagePath) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 获取图片信息
      const imageInfo = await getImageInfo(imagePath);
      
      // 2. 检查图片尺寸，如果太大则压缩
      let processedImagePath = imagePath;
      if (imageInfo.width > 2000 || imageInfo.height > 2000) {
        processedImagePath = await compressImage(imagePath, 80);
      }
      
      // 3. 检查图片合规性
      const isCompliant = await checkImageCompliance(processedImagePath);
      if (!isCompliant) {
        reject(new Error('图片内容不合规'));
        return;
      }
      
      resolve(processedImagePath);
    } catch (error) {
      console.error('预处理图片失败:', error);
      reject(error);
    }
  });
}

// 导出所有函数
module.exports = {
  compressImage,
  cropImage,
  getImageInfo,
  applyFilter,
  saveImageToAlbum,
  checkImageCompliance,
  preprocessImage
};
