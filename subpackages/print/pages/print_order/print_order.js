// pages/print_order/print_order.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderData: null, // 订单数据
    address: null, // 收货地址
    remark: '', // 备注信息
    shippingFee: 10, // 运费，默认10元
    finalPrice: 0, // 最终价格（含运费）
    isSubmitting: false // 是否正在提交订单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单确认'
    });

    // 解析传递的订单数据
    if (options.orderData) {
      try {
        const orderData = JSON.parse(decodeURIComponent(options.orderData));
        const finalPrice = (parseFloat(orderData.totalPrice) + this.data.shippingFee).toFixed(2);
        
        this.setData({
          orderData: orderData,
          finalPrice: finalPrice
        });
      } catch (error) {
        console.error('解析订单数据失败', error);
        wx.showToast({
          title: '订单数据错误',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 选择收货地址
   */
  chooseAddress: function () {
    const that = this;
    
    wx.chooseAddress({
      success: function (res) {
        // 构建地址对象
        const address = {
          name: res.userName,
          phone: res.telNumber,
          province: res.provinceName,
          city: res.cityName,
          district: res.countyName,
          detail: res.detailInfo,
          postalCode: res.postalCode,
          fullAddress: `${res.provinceName} ${res.cityName} ${res.countyName} ${res.detailInfo}`
        };
        
        that.setData({ address: address });
      },
      fail: function (err) {
        console.error('选择地址失败', err);
        // 如果是用户取消操作，不显示错误提示
        if (err.errMsg !== 'chooseAddress:fail cancel') {
          wx.showToast({
            title: '获取地址失败',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 备注输入事件
   */
  onRemarkInput: function (e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 提交订单
   */
  submitOrder: function () {
    // 检查收货地址
    if (!this.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }
    
    // 防止重复提交
    if (this.data.isSubmitting) {
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // 构建订单提交数据
    const orderSubmitData = {
      printSize: this.data.orderData.printSize,
      images: this.data.orderData.images,
      quantity: this.data.orderData.quantity,
      totalPrice: this.data.orderData.totalPrice,
      shippingFee: this.data.shippingFee,
      finalPrice: this.data.finalPrice,
      address: this.data.address,
      remark: this.data.remark,
      orderTime: new Date().getTime()
    };
    
    // 模拟订单提交过程（实际项目中应该调用真实的API）
    setTimeout(() => {
      // 生成模拟订单号
      const orderNumber = 'ORD' + Date.now().toString().slice(-10);
      
      // 模拟订单创建成功
      const orderResult = {
        success: true,
        orderNumber: orderNumber,
        paymentParams: {
          timeStamp: '' + Math.floor(Date.now() / 1000),
          nonceStr: 'nonceStr' + Math.random().toString(36).substr(2),
          package: 'prepay_id=wx' + Date.now(),
          signType: 'MD5',
          paySign: 'paySign' + Math.random().toString(36).substr(2)
        }
      };
      
      this.setData({ isSubmitting: false });
      
      // 调用支付接口
      this.requestPayment(orderResult);
    }, 1000);
  },

  /**
   * 发起支付请求
   */
  requestPayment: function (orderResult) {
    // 实际项目中应该使用后端返回的真实支付参数
    wx.showModal({
      title: '模拟支付',
      content: '实际项目中会调用微信支付接口，这里仅做模拟演示。点击确定表示支付成功，点击取消表示支付失败。',
      success: (res) => {
        if (res.confirm) {
          // 模拟支付成功
          this.handlePaymentSuccess(orderResult.orderNumber);
        } else {
          // 模拟支付失败
          wx.showToast({
            title: '支付已取消',
            icon: 'none'
          });
        }
      }
    });
    
    /* 实际支付代码（需要真实的支付参数）
    wx.requestPayment({
      timeStamp: orderResult.paymentParams.timeStamp,
      nonceStr: orderResult.paymentParams.nonceStr,
      package: orderResult.paymentParams.package,
      signType: orderResult.paymentParams.signType,
      paySign: orderResult.paymentParams.paySign,
      success: (res) => {
        this.handlePaymentSuccess(orderResult.orderNumber);
      },
      fail: (err) => {
        console.error('支付失败', err);
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        });
      }
    });
    */
  },

  /**
   * 处理支付成功
   */
  handlePaymentSuccess: function (orderNumber) {
    wx.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000
    });
    
    // 延迟跳转到订单详情页
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/orderDetail/orderDetail?id=${orderNumber}&type=print`
      });
    }, 2000);
  },

  /**
   * 返回上一页
   */
  goBack: function () {
    wx.navigateBack();
  }
});
