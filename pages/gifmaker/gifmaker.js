// gifmaker.js - GIF动画制作页面逻辑
const app = getApp();
// 导入图像处理服务
const imageProcessing = require('../../services/imageProcessing');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sourceImage: '', // 源图片路径
    resultGif: '', // 生成的GIF路径
    effectCategory: 'simple', // 效果类别：simple(简单)或complex(复杂)
    currentEffect: 'pulse', // 当前选择的效果
    animationSpeed: 5, // 动画速度（1-10）
    animationIntensity: 5, // 动画强度（1-10）
    isPreviewLoading: false, // 预览加载状态
    isGenerating: false // 生成GIF状态
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
          resultGif: '' // 清空之前的结果
        });
      }
    });
  },

  /**
   * 切换效果类别
   */
  switchEffectCategory: function (e) {
    const category = e.currentTarget.dataset.category;
    
    // 根据类别设置默认效果
    let defaultEffect = 'pulse';
    if (category === 'complex') {
      defaultEffect = 'rain';
    }
    
    this.setData({
      effectCategory: category,
      currentEffect: defaultEffect,
      resultGif: '' // 切换类别时清空结果
    });
  },

  /**
   * 选择效果
   */
  selectEffect: function (e) {
    const effect = e.currentTarget.dataset.effect;
    
    this.setData({
      currentEffect: effect,
      resultGif: '' // 切换效果时清空结果
    });
  },

  /**
   * 设置动画速度
   */
  setAnimationSpeed: function (e) {
    const speed = e.detail.value;
    
    this.setData({
      animationSpeed: speed,
      resultGif: '' // 修改参数时清空结果
    });
  },

  /**
   * 设置动画强度
   */
  setAnimationIntensity: function (e) {
    const intensity = e.detail.value;
    
    this.setData({
      animationIntensity: intensity,
      resultGif: '' // 修改参数时清空结果
    });
  },

  /**
   * 预览动画效果
   */
  previewAnimation: function () {
    // 检查是否已选择图片
    if (!this.data.sourceImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    
    // 设置预览加载状态
    this.setData({
      isPreviewLoading: true
    });
    
    // 根据当前选择的效果和参数生成GIF预览
    this.generateGifWithCurrentSettings(true)
      .then(result => {
        // 更新预览图
        this.setData({
          resultGif: result.tempFilePath,
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
  },

  /**
   * 生成GIF
   */
  generateGif: function () {
    // 检查是否已选择图片
    if (!this.data.sourceImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    
    // 设置生成状态
    this.setData({
      isGenerating: true
    });
    
    // 生成高质量GIF
    this.generateGifWithCurrentSettings(false)
      .then(result => {
        // 更新结果
        this.setData({
          resultGif: result.tempFilePath,
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
  },

  /**
   * 根据当前设置生成GIF
   * @param {boolean} isPreview - 是否为预览模式
   * @returns {Promise} - 返回Promise对象
   */
  generateGifWithCurrentSettings: function (isPreview = false) {
    // 构建GIF生成选项
    const options = {
      // 预览模式使用较低质量和帧数以加快速度
      frames: isPreview ? 5 : 10,
      duration: 1000 * (11 - this.data.animationSpeed) / 5, // 速度转换为持续时间
      quality: isPreview ? 5 : 10,
      intensity: this.data.animationIntensity / 10 // 强度归一化到0-1范围
    };
    
    // 根据效果类别决定是否强制使用云端处理
    const forceCloud = this.data.effectCategory === 'complex';
    
    // 调用图像处理服务生成GIF
    return imageProcessing.createGifAnimation(
      this.data.sourceImage,
      this.data.currentEffect,
      options,
      forceCloud
    );
  },

  /**
   * 保存到相册
   */
  saveToAlbum: function () {
    if (!this.data.resultGif) {
      wx.showToast({
        title: '请先生成GIF',
        icon: 'none'
      });
      return;
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultGif,
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
    if (!this.data.resultGif) {
      wx.showToast({
        title: '请先生成GIF',
        icon: 'none'
      });
      return;
    }
    
    // 将生成的GIF路径保存到全局数据
    const globalData = app.globalData || {};
    globalData.tempGifPath = this.data.resultGif;
    
    // 跳转到订单页面
    wx.navigateTo({
      url: '/pages/order/order?type=gif&from=gifmaker'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我用LaLaManDIY制作了一个超酷的GIF动画',
      path: '/pages/index/index',
      imageUrl: this.data.resultGif || this.data.sourceImage || '/images/share_default.png'
    };
  }
});
