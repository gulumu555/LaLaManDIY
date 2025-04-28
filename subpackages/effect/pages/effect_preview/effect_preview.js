// effect_preview.js - 动效预览页面逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../../../services/api');
// 引入图像处理服务
const imageProcessingService = require('../../../../services/imageProcessing');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    gifUrl: '', // GIF图片路径
    isLoading: false, // 加载状态
    loadingText: '处理中...' // 加载提示文字
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取传递的GIF URL
    if (options.gifUrl) {
      this.setData({
        gifUrl: options.gifUrl
      });
    } else {
      wx.showToast({
        title: '未找到动效图片',
        icon: 'none'
      });
      setTimeout(() => {
        this.goBack();
      }, 1500);
    }
  },

  /**
   * 保存到相册
   */
  saveToAlbum: function () {
    this.setData({
      isLoading: true,
      loadingText: '保存中...'
    });

    // 下载网络图片到本地
    wx.downloadFile({
      url: this.data.gifUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存图片到相册
          imageProcessingService.saveImageToAlbum(res.tempFilePath)
            .then(() => {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              });
            })
            .catch((err) => {
              console.error('保存到相册失败:', err);
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
            });
        } else {
          throw new Error('下载图片失败');
        }
      },
      fail: (err) => {
        console.error('下载图片失败:', err);
        wx.showToast({
          title: '下载图片失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          isLoading: false
        });
      }
    });
  },

  /**
   * 分享GIF
   */
  shareGif: function () {
    // 微信小程序分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 创建新动效
   */
  createNew: function () {
    // 返回到动效选择页面
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 返回上一页
   */
  goBack: function () {
    wx.navigateBack();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我用LaLaManDIY创建了一个有趣的动效',
      path: '/pages/index/index',
      imageUrl: this.data.gifUrl
    };
  },

  /**
   * 用户点击右上角分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: '我用LaLaManDIY创建了一个有趣的动效',
      imageUrl: this.data.gifUrl
    };
  }
});
