/**
 * api.js - API服务模块
 * 
 * 这个模块负责处理与后端服务器的所有通信，包括：
 * - 图片上传
 * - 动效处理
 * - 风格转换
 * - 打印服务
 * - 用户认证
 */

// 获取全局App实例
const app = getApp();

/**
 * 基础请求函数 - 封装wx.request
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求地址（不含基础URL）
 * @param {string} options.method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.needAuth - 是否需要认证token
 * @returns {Promise} 返回Promise对象
 */
function request(options) {
  // 完整URL = 基础URL + 接口路径
  const url = app.globalData.apiBaseUrl + options.url;
  
  // 设置请求头
  const header = {
    'content-type': 'application/json'
  };
  
  // 如果需要认证，添加token到请求头
  if (options.needAuth) {
    const token = wx.getStorageSync('token');
    if (token) {
      header['Authorization'] = 'Bearer ' + token;
    } else {
      // 没有token，可能需要登录
      return Promise.reject(new Error('未登录或登录已过期'));
    }
  }
  
  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      success: (res) => {
        // 请求成功，但需要检查业务状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，可能是token过期
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          app.globalData.hasLogin = false;
          app.globalData.userInfo = null;
          
          // 提示用户重新登录
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          
          reject(new Error('登录已过期'));
        } else {
          // 其他错误
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        // 网络错误等
        console.error('网络请求失败:', err);
        
        // 开发环境模拟数据（避免API未准备好时无法测试）
        if (app.globalData.apiBaseUrl.includes('127.0.0.1') || app.globalData.apiBaseUrl.includes('localhost')) {
          console.log('开发环境：返回模拟数据');
          
          // 根据请求路径返回不同的模拟数据
          if (options.url.includes('/style/categories')) {
            // 模拟风格分类数据
            resolve([
              { id: 'popular', name: '热门风格' },
              { id: 'cartoon', name: '卡通动漫' },
              { id: 'painting', name: '绘画艺术' },
              { id: 'photo', name: '写实照片' },
              { id: 'special', name: '特殊效果' }
            ]);
          } else if (options.url.includes('/effect/categories')) {
            // 模拟动效分类数据
            resolve([
              { id: 'popular', name: '热门动效' },
              { id: 'funny', name: '趣味表情' },
              { id: 'anime', name: '二次元' },
              { id: 'special', name: '特效' },
              { id: 'celebration', name: '庆祝' }
            ]);
          } else if (options.url.includes('/style/category/')) {
            // 模拟特定分类下的风格列表
            const categoryId = options.url.split('/').pop(); // 获取分类 ID
            
            // 根据分类 ID 返回不同的风格列表
            let styles = [];
            
            switch(categoryId) {
              case 'popular':
                styles = [
                  { id: 'ghibli', name: '吉博力风格', thumbnail: '/images/styles/style1_ghibli.png' },
                  { id: 'miyazaki', name: '宫崎骏风格', thumbnail: '/images/styles/style2_miyazaki.png' },
                  { id: 'shinkai', name: '新海诚风格', thumbnail: '/images/styles/style3_shinkai.png' }
                ];
                break;
              case 'cartoon':
                styles = [
                  { id: 'pixar', name: '皮克斯风格', thumbnail: '/images/styles/style7_pixar.png' },
                  { id: 'disney', name: '迪士尼风格', thumbnail: '/images/styles/style10_disney.png' },
                  { id: 'pokemon', name: '神奇宝贝风格', thumbnail: '/images/styles/style8_pikachu.png' }
                ];
                break;
              case 'painting':
                styles = [
                  { id: 'ink', name: '水墨画风格', thumbnail: '/images/styles/style4_ink.png' },
                  { id: 'watercolor', name: '水彩画风格', thumbnail: '/images/styles/style5_watercolor.png' },
                  { id: 'oilpainting', name: '油画风格', thumbnail: '/images/styles/style6_love_death.png' }
                ];
                break;
              case 'photo':
                styles = [
                  { id: 'portrait', name: '人像写真', thumbnail: '/images/styles/style9_celshading.png' },
                  { id: 'landscape', name: '风景写真', thumbnail: '/images/styles/style2_miyazaki.png' },
                  { id: 'blackwhite', name: '黑白照片', thumbnail: '/images/styles/style4_ink.png' }
                ];
                break;
              case 'special':
                styles = [
                  { id: 'cyberpunk', name: '赛博服克', thumbnail: '/images/styles/style6_love_death.png' },
                  { id: 'retro', name: '复古风格', thumbnail: '/images/styles/style5_watercolor.png' },
                  { id: 'futuristic', name: '未来风格', thumbnail: '/images/styles/style10_disney.png' }
                ];
                break;
              default:
                styles = [
                  { id: 'default1', name: '默认风格1', thumbnail: '/images/styles/style1_ghibli.png' },
                  { id: 'default2', name: '默认风格2', thumbnail: '/images/styles/style2_miyazaki.png' },
                  { id: 'default3', name: '默认风格3', thumbnail: '/images/styles/style3_shinkai.png' }
                ];
            }
            
            resolve(styles);
          } else if (options.url.includes('/style/process')) {
            // 模拟风格处理结果
            resolve({
              success: true,
              imageUrl: '/images/demo/processed_image.jpg',
              message: '风格转换成功'
            });
          } else if (options.url.includes('/effect/process')) {
            // 模拟动效处理结果
            resolve({
              success: true,
              gifUrl: '/images/demo/animated.gif',
              message: '动效处理成功'
            });
          } else if (options.url.includes('/print/order')) {
            // 模拟下单结果
            resolve({
              success: true,
              orderId: 'ORDER' + Date.now(),
              message: '下单成功'
            });
          } else if (options.url.includes('/style/preview')) {
            // 模拟风格预览结果
            resolve({
              success: true,
              previewUrl: '/images/styles/previews/style_preview.jpg',
              message: '预览生成成功'
            });
          } else if (options.url.includes('/effect/preview')) {
            // 模拟动效预览结果
            resolve({
              success: true,
              previewUrl: '/images/effects/previews/effect_preview.gif',
              message: '预览生成成功'
            });
          } else {
            // 其他API默认成功响应
            resolve({
              success: true,
              message: '操作成功（模拟数据）'
            });
          }
        } else {
          // 生产环境正常报错
          reject(err);
        }
      }
    });
  });
}

