// index.js - LaLaMan首页逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../services/api');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    // 标题缩放比例
    titleScale: 1,
    // 滑动距离记录
    lastScrollTop: 0,
    // 当前激活的图片索引
    activeIndex: 0,
    // 画风样例图片数据
    artStyles: [],
    // 加载状态
    isLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查用户登录状态
    if (!app.globalData.hasLogin) {
      // 如果未登录，可以在这里处理，比如自动跳转到登录页或者静默登录
      this.silentLogin();
    }
    
    // 加载首页样图数据
    this.loadGalleryImages();
  },
  
  /**
   * 从后端加载首页样图数据
   */
  loadGalleryImages: function() {
    this.setData({ isLoading: true });
    
    // 调用API服务获取样图数据
    apiService.getGalleryImages(true)
      .then(response => {
        if (response.success && response.data) {
          // 转换数据格式
          const artStyles = response.data.map(item => ({
            id: item._id,
            name: item.title,
            image: item.imageUrl,
            description: item.description || `${item.title}风格效果`
          }));
          
          this.setData({
            artStyles,
            isLoading: false
          });
        } else {
          throw new Error('获取样图数据失败');
        }
      })
      .catch(error => {
        console.error('加载样图数据出错', error);
        
        // 加载失败时使用默认数据
        this.setData({
          isLoading: false,
          artStyles: [
            {
              id: 'style1',
              name: '吉卜力风格',
              image: '/images/styles/style1_ghibli.png',
              description: '温暖精细的吉卜力动画画风'
            },
            {
              id: 'style2',
              name: '宫崎骏风格',
              image: '/images/styles/style2_miyazaki.png',
              description: '充满想象力的宫崎骏动画特色'
            },
            {
              id: 'style3',
              name: '新海诚风格',
              image: '/images/styles/style3_shinkai.png',
              description: '梦幻光影的新海诚特色画面'
            },
            {
              id: 'style4',
              name: '水墨风格',
              image: '/images/styles/style4_ink.png',
              description: '东方意境的水墨画艺术效果'
            },
            {
              id: 'style5',
              name: '水彩风格',
              image: '/images/styles/style5_watercolor.png',
              description: '淡雅流畅的水彩绘画效果'
            },
            {
              id: 'style6',
              name: '爱死机风格',
              image: '/images/styles/style6_love_death.png',
              description: '前卫未来的科幻风格画面'
            },
            {
              id: 'style7',
              name: '皮克斯风格',
              image: '/images/styles/style7_pixar.png',
              description: '生动有趣的皮克斯动画特色'
            },
            {
              id: 'style8',
              name: '皮卡丘风格',
              image: '/images/styles/style8_pikachu.png',
              description: '可爱迷你的精灵宝可梦风格'
            },
            {
              id: 'style9',
              name: '赛璐璐风格',
              image: '/images/styles/style9_celshading.png',
              description: '高辨识度的动漫动画特色'
            },
            {
              id: 'style10',
              name: '迪士尼风格',
              image: '/images/styles/style10_disney.png',
              description: '经典梦幻的迪士尼动画画风'
            }
          ]
        });
        
        wx.showToast({
          title: '加载样图数据失败，使用默认数据',
          icon: 'none'
        });
      });
  },

  /**
   * 静默登录
   */
  silentLogin: function () {
    wx.showLoading({
      title: '加载中',
    });
    
    app.login(success => {
      wx.hideLoading();
      if (success) {
        console.log('登录成功');
      } else {
        console.log('登录失败，但允许用户继续使用基本功能');
      }
    });
  },

  /**
   * 动效按钮点击事件（左侧乘号×按钮）
   * 功能：将用户上传的照片生成GIF动画，或添加多种动态视频效果
   */
  goToEffect: function () {
    console.log('点击了动效按钮（×）');
    wx.navigateTo({
      url: '/subpackages/effect/pages/effect_select/effect_select'
    });
  },

  /**
   * 风格按钮点击事件（中间加号+按钮）
   * 功能：将照片一键转绘为多种漫画/艺术风格
   */
  goToUpload: function () {
    console.log('点击了风格按钮（+）');
    // 为了保持与动效板块一致，直接跳转到原来的风格页面
    // 然后在风格页面中添加类似的照片选择功能
    wx.navigateTo({
      url: '/subpackages/style/pages/style_select/style_select'
    });
  },

  /**
   * 打印服务按钮点击事件（右侧等号=按钮）
   * 功能：提供照片打印与定制服务
   * 产品类型：不干胶打印、艺术微喷画报
   */
  goToPrintService: function () {
    console.log('点击了打印按钮（=）');
    // 直接跳转到照片选择页面，与动效和风格功能保持一致
    wx.navigateTo({
      url: '/pages/print_upload/photo_select'
    });
  },

  /**
   * GIF动画制作按钮点击事件
   */
  goToGifMaker: function () {
    wx.navigateTo({
      url: '/subpackages/tools/pages/gifmaker/gifmaker'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次显示页面时检查登录状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
    
    // 如果样图数据为空，尝试重新加载
    if (this.data.artStyles.length === 0 && !this.data.isLoading) {
      this.loadGalleryImages();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'LaLaMan - AI照片增强与风格转绘',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    };
  },

  /**
   * 页面滚动事件处理函数
   * 实现VOUN风格的图片动态缩放效果
   */
  /**
   * 页面滚动事件处理 - 超简化版
   */
  onPageScroll: function(e) {
    // 记录滚动位置
    const scrollTop = e.scrollTop || 0;
    this.setData({
      lastScrollTop: scrollTop
    });
    
    // 简化滚动处理，每200ms才计算一次激活索引
    if (!this.scrollTimer) {
      this.scrollTimer = setTimeout(() => {
        this._updateActiveIndex();
        this.scrollTimer = null;
      }, 200);
    }
  },
  
  /**
   * 更新当前激活的图片索引 - 超简化版
   */
  _updateActiveIndex: function() {
    try {
      // 获取所有图片元素
      wx.createSelectorQuery()
        .selectAll('.gallery-item')
        .boundingClientRect(rects => {
          if (!rects || rects.length === 0) return;
          
          // 得到窗口高度
          const windowInfo = wx.getWindowInfo();
          const windowHeight = windowInfo.windowHeight;
          const screenCenter = windowHeight / 2;
          
          // 找出最接近中心的图片
          let closestIndex = 0;
          let minDistance = Infinity;
          
          for (let i = 0; i < rects.length; i++) {
            const itemCenter = rects[i].top + rects[i].height / 2;
            const distance = Math.abs(itemCenter - screenCenter);
            
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = i;
            }
          }
          
          // 更新激活索引
          if (closestIndex !== this.data.activeIndex) {
            this.setData({
              activeIndex: closestIndex
            });
          }
        })
        .exec();
    } catch (err) {
      console.log('计算激活项失败:', err);
    }
  }
});
