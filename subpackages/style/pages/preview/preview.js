// preview.js - 处理结果预览页面
const app = getApp();

Page({
  data: {
    resultImagePath: '', // 处理后的图片路径
    originalImagePath: '', // 原始图片路径
    processType: '', // 处理类型：style, enhance, gif
    styleId: '', // 风格ID
    styleName: '', // 风格名称
    effectType: '', // GIF效果类型
    selectedResolution: 'small', // 默认选择小尺寸
    isLoading: false, // 加载状态
    loadingText: '正在处理中...', // 加载提示文本
    imageRatio: '1:1', // 默认图片比例为1:1
    smallResolution: '512 x 512', // 默认小尺寸分辨率
    // 分辨率配置
    resolutions: {
      small: {
        width: 512,
        height: 512,
        isPremium: false
      },
      phone: {
        width: 3000,
        height: 6500,
        isPremium: true
      },
      phone2: {
        width: 2358,
        height: 5112,
        isPremium: true
      },
      tablet: {
        width: 4096,
        height: 3072,
        isPremium: true
      },
      pc: {
        width: 5120,
        height: 2880,
        isPremium: true
      },
      mac: {
        width: 3840,
        height: 2496,
        isPremium: true
      }
    }
  },

  onLoad: function(options) {
    console.log('预览页面参数:', options);
    
    // 设置页面数据
    this.setData({
      resultImagePath: options.imagePath || '',
      originalImagePath: options.originalPath || '',
      processType: options.processType || 'style',
      styleId: options.styleId || '',
      styleName: options.styleName || '',
      effectType: options.effectType || ''
    });
    
    // 获取图片信息，计算长宽比
    this.getImageInfo(options.imagePath);
    
    // 记录到历史
    this.addToHistory();
  },
  
  // 获取图片信息
  getImageInfo: function(imagePath) {
    wx.getImageInfo({
      src: imagePath,
      success: (res) => {
        console.log('图片信息:', res);
        const width = res.width;
        const height = res.height;
        let ratio = '';
        let smallWidth = 512;
        let smallHeight = 512;
        
        // 计算长宽比
        if (width === height) {
          // 1:1
          ratio = '1:1';
          smallWidth = 512;
          smallHeight = 512;
        } else if (width > height) {
          // 宽图，如3:2
          const gcd = this.getGCD(width, height);
          const w = width / gcd;
          const h = height / gcd;
          ratio = `${w}:${h}`;
          
          if (Math.abs(w/h - 3/2) < 0.1) {
            // 接近3:2
            smallWidth = 768;
            smallHeight = 512;
          } else {
            // 其他比例，保持高度为512
            smallWidth = Math.round(512 * (width / height));
            smallHeight = 512;
          }
        } else {
          // 长图，如2:3
          const gcd = this.getGCD(width, height);
          const w = width / gcd;
          const h = height / gcd;
          ratio = `${w}:${h}`;
          
          if (Math.abs(w/h - 2/3) < 0.1) {
            // 接近2:3
            smallWidth = 512;
            smallHeight = 768;
          } else {
            // 其他比例，保持宽度为512
            smallWidth = 512;
            smallHeight = Math.round(512 * (height / width));
          }
        }
        
        // 更新小尺寸分辨率
        this.setData({
          imageRatio: ratio,
          smallResolution: `${smallWidth} x ${smallHeight}`,
          'resolutions.small.width': smallWidth,
          'resolutions.small.height': smallHeight
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败:', err);
      }
    });
  },
  
  // 计算最大公约数
  getGCD: function(a, b) {
    if (!b) {
      return a;
    }
    return this.getGCD(b, a % b);
  },
  
  // 添加到历史记录
  addToHistory: function() {
    const historyItem = {
      id: new Date().getTime(),
      imagePath: this.data.resultImagePath,
      processType: this.data.processType,
      styleName: this.data.styleName,
      timestamp: new Date().toISOString()
    };
    
    // 获取现有历史记录
    const history = wx.getStorageSync('history') || [];
    
    // 添加新记录到开头
    history.unshift(historyItem);
    
    // 限制历史记录数量
    if (history.length > 50) {
      history.pop();
    }
    
    // 保存更新后的历史记录
    wx.setStorageSync('history', history);
  },
  
  // 选择分辨率
  selectResolution: function(e) {
    const resolution = e.currentTarget.dataset.resolution;
    const isPremium = this.data.resolutions[resolution].isPremium;
    
    if (isPremium && !app.globalData.isPremiumUser) {
      // 如果是付费选项且用户不是会员，显示购买提示
      wx.showModal({
        title: '会员功能',
        content: '该分辨率需要会员权限，是否立即开通会员？',
        confirmText: '立即开通',
        cancelText: '暂不开通',
        success: (res) => {
          if (res.confirm) {
            // 跳转到会员购买页面
            wx.navigateTo({
              url: '/subpackages/shop/pages/shop/shop'
            });
          }
        }
      });
    } else {
      // 更新选中的分辨率
      this.setData({
        selectedResolution: resolution
      });
    }
  },
  
  // 保存图片到相册
  saveImage: function() {
    const that = this;
    const resolution = this.data.selectedResolution;
    const resConfig = this.data.resolutions[resolution];
    
    // 显示加载提示
    this.setData({
      isLoading: true,
      loadingText: '正在保存图片...'
    });
    
    // 根据选择的分辨率处理图片
    if (this.data.processType === 'gif' && resolution === 'small') {
      // 如果是GIF且选择的是小尺寸，直接保存
      this.saveImageToAlbum(this.data.resultImagePath);
    } else {
      // 其他情况，根据分辨率调整后保存
      // 这里应该调用后端API进行高分辨率处理
      // 模拟API调用
      setTimeout(() => {
        // 实际项目中应该替换为真实的API调用
        this.saveImageToAlbum(this.data.resultImagePath);
      }, 1500);
    }
  },
  
  // 保存图片到相册的具体实现
  saveImageToAlbum: function(imagePath) {
    const that = this;
    
    // 保存图片到相册
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: function(res) {
        that.setData({
          isLoading: false
        });
        
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(res) {
        that.setData({
          isLoading: false
        });
        
        if (res.errMsg.indexOf('auth deny') >= 0) {
          // 用户拒绝授权
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function(settingRes) {
                    console.log(settingRes);
                    if (settingRes.authSetting['scope.writePhotosAlbum']) {
                      wx.showToast({
                        title: '授权成功，请重新保存',
                        icon: 'none',
                        duration: 2000
                      });
                    } else {
                      wx.showToast({
                        title: '授权失败，无法保存图片',
                        icon: 'none',
                        duration: 2000
                      });
                    }
                  }
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },
  
  // 分享到微信
  shareToWechat: function() {
    // 使用小程序原生分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    });
  },
  
  // 分享到朋友圈
  shareToMoments: function() {
    // 使用小程序原生分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareTimeline']
    });
  },
  
  // 重新开始
  restartProcess: function() {
    // 返回到首页
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },
  
  // 返回上一页
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  // 分享配置
  onShareAppMessage: function() {
    return {
      title: `我用啦啦漫创作了一张${this.data.styleName}风格的图片`,
      path: '/pages/index/index',
      imageUrl: this.data.resultImagePath
    };
  },
  
  // 分享到朋友圈配置
  onShareTimeline: function() {
    return {
      title: `我用啦啦漫创作了一张${this.data.styleName}风格的图片`,
      imageUrl: this.data.resultImagePath
    };
  }
});