/**
 * 上传图片
 * @param {string} filePath - 本地图片路径
 * @param {string} type - 上传类型（style/effect/print）
 * @returns {Promise} 上传结果
 */
function uploadImage(filePath, type) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: app.globalData.apiBaseUrl + '/upload',
      filePath: filePath,
      name: 'image',
      formData: {
        type: type
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('解析响应失败'));
        }
      },
      fail: (err) => {
        console.error('上传图片失败:', err);
        
        // 开发环境模拟成功上传
        if (app.globalData.apiBaseUrl.includes('127.0.0.1') || app.globalData.apiBaseUrl.includes('localhost')) {
          console.log('开发环境：模拟图片上传成功');
          resolve({
            success: true,
            imageUrl: '/images/demo/uploaded_image.jpg',
            imageId: 'IMG' + Date.now(),
            message: '上传成功（模拟数据）'
          });
        } else {
          reject(err);
        }
      }
    });
  });
}

/**
 * 风格转换处理
 * @param {string} imageId - 图片ID
 * @param {string} styleId - 风格ID
 * @returns {Promise} 处理结果
 */
function processStyle(imageId, styleId) {
  return request({
    url: '/style/process',
    method: 'POST',
    data: {
      imageId: imageId,
      styleId: styleId
    },
    needAuth: true
  });
}

/**
 * 动效处理
 * @param {string} imageId - 图片ID
 * @param {string} effectId - 动效ID
 * @returns {Promise} 处理结果
 */
function processEffect(imageId, effectId) {
  return request({
    url: '/effect/process',
    method: 'POST',
    data: {
      imageId: imageId,
      effectId: effectId
    },
    needAuth: true
  });
}

/**
 * 获取风格列表
 * @returns {Promise} 风格列表
 */
function getStyleList() {
  return request({
    url: '/style/list',
    method: 'GET',
    needAuth: false
  });
}

/**
 * 获取动效列表
 * @returns {Promise} 动效列表
 */
function getEffectList() {
  return request({
    url: '/effect/list',
    method: 'GET',
    needAuth: false
  });
}

/**
 * 创建打印订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise} 订单结果
 */
