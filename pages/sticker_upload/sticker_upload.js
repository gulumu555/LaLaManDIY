// pages/sticker_upload/sticker_upload.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderInfo: null, // 从上一页面传递的订单信息
    uploadedImages: [], // 已上传的图片
    maxImageCount: 9, // 最大上传图片数量
    isUploading: false, // 是否正在上传
    quantity: 1, // 打印数量
    totalPrice: 0 // 总价
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从缓存或全局数据中获取订单信息
    const orderInfo = wx.getStorageSync('stickerOrderInfo') || (app.globalData.orderInfo ? app.globalData.orderInfo.sticker : null);
    
    if (!orderInfo) {
      wx.showToast({
        title: '订单信息不存在，请重新选择',
        icon: 'none',
        duration: 2000,
        complete: () => {
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        }
      });
      return;
    }
    
    this.setData({
      orderInfo: orderInfo,
      totalPrice: orderInfo.totalPrice // 初始总价等于单价（数量为1）
    });
    
    console.log('不干胶上传页面加载，订单信息:', orderInfo);
  },

  /**
   * 选择并上传图片
   */
  chooseAndUploadImage: function() {
    if (this.data.isUploading) {
      wx.showToast({
        title: '正在上传，请稍候',
        icon: 'none'
      });
      return;
    }
    
    const remainCount = this.data.maxImageCount - this.data.uploadedImages.length;
    if (remainCount <= 0) {
      wx.showToast({
        title: `最多只能上传${this.data.maxImageCount}张图片`,
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: remainCount,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 开始上传
        this.setData({
          isUploading: true
        });
        
        // 模拟上传过程
        setTimeout(() => {
          // 生成新的图片数据
          const newImages = res.tempFiles.map((file, index) => {
            return {
              id: `img_${Date.now()}_${index}`,
              path: file.path,
              size: file.size
            };
          });
          
          // 更新已上传图片列表
          this.setData({
            uploadedImages: [...this.data.uploadedImages, ...newImages],
            isUploading: false
          });
          
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        }, 1500); // 模拟上传延迟
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  /**
   * 预览图片
   */
  previewImage: function(e) {
    const id = e.currentTarget.dataset.id;
    const image = this.data.uploadedImages.find(img => img.id === id);
    
    if (image) {
      const urls = this.data.uploadedImages.map(img => img.path);
      const current = image.path;
      
      wx.previewImage({
        current: current,
        urls: urls
      });
    }
  },

  /**
   * 删除图片
   */
  deleteImage: function(e) {
    const id = e.currentTarget.dataset.id;
    const updatedImages = this.data.uploadedImages.filter(img => img.id !== id);
    
    this.setData({
      uploadedImages: updatedImages
    });
    
    wx.showToast({
      title: '已删除',
      icon: 'success'
    });
  },

  /**
   * 增加数量
   */
  increaseQuantity: function() {
    if (this.data.quantity >= 99) {
      wx.showToast({
        title: '最多购买99张',
        icon: 'none'
      });
      return;
    }
    
    const newQuantity = this.data.quantity + 1;
    this.setData({
      quantity: newQuantity,
      totalPrice: (this.data.orderInfo.totalPrice * newQuantity).toFixed(2)
    });
  },

  /**
   * 减少数量
   */
  decreaseQuantity: function() {
    if (this.data.quantity <= 1) {
      return;
    }
    
    const newQuantity = this.data.quantity - 1;
    this.setData({
      quantity: newQuantity,
      totalPrice: (this.data.orderInfo.totalPrice * newQuantity).toFixed(2)
    });
  },

  /**
   * 继续按钮点击事件 - 导航到订单页面
   */
  goToOrder: function() {
    if (this.data.uploadedImages.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return;
    }
    
    // 准备订单数据
    const orderData = {
      type: 'sticker', // 标记为不干胶打印
      printSize: {
        id: this.data.orderInfo.size.id,
        name: this.data.orderInfo.size.name,
        size: this.data.orderInfo.size.size,
        price: this.data.orderInfo.totalPrice
      },
      material: this.data.orderInfo.material,
      quantity: this.data.quantity,
      images: this.data.uploadedImages,
      totalPrice: parseFloat(this.data.totalPrice)
    };
    
    // 存储订单数据
    if (!app.globalData.orderData) {
      app.globalData.orderData = {};
    }
    app.globalData.orderData.sticker = orderData;
    
    // 也可以使用本地缓存存储订单数据
    wx.setStorageSync('stickerOrderData', orderData);
    
    // 导航到订单页面
    wx.navigateTo({
      url: '/pages/sticker_order/sticker_order',
      success: () => {
        console.log('跳转到不干胶订单页面');
      },
      fail: (error) => {
        console.error('跳转失败:', error);
        // 如果页面不存在，可以跳转到通用订单页面
        wx.navigateTo({
          url: '/pages/print_order/print_order?type=sticker',
          success: () => {
            console.log('跳转到通用订单页面');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            wx.showToast({
              title: '订单功能正在开发中',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  /**
   * 返回按钮点击事件 - 返回规格选择页面
   */
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  }
});
