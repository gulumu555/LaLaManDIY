// pages/print_service/print_service.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 打印规格数据
    printSizes: [
      {
        id: 'small',
        name: '小幅',
        size: '6寸 (约15×10cm)',
        price: 39.9,
        imageUrl: '/images/print/small_print.png',
        compareImageUrl: '/images/print/small_print_compare.png',
        description: '适合桌面摆放，精致小巧'
      },
      {
        id: 'medium',
        name: '中幅',
        size: '30×20cm',
        price: 79.9,
        imageUrl: '/images/print/medium_print.png',
        compareImageUrl: '/images/print/medium_print_compare.png',
        description: '适合墙面装饰，视觉效果佳'
      },
      {
        id: 'large',
        name: '大幅',
        size: '60×40cm',
        price: 129.9,
        imageUrl: '/images/print/large_print.png',
        compareImageUrl: '/images/print/large_print_compare.png',
        description: '适合主墙装饰，视觉冲击强'
      },
      {
        id: 'custom',
        name: '定制尺寸',
        size: '自定义',
        price: 0, // 价格根据尺寸计算
        imageUrl: '/images/print/custom_print.png',
        compareImageUrl: '/images/print/custom_print_compare.png',
        description: '根据需求定制专属尺寸'
      }
    ],
    selectedSize: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '艺术微喷服务'
    });
  },

  /**
   * 选择打印规格
   */
  selectPrintSize: function (e) {
    const sizeId = e.currentTarget.dataset.id;
    const selectedSize = this.data.printSizes.find(item => item.id === sizeId);
    
    this.setData({
      selectedSize: selectedSize
    });
  },

  /**
   * 继续按钮点击事件 - 导航到上传图片页面
   */
  goToUpload: function () {
    if (!this.data.selectedSize) {
      wx.showToast({
        title: '请先选择画幅规格',
        icon: 'none'
      });
      return;
    }

    // 将选中的规格信息传递到上传页面
    wx.navigateTo({
      url: `/pages/print_upload/print_upload?sizeId=${this.data.selectedSize.id}&price=${this.data.selectedSize.price}`
    });
  },

  /**
   * 返回首页
   */
  goBack: function () {
    wx.navigateBack();
  }
});
