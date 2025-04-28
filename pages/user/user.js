// user.js - 用户个人中心页面逻辑
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 用户信息
    isLoggedIn: false, // 是否已登录
    userId: '', // 用户ID
    unreadOrders: 0 // 未读订单数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否已登录
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
    
    // 获取未读订单数
    this.getUnreadOrders();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    // 从全局获取用户信息或从缓存中获取
    const userInfo = wx.getStorageSync('userInfo');
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true,
        userId: userInfo.userId || '10001' // 实际项目中应该从服务器获取
      });
    } else {
      this.setData({
        userInfo: {},
        isLoggedIn: false,
        userId: ''
      });
    }
  },

  /**
   * 获取未读订单数
   */
  getUnreadOrders: function () {
    // 实际项目中应该从服务器获取未读订单数
    // 这里仅做示例
    if (this.data.isLoggedIn) {
      this.setData({
        unreadOrders: 2
      });
    }
  },

  /**
   * 登录
   */
  login: function () {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        
        // 保存用户信息到本地缓存
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({
          userInfo: userInfo,
          isLoggedIn: true,
          userId: '10001' // 实际项目中应该从服务器获取
        });
        
        // 获取未读订单数
        this.getUnreadOrders();
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('登录失败', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 导航到历史记录页面
   */
  navigateToHistory: function () {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 导航到订单页面
   */
  navigateToOrders: function () {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/orderList/orderList'
    });
  },

  /**
   * 导航到地址页面
   */
  navigateToAddress: function () {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.chooseAddress({
      success: (res) => {
        console.log('地址信息', res);
      }
    });
  },

  /**
   * 导航到反馈页面
   */
  navigateToFeedback: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到关于页面
   */
  navigateToAbout: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到活动页面
   */
  navigateToPromo: function () {
    wx.showToast({
      title: '活动即将开始',
      icon: 'none'
    });
  },

  /**
   * 显示登录提示
   */
  showLoginTip: function () {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.login();
        }
      }
    });
  }
})