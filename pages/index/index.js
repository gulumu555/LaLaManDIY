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
   * 从后端加载首页故事模板 (LaLaMan 2.0)
   * 每个模板 = 一个表达示例，点击后可以"用这个模板创作"
   */
  loadGalleryImages: function () {
    this.setData({ isLoading: true });

    // 调用2.0 Story Templates API
    apiService.getStoryTemplates()
      .then(response => {
        if (response.success && response.data) {
          // 转换数据格式为2.0故事卡片
          const artStyles = response.data.map(item => ({
            id: item.id,
            name: item.title || item.caption,
            image: item.imageUrl,
            location: item.location || 'SOMEWHERE',
            time: item.time || new Date().getFullYear(),
            caption: item.caption || '',
            intent: item.intent || 'memory',
            style: item.style || 'ghibli_watercolor',
            panels: item.panels || 1
          }));

          this.setData({
            artStyles,
            isLoading: false
          });
        } else {
          throw new Error('获取模板数据失败');
        }
      })
      .catch(error => {
        console.error('加载模板数据出错', error);

        // 加载失败时使用默认2.0故事模板
        this.setData({
          isLoading: false,
          artStyles: [
            {
              id: 'template1',
              name: '成都之旅',
              image: '/images/templates/chengdu.jpg',
              location: 'CHENGDU · TAIKOO LI',
              time: '2025',
              caption: '这一格，是我们在成都留下的。',
              intent: 'memory',
              style: 'ghibli_watercolor'
            },
            {
              id: 'template2',
              name: '日常记录',
              image: '/images/templates/daily.jpg',
              location: 'SOMEWHERE',
              time: 'TODAY',
              caption: '有些日子，值得被记住。',
              intent: 'moment',
              style: 'jimmy'
            },
            {
              id: 'template3',
              name: '一起的时光',
              image: '/images/templates/together.jpg',
              location: 'WITH YOU',
              time: 'ALWAYS',
              caption: '和你在一起的每一天。',
              intent: 'memory',
              style: 'disney'
            },
            {
              id: 'template4',
              name: '四格漫画',
              image: '/images/templates/comic4.jpg',
              location: 'MY LIFE',
              time: 'EVERYDAY',
              caption: '生活的小确幸。',
              intent: 'story',
              style: 'pixar',
              panels: 4
            },
            {
              id: 'template5',
              name: '九宫格日记',
              image: '/images/templates/grid9.jpg',
              location: 'MOMENTS',
              time: 'THIS WEEK',
              caption: '这周的碎片。',
              intent: 'series',
              style: 'shinkai',
              panels: 9
            },
            {
              id: 'template6',
              name: '手办风格',
              image: '/images/templates/art_toy.jpg',
              location: 'MY COLLECTION',
              time: '2025',
              caption: '把自己做成手办。',
              intent: 'memory',
              style: 'art_toy'
            }
          ]
        });
      });
  },

  /**
   * 点击故事卡片 - 用这个模板创作 (LaLaMan 2.0)
   */
  onCardTap: function (e) {
    const template = e.currentTarget.dataset.template;
    console.log('点击故事模板:', template);

    // 跳转到story_create，带上模板预设
    wx.navigateTo({
      url: `/pages/story_create/story_create?templateId=${template.id}&intent=${template.intent}&style=${template.style}&panels=${template.panels || 1}`
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
   * 打印服务按钮点击事件（左侧乘号×按钮）
   * 进入1.3制作工作流：风格选择 → 制作 → 订单
   */
  goToEffect: function () {
    console.log('点击了打印服务按钮（×）');
    wx.navigateTo({
      url: '/subpackages/style/pages/style_select/style_select'
    });
  },

  /**
   * 风格按钮点击事件（中间加号+按钮）
   * LaLaMan 2.0: 进入故事图创作流程
   */
  goToUpload: function () {
    console.log('点击了创作按钮（+）');
    // LaLaMan 2.0: 跳转到故事图创作页面
    wx.navigateTo({
      url: '/pages/story_create/story_create'
    });
  },

  /**
   * 个人中心按钮点击事件（右侧等号=按钮）
   * 功能：查看个人信息和订单
   */
  goToPrintService: function () {
    console.log('点击了个人中心按钮（=）');
    wx.switchTab({
      url: '/pages/user/user'
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
  onPageScroll: function (e) {
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
  _updateActiveIndex: function () {
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
