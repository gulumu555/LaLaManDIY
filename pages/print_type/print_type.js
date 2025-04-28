// pages/print_type/print_type.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedType: '', // 选中的打印类型：'sticker'(不干胶) 或 'artprint'(艺术微喷)
    printTypes: {
      sticker: {
        name: '不干胶打印',
        description: '适合贴在手机、电脑等物品上，防水耐用',
        minPrice: 19.9,
        imageUrl: '/images/print/sticker_print.jpg'
      },
      artprint: {
        name: '艺术微喷画报',
        description: '标准尺寸90×60cm，支持定制，适合墙面装饰',
        minPrice: 39.9,
        imageUrl: '/images/print/art_print.jpg'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 可以在这里处理页面参数
    console.log('打印类型选择页面加载');
  },

  /**
   * 选择打印类型
   */
  selectPrintType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type
    });
    console.log(`选择了${this.data.printTypes[type].name}`);
  },

  /**
   * 继续按钮点击事件 - 根据选择的打印类型导航到相应页面
   */
  goToNextStep: function() {
    if (!this.data.selectedType) {
      wx.showToast({
        title: '请选择打印类型',
        icon: 'none'
      });
      return;
    }

    // 根据选择的打印类型导航到不同的页面
    if (this.data.selectedType === 'sticker') {
      // 导航到不干胶打印页面
      wx.navigateTo({
        url: '/pages/sticker_service/sticker_service',
        success: () => {
          console.log('跳转到不干胶打印页面');
        },
        fail: (error) => {
          console.error('跳转失败:', error);
          // 如果页面不存在，提示用户
          wx.showToast({
            title: '该功能正在开发中',
            icon: 'none'
          });
        }
      });
    } else if (this.data.selectedType === 'artprint') {
      // 导航到艺术微喷页面
      wx.navigateTo({
        url: '/pages/print_service/print_service',
        success: () => {
          console.log('跳转到艺术微喷页面');
        }
      });
    }
  },

  /**
   * 返回按钮点击事件 - 返回首页
   */
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'LaLaManDIY - 高品质照片打印服务',
      path: '/pages/print_type/print_type'
    };
  }
});
