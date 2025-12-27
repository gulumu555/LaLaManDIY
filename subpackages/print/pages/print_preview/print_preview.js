// print_preview.js - 打印效果预览页面逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../../../services/api');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePath: '', // 打印图片路径
    imageId: '', // 图片ID
    posterSize: 'medium', // 画报尺寸：small(小尺寸) / medium(中尺寸) / large(大尺寸)
    posterSizeText: '40×60cm', // 尺寸文本
    posterFrameStyle: '', // 画报框架样式
    quantity: 1, // 打印数量
    unitPrice: 99.9, // 单价(元)
    totalPrice: '99.90', // 总价(元)
    isLoading: false, // 加载状态
    loadingText: '加载中...' // 加载提示文字
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取上一页传来的图片路径和图片ID
    if (options.imagePath) {
      this.setData({
        imagePath: options.imagePath
      });
      
      if (options.imageId) {
        this.setData({ imageId: options.imageId });
      }
      
      // 如果有尺寸参数，设置画报尺寸
      if (options.posterSize) {
        this.selectPosterSize({
          currentTarget: {
            dataset: {
              size: options.posterSize
            }
          }
        });
      }
      
      // 初始化打印参数
      this.initPrintParameters();
    } else {
      wx.showToast({
        title: '未获取到图片',
        icon: 'none'
      });
      // 如果没有图片路径，返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 初始化打印参数
   */
  initPrintParameters: function() {
    // 初始化画报尺寸相关参数
    this.updatePosterInfo();
    
    // 初始化画报框架样式
    this.updatePosterFrameStyle();
    
    // 计算总价
    this.calculateTotalPrice();
  },
  
  /**
   * 更新画报信息
   */
  updatePosterInfo: function() {
    const { posterSize } = this.data;
    let unitPrice, posterSizeText;
    
    // 根据尺寸设置单价和尺寸文本
    switch (posterSize) {
      case 'small':
        unitPrice = 59.9;
        posterSizeText = '20×30cm';
        break;
      case 'medium':
        unitPrice = 99.9;
        posterSizeText = '40×60cm';
        break;
      case 'large':
        unitPrice = 159.9;
        posterSizeText = '60×90cm';
        break;
      default:
        unitPrice = 99.9;
        posterSizeText = '40×60cm';
    }
    
    this.setData({
      unitPrice,
      posterSizeText
    });
  },
  
  /**
   * 更新画报框架样式
   */
  updatePosterFrameStyle: function() {
    const { posterSize } = this.data;
    let ratio;
    
    // 根据尺寸设置比例
    switch (posterSize) {
      case 'small':
        ratio = 20/30; // 2:3
        break;
      case 'medium':
        ratio = 40/60; // 2:3
        break;
      case 'large':
        ratio = 60/90; // 2:3
        break;
      default:
        ratio = 2/3; // 默认比例
    }
    
    // 设置画报框架样式
    const frameStyle = `width: ${ratio > 1 ? '60%' : '40%'}; height: ${ratio > 1 ? '40%' : '60%'}; transform: rotate(${Math.random() * 6 - 3}deg);`;
    
    this.setData({
      posterFrameStyle: frameStyle
    });
  },
  
  /**
   * 选择画报尺寸
   */
  selectPosterSize: function(e) {
    const size = e.currentTarget.dataset.size;
    
    if (size !== this.data.posterSize) {
      // 设置画报尺寸
      this.setData({
        posterSize: size
      });
      
      // 更新画报信息（单价和尺寸文本）
      this.updatePosterInfo();
      
      // 更新画报框架样式
      this.updatePosterFrameStyle();
      
      // 重新计算总价
      this.calculateTotalPrice();
    }
  },
  
  /**
   * 减少数量
   */
  decreaseQuantity: function() {
    let quantity = this.data.quantity;
    
    if (quantity > 1) {
      quantity--;
      
      this.setData({
        quantity: quantity
      });
      
      // 计算总价
      this.calculateTotalPrice();
    }
  },
  
  /**
   * 增加数量
   */
  increaseQuantity: function() {
    let quantity = this.data.quantity;
    
    // 限制最大数量为10
    if (quantity < 10) {
      quantity++;
      
      this.setData({
        quantity: quantity
      });
      
      // 计算总价
      this.calculateTotalPrice();
    } else {
      wx.showToast({
        title: '最多可打印10张',
        icon: 'none'
      });
    }
  },
  
  /**
   * 输入数量
   */
  inputQuantity: function(e) {
    let quantity = parseInt(e.detail.value);
    
    // 限制最小/最大值
    if (isNaN(quantity) || quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    
    this.setData({
      quantity: quantity
    });
    
    // 计算总价
    this.calculateTotalPrice();
  },
  
  /**
   * 计算总价
   */
  calculateTotalPrice: function() {
    const { unitPrice, quantity } = this.data;
    
    // 计算总价
    const total = unitPrice * quantity;
    
    // 格式化为保留两位小数的字符串
    const totalFormatted = total.toFixed(2);
    
    this.setData({
      totalPrice: totalFormatted
    });
  },
  
  /**
   * 前往下单页面
   */
  goToOrder: function() {
    const { imagePath, imageId, posterSize, quantity, totalPrice, posterSizeText } = this.data;
    
    // 打印订单参数
    const orderParams = {
      imageId: imageId,
      printType: 'poster',
      posterSize: posterSize,
      posterSizeText: posterSizeText,
      quantity: quantity,
      totalPrice: totalPrice
    };
    
    // 跳转到打印订单页面
    wx.navigateTo({
      url: '/subpackages/print/pages/print_order/print_order?' + 
           'orderData=' + encodeURIComponent(JSON.stringify(orderParams))
    });
  },
  
  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
