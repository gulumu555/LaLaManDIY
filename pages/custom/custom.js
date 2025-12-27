// pages/custom/custom.js
// 定制页面的JavaScript文件

// 获取应用实例
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 定制风格选项
    styleOptions: [
      { id: 'anime', name: '动漫风格', description: '将照片转换为动漫风格', image: '/images/style_anime.jpg' },
      { id: 'oil', name: '油画风格', description: '将照片转换为油画风格', image: '/images/style_oil.jpg' },
      { id: 'sketch', name: '素描风格', description: '将照片转换为素描风格', image: '/images/style_sketch.jpg' },
      { id: 'watercolor', name: '水彩风格', description: '将照片转换为水彩画风格', image: '/images/style_watercolor.jpg' },
      { id: 'comic', name: '漫画风格', description: '将照片转换为漫画风格', image: '/images/style_comic.jpg' },
      { id: 'pixel', name: '像素风格', description: '将照片转换为像素艺术风格', image: '/images/style_pixel.jpg' }
    ],
    // 当前选中的风格
    selectedStyle: null,
    // 照片路径
    photoPath: '',
    // 是否已选择照片
    hasPhoto: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果从其他页面传递了照片路径
    if (options.photoPath) {
      this.setData({
        photoPath: options.photoPath,
        hasPhoto: true
      });
    }
  },

  /**
   * 选择照片
   */
  choosePhoto: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          photoPath: res.tempFilePaths[0],
          hasPhoto: true
        });
      }
    });
  },

  /**
   * 选择风格
   */
  selectStyle: function (e) {
    const styleId = e.currentTarget.dataset.id;
    const style = this.data.styleOptions.find(item => item.id === styleId);
    
    this.setData({
      selectedStyle: style
    });
  },

  /**
   * 开始定制
   */
  startCustomization: function () {
    if (!this.data.hasPhoto) {
      wx.showToast({
        title: '请先选择照片',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!this.data.selectedStyle) {
      wx.showToast({
        title: '请选择一种风格',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 导航到处理页面
    wx.navigateTo({
      url: `/pages/process/process?photoPath=${this.data.photoPath}&styleId=${this.data.selectedStyle.id}`
    });
  },

  /**
   * 返回首页
   */
  goBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'LaLaMan - AI照片风格定制',
      path: '/pages/custom/custom',
      imageUrl: '/images/share_custom.jpg'
    };
  }
});
