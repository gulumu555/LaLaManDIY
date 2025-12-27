// pages/sticker_service/sticker_service.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 贴纸规格数据
    stickerSizes: [
      {
        id: 'mini',
        name: '迷你贴纸',
        size: '3×3cm',
        price: 19.9,
        imageUrl: '/images/print/sticker_mini.png',
        description: '适合贴在手机背面、笔记本等小物件上'
      },
      {
        id: 'small',
        name: '小号贴纸',
        size: '5×5cm',
        price: 24.9,
        imageUrl: '/images/print/sticker_small.png',
        description: '适合贴在手机壳、水杯等中小物件上'
      },
      {
        id: 'medium',
        name: '中号贴纸',
        size: '8×8cm',
        price: 29.9,
        imageUrl: '/images/print/sticker_medium.png',
        description: '适合贴在笔记本电脑、书包等物品上'
      },
      {
        id: 'large',
        name: '大号贴纸',
        size: '12×12cm',
        price: 39.9,
        imageUrl: '/images/print/sticker_large.png',
        description: '适合贴在墙面、行李箱等大物件上'
      }
    ],
    // 贴纸材质数据
    materials: [
      {
        id: 'normal',
        name: '普通亮面',
        priceAdjustment: 0,
        description: '标准亮面材质，适合一般使用场景'
      },
      {
        id: 'matte',
        name: '哑光磨砂',
        priceAdjustment: 5,
        description: '磨砂质感，防指纹，高级质感'
      },
      {
        id: 'waterproof',
        name: '防水耐晒',
        priceAdjustment: 10,
        description: '特殊防水材质，适合户外或潮湿环境使用'
      },
      {
        id: 'transparent',
        name: '透明底材',
        priceAdjustment: 8,
        description: '透明背景，适合玻璃、亚克力等透明表面'
      }
    ],
    selectedSize: null,
    selectedMaterial: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 默认选择第一个规格和材质
    this.setData({
      selectedSize: this.data.stickerSizes[0],
      selectedMaterial: this.data.materials[0]
    });
  },

  /**
   * 选择贴纸规格
   */
  selectStickerSize: function(e) {
    const id = e.currentTarget.dataset.id;
    const selectedSize = this.data.stickerSizes.find(item => item.id === id);
    
    if (selectedSize) {
      this.setData({
        selectedSize: selectedSize
      });
      console.log(`选择了${selectedSize.name}规格`);
    }
  },

  /**
   * 选择贴纸材质
   */
  selectMaterial: function(e) {
    const id = e.currentTarget.dataset.id;
    const selectedMaterial = this.data.materials.find(item => item.id === id);
    
    if (selectedMaterial) {
      this.setData({
        selectedMaterial: selectedMaterial
      });
      console.log(`选择了${selectedMaterial.name}材质`);
    }
  },

  /**
   * 计算总价
   */
  calculateTotalPrice: function() {
    if (!this.data.selectedSize || !this.data.selectedMaterial) {
      return 0;
    }
    
    return this.data.selectedSize.price + this.data.selectedMaterial.priceAdjustment;
  },

  /**
   * 继续按钮点击事件 - 导航到上传图片页面
   */
  goToUpload: function() {
    if (!this.data.selectedSize || !this.data.selectedMaterial) {
      wx.showToast({
        title: '请选择规格和材质',
        icon: 'none'
      });
      return;
    }

    // 计算总价
    const totalPrice = this.calculateTotalPrice();
    
    // 将选择的规格和材质信息存储到全局数据或缓存中
    const orderInfo = {
      type: 'sticker', // 标记为不干胶打印
      size: this.data.selectedSize,
      material: this.data.selectedMaterial,
      totalPrice: totalPrice
    };
    
    // 可以使用全局数据存储订单信息
    if (!app.globalData.orderInfo) {
      app.globalData.orderInfo = {};
    }
    app.globalData.orderInfo.sticker = orderInfo;
    
    // 也可以使用本地缓存存储订单信息
    wx.setStorageSync('stickerOrderInfo', orderInfo);
    
    // 导航到上传图片页面
    wx.navigateTo({
      url: '/pages/sticker_upload/sticker_upload',
      success: () => {
        console.log('跳转到不干胶上传页面');
      },
      fail: (error) => {
        console.error('跳转失败:', error);
        // 如果页面不存在，可以跳转到通用上传页面
        wx.navigateTo({
          url: '/pages/print_upload/print_upload?type=sticker',
          success: () => {
            console.log('跳转到通用上传页面');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            wx.showToast({
              title: '上传功能正在开发中',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  /**
   * 返回按钮点击事件 - 返回打印类型选择页面
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
      title: 'LaLaManDIY - 高品质不干胶打印服务',
      path: '/pages/sticker_service/sticker_service'
    };
  }
});
