// scene_enhance.js - 场景增强页面逻辑
const app = getApp();
// 导入图像处理服务
const imageProcessing = require('../../services/imageProcessing');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sourceImage: '', // 源图片路径
    resultImage: '', // 处理结果图片路径
    sceneCategory: 'mobile', // 场景类别：mobile(手机壁纸)、print(实体打印)、social(社交媒体)
    currentScene: '', // 当前选择的场景
    enableGif: false, // 是否启用GIF动画
    currentEffect: 'pulse', // 当前选择的GIF效果
    animationSpeed: 5, // 动画速度（1-10）
    animationIntensity: 5, // 动画强度（1-10）
    isPreviewLoading: false, // 预览加载状态
    isGenerating: false, // 生成图片状态
    // 场景配置数据
    sceneConfigs: {
      // 手机壁纸
      iphone15: { width: 1170, height: 2532, dpi: 460, name: 'iPhone 15 壁纸' },
      iphone14: { width: 1170, height: 2532, dpi: 460, name: 'iPhone 14 壁纸' },
      iphone13: { width: 1170, height: 2532, dpi: 460, name: 'iPhone 13 壁纸' },
      huawei: { width: 1080, height: 2340, dpi: 400, name: '华为手机壁纸' },
      xiaomi: { width: 1080, height: 2400, dpi: 400, name: '小米手机壁纸' },
      oppo: { width: 1080, height: 2400, dpi: 400, name: 'OPPO手机壁纸' },
      
      // 实体打印
      poster_small: { width: 2480, height: 3508, dpi: 300, name: 'A4海报' }, // A4尺寸
      poster_medium: { width: 3508, height: 4961, dpi: 300, name: 'A3海报' }, // A3尺寸
      poster_large: { width: 4961, height: 7016, dpi: 300, name: 'A2海报' }, // A2尺寸
      canvas_small: { width: 3543, height: 4724, dpi: 300, name: '30×40cm画布' }, // 30×40cm
      canvas_medium: { width: 5906, height: 8268, dpi: 300, name: '50×70cm画布' }, // 50×70cm
      canvas_large: { width: 8268, height: 11811, dpi: 300, name: '70×100cm画布' }, // 70×100cm
      
      // 社交媒体
      wechat: { width: 1080, height: 1920, dpi: 72, name: '微信朋友圈' },
      weibo: { width: 1200, height: 1200, dpi: 72, name: '微博配图' },
      douyin: { width: 1080, height: 1920, dpi: 72, name: '抖音封面' },
      xiaohongshu: { width: 1080, height: 1080, dpi: 72, name: '小红书配图' }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果从其他页面传入了图片路径，直接使用
    if (options.imagePath) {
      this.setData({
        sourceImage: options.imagePath
      });
    }
  },

  /**
   * 选择图片
   */
  chooseImage: function () {
    wx.chooseImage({
      count: 1, // 默认9，这里限制为1张
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机
      success: (res) => {
        // 返回选定照片的本地文件路径列表
        const tempFilePaths = res.tempFilePaths;
        
        // 更新数据，显示选中的图片
        this.setData({
          sourceImage: tempFilePaths[0],
          resultImage: '' // 清空之前的结果
        });
      }
    });
  },

  /**
   * 切换场景类别
   */
  switchSceneCategory: function (e) {
    const category = e.currentTarget.dataset.category;
    
    // 根据类别设置默认场景
    let defaultScene = '';
    switch (category) {
      case 'mobile':
        defaultScene = 'iphone15';
        break;
      case 'print':
        defaultScene = 'poster_small';
        break;
      case 'social':
        defaultScene = 'wechat';
        break;
    }
    
    this.setData({
      sceneCategory: category,
      currentScene: defaultScene,
      resultImage: '' // 切换类别时清空结果
    });
  },

  /**
   * 选择场景
   */
  selectScene: function (e) {
    const scene = e.currentTarget.dataset.scene;
    
    this.setData({
      currentScene: scene,
      resultImage: '' // 切换场景时清空结果
    });
  },

  /**
   * 预览图片
   */
  previewImage: function () {
    // 检查是否已选择图片和场景
    if (!this.data.sourceImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.currentScene) {
      wx.showToast({
        title: '请选择使用场景',
        icon: 'none'
      });
      return;
    }
    
    // 设置预览加载状态
    this.setData({
      isPreviewLoading: true
    });
    
    // 获取当前场景配置
    const sceneConfig = this.data.sceneConfigs[this.data.currentScene];
    
    // 根据是否启用GIF选择不同的处理方法
    if (this.data.enableGif) {
      // 使用GIF处理
      this.generateGifWithCurrentSettings(true)
        .then(result => {
          // 更新预览图
          this.setData({
            resultImage: result.tempFilePath,
            isPreviewLoading: false
          });
        })
        .catch(error => {
          console.error('预览GIF失败', error);
          wx.showToast({
            title: '预览失败，请重试',
            icon: 'none'
          });
          this.setData({
            isPreviewLoading: false
          });
        });
    } else {
      // 使用普通图片处理
      // 构建图片处理选项
      const options = {
        width: sceneConfig.width,
        height: sceneConfig.height,
        dpi: sceneConfig.dpi,
        quality: 60, // 预览使用较低质量
        smartCrop: true, // 智能裁剪
        enhance: true // 自动增强
      };
      
      // 调用图像处理服务优化图片
      imageProcessing.enhanceImageForScene(
        this.data.sourceImage,
        options
      ).then(result => {
        // 更新预览图
        this.setData({
          resultImage: result.tempFilePath,
          isPreviewLoading: false
        });
      }).catch(error => {
        console.error('预览图片失败', error);
        wx.showToast({
          title: '预览失败，请重试',
          icon: 'none'
        });
        this.setData({
          isPreviewLoading: false
        });
      });
    }
  },

  /**
   * 生成图片
   */
  generateImage: function () {
    // 检查是否已选择图片和场景
    if (!this.data.sourceImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.currentScene) {
      wx.showToast({
        title: '请选择使用场景',
        icon: 'none'
      });
      return;
    }
    
    // 设置生成状态
    this.setData({
      isGenerating: true
    });
    
    // 获取当前场景配置
    const sceneConfig = this.data.sceneConfigs[this.data.currentScene];
    
    // 根据是否启用GIF选择不同的处理方法
    if (this.data.enableGif) {
      // 使用GIF处理
      this.generateGifWithCurrentSettings(false)
        .then(result => {
          // 更新结果
          this.setData({
            resultImage: result.tempFilePath,
            isGenerating: false
          });
          
          wx.showToast({
            title: 'GIF生成成功',
            icon: 'success'
          });
        })
        .catch(error => {
          console.error('生成GIF失败', error);
          wx.showToast({
            title: '生成失败，请重试',
            icon: 'none'
          });
          this.setData({
            isGenerating: false
          });
        });
    } else {
      // 使用普通图片处理
      // 构建图片处理选项
      const options = {
        width: sceneConfig.width,
        height: sceneConfig.height,
        dpi: sceneConfig.dpi,
        quality: 90, // 生成使用高质量
        smartCrop: true, // 智能裁剪
        enhance: true // 自动增强
      };
      
      // 调用图像处理服务优化图片
      imageProcessing.enhanceImageForScene(
        this.data.sourceImage,
        options
      ).then(result => {
        // 更新结果
        this.setData({
          resultImage: result.tempFilePath,
          isGenerating: false
        });
        
        wx.showToast({
          title: '图片生成成功',
          icon: 'success'
        });
      }).catch(error => {
        console.error('生成图片失败', error);
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        });
        this.setData({
          isGenerating: false
        });
      });
    }
  },

  /**
   * 根据当前设置生成GIF
   * @param {boolean} isPreview - 是否为预览模式
   * @returns {Promise} - 返回Promise对象
   */
  generateGifWithCurrentSettings: function (isPreview = false) {
    // 获取当前场景配置
    const sceneConfig = this.data.sceneConfigs[this.data.currentScene];
    
    // 构建GIF生成选项
    const options = {
      // 预览模式使用较低质量和帧数以加快速度
      frames: isPreview ? 5 : 10,
      duration: 1000 * (11 - this.data.animationSpeed) / 5, // 速度转换为持续时间
      quality: isPreview ? 5 : 10,
      intensity: this.data.animationIntensity / 10, // 强度归一化到0-1范围
      width: sceneConfig.width,
      height: sceneConfig.height,
      dpi: sceneConfig.dpi,
      smartCrop: true, // 智能裁剪
      enhance: true // 自动增强
    };
    
    // 调用图像处理服务生成GIF
    return imageProcessing.createGifAnimation(
      this.data.sourceImage,
      this.data.currentEffect,
      options,
      false // 不强制使用云端处理
    );
  },

  /**
   * 保存到相册
   */
  saveToAlbum: function () {
    if (!this.data.resultImage) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'none'
      });
      return;
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultImage,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存失败', err);
        
        // 如果是因为用户拒绝授权导致的失败
        if (err.errMsg.indexOf('auth deny') >= 0) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    console.log('设置结果', settingRes);
                  }
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 跳转到订单页面
   */
  navigateToOrder: function () {
    if (!this.data.resultImage) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'none'
      });
      return;
    }
    
    // 获取当前场景配置
    const sceneConfig = this.data.sceneConfigs[this.data.currentScene];
    
    // 将生成的图片路径和场景信息保存到全局数据
    const globalData = app.globalData || {};
    globalData.tempImagePath = this.data.resultImage;
    globalData.currentScene = {
      id: this.data.currentScene,
      name: sceneConfig.name,
      width: sceneConfig.width,
      height: sceneConfig.height,
      dpi: sceneConfig.dpi,
      isGif: this.data.enableGif
    };
    
    // 跳转到订单页面
    wx.navigateTo({
      url: '/pages/order/order?type=' + (this.data.enableGif ? 'gif' : 'image') + '&from=scene_enhance'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我用LaLaManDIY优化了一张图片',
      path: '/pages/index/index',
      imageUrl: this.data.resultImage || this.data.sourceImage || '/images/share_default.png'
    };
  }
});
