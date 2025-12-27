// app.js - 小程序入口文件

App({
  // 全局数据
  globalData: {
    userInfo: null,
    hasLogin: false,
    // 服务器API地址 - 开发环境使用本地地址
    apiBaseUrl: 'http://127.0.0.1:3000',  // 测试环境使用本地地址
    // 生产环境地址：'https://api.photomagic.example.com',
    // 当前处理的照片
    currentPhoto: null,
    // 处理后的照片结果
    processedResults: [],
    // 风格列表
    styleList: [
      { id: 'shinkai', name: '新海诚风格', icon: '/images/styles/shinkai.png' },
      { id: 'ghibli', name: '吉卜力风格', icon: '/images/styles/ghibli.png' },
      { id: 'lego', name: '积木风格', icon: '/images/styles/lego.png' },
      { id: 'pixar', name: '皮克斯风格', icon: '/images/styles/pixar.png' },
      { id: 'watercolor', name: '水彩画风格', icon: '/images/styles/watercolor.png' }
    ]
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    // 检查用户登录状态
    this.checkLoginStatus();
    
    // 获取系统信息（新版本API）
    // 使用新的API获取系统、设备和窗口信息
    try {
      // 获取设备信息
      const deviceInfo = wx.getDeviceInfo();
      // 获取窗口信息
      const windowInfo = wx.getWindowInfo();
      // 获取应用基础信息
      const appBaseInfo = wx.getAppBaseInfo();
      
      // 将信息合并保存到全局数据
      this.globalData.systemInfo = {
        ...deviceInfo,
        ...windowInfo,
        ...appBaseInfo
      };
      
      // 判断是否为iPhone带刻度的机型，适配底部安全区域
      this.globalData.isIPhoneX = deviceInfo.model.includes('iPhone') && windowInfo.safeArea && windowInfo.safeArea.bottom < windowInfo.screenHeight;
    } catch (err) {
      console.log('获取系统信息失败，使用旧版API作为备用:', err);
      // 兼容处理，使用旧版API
      wx.getSystemInfo({
        success: e => {
          this.globalData.systemInfo = e;
          this.globalData.isIPhoneX = e.model.includes('iPhone X') || e.model.includes('iPhone 11') || e.model.includes('iPhone 12');
        }
      });
    }
  },

  /**
   * 检查用户登录状态
   */
  checkLoginStatus: function () {
    // 获取本地存储的登录信息
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.hasLogin = true;
      this.globalData.userInfo = userInfo;
      
      // 验证token是否有效
      this.validateToken(token);
    }
  },

  /**
   * 验证token是否有效
   */
  validateToken: function (token) {
    // 这里应该调用后端API验证token
    // 示例代码，实际项目中需要替换为真实API调用
    
    // 开发模式：暂时跳过API验证，避免域名校验错误
    console.log('开发模式：跳过token验证');
    
    /* 正式代码，发布前取消注释
    wx.request({
      url: this.globalData.apiBaseUrl + '/auth/validate',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data.valid) {
          console.log('Token有效');
        } else {
          console.log('Token无效，需要重新登录');
          this.globalData.hasLogin = false;
          this.globalData.userInfo = null;
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
        }
      },
      fail: () => {
        console.log('验证token失败，可能是网络问题');
      }
    });
    */
  },

  /**
   * 用户登录方法
   */
  login: function (callback) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 开发模式：模拟登录成功，避免域名校验错误
          console.log('开发模式：模拟登录成功，获得code:', res.code);
          
          // 创建模拟的用户信息
          const mockUserInfo = {
            nickName: 'VOUN风格用户',
            avatarUrl: '/images/LaLaManLOGO.jpg',
            gender: 1,
            country: '中国',
            province: '广东',
            city: '深圳'
          };
          
          // 存储模拟的登录信息
          wx.setStorageSync('token', 'mock_token_for_development');
          wx.setStorageSync('userInfo', mockUserInfo);
          
          this.globalData.hasLogin = true;
          this.globalData.userInfo = mockUserInfo;
          
          if (callback) {
            callback(true);
          }
          
          // 下面是正式环境的代码，开发时暂时注释
          /*
          wx.request({
            url: this.globalData.apiBaseUrl + '/auth/login',
            method: 'POST',
            data: {
              code: res.code
            },
            success: (loginRes) => {
              if (loginRes.data.success) {
                // 存储登录信息
                wx.setStorageSync('token', loginRes.data.token);
                wx.setStorageSync('userInfo', loginRes.data.userInfo);
                
                this.globalData.hasLogin = true;
                this.globalData.userInfo = loginRes.data.userInfo;
                
                if (callback) {
                  callback(true);
                }
              } else {
                console.log('登录失败:', loginRes.data.message);
                if (callback) {
                  callback(false);
                }
              }
            },
            fail: () => {
              console.log('登录请求失败');
              if (callback) {
                callback(false);
              }
            }
          });
          */
        } else {
          console.log('获取用户登录态失败：' + res.errMsg);
          if (callback) {
            callback(false);
          }
        }
      },
      fail: () => {
        console.log('wx.login调用失败');
        if (callback) {
          callback(false);
        }
      }
    });
  }
});
