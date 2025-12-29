// upload.js - 照片上传页面逻辑
const app = getApp();
// 引入图像处理服务
const imageProcessingService = require('../../services/imageProcessing');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tempImagePath: '', // 临时图片路径
    isLoading: false, // 加载状态
    loadingText: '处理中...', // 加载提示文字
    originalImageInfo: null, // 原始图片信息
    // LaLaMan 2.0 - Identity Mode
    identityMode: false, // 是否启用身份保持模式
    selfieImagePath: '', // 自拍/身份图片路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否有预选的风格
    if (options.styleId) {
      this.setData({
        preSelectedStyle: options.styleId
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时重置状态，确保用户看到的是初始上传界面
    this.setData({
      tempImagePath: '', // 清空临时图片路径
      isLoading: false, // 重置加载状态
      originalImageInfo: null, // 清空图片信息
      selfieImagePath: '' // 清空自拍图片
    });
  },

  /**
   * 切换身份保持模式 (LaLaMan 2.0)
   */
  toggleIdentityMode: function () {
    this.setData({
      identityMode: !this.data.identityMode,
      selfieImagePath: '' // 切换时清空自拍
    });
  },

  /**
   * 选择自拍/身份照片 (LaLaMan 2.0)
   */
  chooseSelfie: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          selfieImagePath: res.tempFilePaths[0]
        });
      }
    });
  },

  /**
   * 打开手机相册
   */
  openAlbum: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.handleImageChosen(res.tempFilePaths[0]);
      }
    });
  },

  /**
   * 打开相机拍照
   */
  openCamera: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.handleImageChosen(res.tempFilePaths[0]);
      }
    });
  },

  /**
   * 处理选择的图片
   */
  handleImageChosen: function (imagePath) {
    console.log('开始处理图片', imagePath);
    this.setData({
      isLoading: true,
      loadingText: '加载图片...'
    });

    // 获取图片信息
    wx.getImageInfo({
      src: imagePath,
      success: (res) => {
        console.log('获取图片信息成功', res);

        this.setData({
          tempImagePath: imagePath,
          originalImageInfo: res,
          isLoading: true,
          loadingText: '正在处理...'
        });

        // 直接跳转到风格选择页面，不需要用户点击"下一步"按钮
        setTimeout(() => {
          this.setData({
            isLoading: false
          });

          let url = '/subpackages/style/pages/style_select/style_select?imagePath=' + imagePath;
          if (this.data.preSelectedStyle) {
            url += '&preSelectedStyle=' + this.data.preSelectedStyle;
          }
          // LaLaMan 2.0 - Pass selfie for identity mode
          if (this.data.identityMode && this.data.selfieImagePath) {
            url += '&identityMode=true&selfiePath=' + encodeURIComponent(this.data.selfieImagePath);
          }

          wx.navigateTo({
            url: url
          });
        }, 500);
      },
      fail: (error) => {
        console.error('获取图片信息失败', error);
        wx.showToast({
          title: '图片加载失败',
          icon: 'none'
        });
        this.setData({
          isLoading: false
        });
      }
    });
  },

  /**
   * 图片加载完成事件处理
   */
  onImageLoad: function (e) {
    // 保留基本的图片加载事件，但不再需要计算边框位置
    console.log('图片加载完成');
  },

  /**
   * 返回到首页
   */
  goBack: function () {
    // 如果有上一页，返回上一页，否则返回首页
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  /**
   * 确认上传
   * 处理右上角"下一步"按钮点击
   */
  confirmUpload: function () {
    // 如果没有选择图片，提示用户
    if (!this.data.tempImagePath) {
      wx.showToast({
        title: '请先选择照片',
        icon: 'none'
      });
      return;
    }

    // 设置加载状态
    this.setData({
      isLoading: true,
      loadingText: '正在处理...'
    });

    // 跳转到风格选择页面，只传递图片路径和预选风格（如果有）
    setTimeout(() => {
      this.setData({
        isLoading: false
      });

      let url = '/subpackages/style/pages/style_select/style_select?imagePath=' + this.data.tempImagePath;
      if (this.data.preSelectedStyle) {
        url += '&preSelectedStyle=' + this.data.preSelectedStyle;
      }

      wx.navigateTo({
        url: url
      });
    }, 500);
  }
})