function createPrintOrder(orderData) {
  return request({
    url: '/print/order',
    method: 'POST',
    data: orderData,
    needAuth: true
  });
}

/**
 * 获取用户订单列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise} 订单列表
 */
function getUserOrders(page = 1, limit = 10) {
  return request({
    url: '/user/orders',
    method: 'GET',
    data: {
      page: page,
      limit: limit
    },
    needAuth: true
  });
}

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise} 订单详情
 */
function getOrderDetail(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'GET',
    needAuth: true
  });
}

/**
 * 获取首页画廊图片
 * @param {boolean} featured - 是否只获取精选图片
 * @returns {Promise} 画廊图片列表
 */
function getGalleryImages(featured = false) {
  return request({
    url: '/gallery/images',
    method: 'GET',
    data: { featured },
    needAuth: false
  });
}

/**
 * 获取风格分类
 * @returns {Promise} 风格分类列表
 */
function getStyleCategories() {
  return request({
    url: '/style/categories',
    method: 'GET',
    needAuth: false
  });
}

/**
 * 获取特定分类下的风格列表
 * @param {string} categoryId - 分类 ID
 * @returns {Promise} 风格列表
 */
function getStylesByCategory(categoryId) {
  return request({
    url: `/style/category/${categoryId}`,
    method: 'GET',
    needAuth: false
  });
}

/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @returns {Promise} 登录结果
 */
function login(loginData) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: loginData,
    needAuth: false
  });
}

/**
 * 用户登出
 * @returns {Promise} 登出结果
 */
function logout() {
  return request({
    url: '/auth/logout',
    method: 'POST',
    needAuth: true
  });
}

/**
 * 获取动效分类
 * @returns {Promise} 动效分类列表
 */
function getEffectCategories() {
  return request({
    url: '/effect/categories',
    method: 'GET',
    needAuth: false
  });
}

/**
 * 获取动效预览
 * @param {string} imageId - 图片ID
 * @param {string} effectId - 动效ID
 * @returns {Promise} 动效预览结果
 */
function getEffectPreview(imageId, effectId) {
  return request({
    url: '/effect/preview',
    method: 'POST',
    data: { imageId, effectId },
    needAuth: true
  });
}

/**
 * 获取风格预览
 * @param {string} imageId - 图片ID
 * @param {string} styleId - 风格 ID
 * @returns {Promise} 风格预览结果
 */
function getStylePreview(imageId, styleId) {
  return request({
    url: '/style/preview',
    method: 'POST',
    data: { imageId, styleId },
    needAuth: true
  });
}

/**
 * 保存动效结果
 * @param {string} gifUrl - GIF URL
 * @param {string} title - 标题
 * @returns {Promise} 保存结果
 */
function saveEffectResult(gifUrl, title) {
  return request({
    url: '/effect/save',
    method: 'POST',
    data: { gifUrl, title },
    needAuth: true
  });
}

/**
 * 保存风格结果
 * @param {string} imageUrl - 处理后的图片URL
 * @param {string} title - 标题
 * @returns {Promise} 保存结果
 */
function saveStyleResult(imageUrl, title) {
  return request({
    url: '/style/save',
    method: 'POST',
    data: { imageUrl, title },
    needAuth: true
  });
}

/**
 * 获取用户保存的风格作品列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise} 作品列表
 */
function getUserStyles(page = 1, limit = 10) {
  return request({
    url: '/style/user',
    method: 'GET',
    data: { page, limit },
    needAuth: true
  });
}

/**
 * 获取用户保存的动效列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise} 动效列表
 */
function getUserEffects(page = 1, limit = 10) {
  return request({
    url: '/effect/user',
    method: 'GET',
    data: { page, limit },
    needAuth: true
  });
}

// 导出所有API函数
module.exports = {
  uploadImage,
  processStyle,
  processEffect,
  getStyleList,
  getEffectList,
  createPrintOrder,
  getUserOrders,
  getOrderDetail,
  getGalleryImages,
  getStyleCategories,
  getStylesByCategory,
  getEffectCategories,
  getEffectPreview,
  getStylePreview,
  saveEffectResult,
  saveStyleResult,
  getUserEffects,
  getUserStyles,
  login,
  logout
};
