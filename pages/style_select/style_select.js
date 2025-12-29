// style_select.js - 风格选择页面

// 导入API服务
const apiService = require('../../services/api');

Page({
  data: {
    // 当前选中的图片路径
    imagePath: '',
    // 当前选中的风格类别索引
    currentCategoryIndex: 0,
    // 风格类别
    categories: [],
    // 各类别下的具体风格
    styles: {},
    // 当前类别下的风格列表
    currentStyles: [],
    // 是否正在加载数据
    isLoading: true,
    // VOUN风格的品牌标志
    vounLogo: '/images/LaLaManLOGO.jpg'
  },

  onLoad: function (options) {
    // 获取上传页面传来的图片路径
    if (options.imagePath) {
      this.setData({
        imagePath: options.imagePath
      });
    }

    // 加载风格数据
    this.loadStyleData();
  },

  // 从后端加载风格数据
  loadStyleData: function () {
    this.setData({ isLoading: true });

    // 获取风格类别
    apiService.getStyleCategories()
      .then(response => {
        if (response.success && response.data) {
          const categories = response.data.map(category => ({
            id: category._id,
            name: category.name
          }));

          this.setData({ categories });

          // 获取所有风格
          return apiService.getStyles();
        } else {
          throw new Error('获取风格类别失败');
        }
      })
      .then(response => {
        if (response.success && response.data) {
          // 按类别组织风格数据
          const styles = {};

          // 初始化每个类别的风格数组
          this.data.categories.forEach(category => {
            styles[category.id] = [];
          });

          // 将风格数据分配到对应的类别中
          response.data.forEach(style => {
            if (style.category && styles[style.category._id]) {
              styles[style.category._id].push({
                id: style._id,
                name: style.name,
                icon: style.iconUrl || `/images/styles/${style.name.toLowerCase()}.png`
              });
            }
          });

          // 更新数据
          this.setData({
            styles,
            isLoading: false,
            currentStyles: styles[this.data.categories[0].id] || []
          });
        } else {
          throw new Error('获取风格数据失败');
        }
      })
      .catch(error => {
        console.error('加载风格数据出错', error);

        // 加载失败时使用默认数据
        this.setData({
          isLoading: false,
          categories: [
            { id: 'anime', name: '动漫' },
            { id: 'painting', name: '绘画' },
            { id: 'mixed', name: '混合' },
            { id: 'gif', name: 'GIF' }
          ],
          styles: {
            anime: [
              { id: 'ghibli_watercolor', name: '吉卜力水彩', icon: '/images/styles/ghibli.png', isNew: true },
              { id: 'jimmy', name: '几米', icon: '/images/styles/jimmy.png', isNew: true },
              { id: 'ghibli', name: '吉卜力', icon: '/images/styles/ghibli.png' },
              { id: 'miyazaki', name: '宫崎骏', icon: '/images/styles/miyazaki.png' },
              { id: 'shinkai', name: '新海诚', icon: '/images/styles/shinkai.png' },
              { id: 'pixar', name: '皮克斯', icon: '/images/styles/pixar.png' },
              { id: 'celluloid', name: '赛璐璐', icon: '/images/styles/celluloid.png' },
              { id: 'disney', name: '迪士尼', icon: '/images/styles/disney.png' }
            ],
            painting: [
              { id: 'ink', name: '水墨', icon: '/images/styles/ink.png' },
              { id: 'watercolor', name: '水彩', icon: '/images/styles/watercolor.png' }
            ],
            mixed: [
              { id: 'art_toy', name: '手办 Art Toy', icon: '/images/styles/art_toy.png', isNew: true },
              { id: 'pikachu', name: '皮卡丘', icon: '/images/styles/pikachu.png' },
              { id: 'lovedeathrobots', name: '爱死机', icon: '/images/styles/lovedeathrobots.png' }
            ],
            gif: [
              { id: 'pulse', name: '脉冲', icon: '/images/styles/gif_pulse.png' },
              { id: 'zoom', name: '缩放', icon: '/images/styles/gif_zoom.png' },
              { id: 'shake', name: '抖动', icon: '/images/styles/gif_shake.png' },
              { id: 'fade', name: '淡入淡出', icon: '/images/styles/gif_fade.png' },
              { id: 'rotate', name: '旋转', icon: '/images/styles/gif_rotate.png' }
            ]
          },
          currentStyles: [
            { id: 'ghibli', name: '吉卜力', icon: '/images/styles/ghibli.png' },
            { id: 'miyazaki', name: '宫崎骏', icon: '/images/styles/miyazaki.png' },
            { id: 'shinkai', name: '新海诚', icon: '/images/styles/shinkai.png' },
            { id: 'pixar', name: '皮克斯', icon: '/images/styles/pixar.png' },
            { id: 'celluloid', name: '赛璐璐', icon: '/images/styles/celluloid.png' },
            { id: 'disney', name: '迪士尼', icon: '/images/styles/disney.png' }
          ]
        });

        wx.showToast({
          title: '加载风格数据失败，使用默认数据',
          icon: 'none'
        });
      });
  },

  // 切换风格类别
  switchCategory: function (e) {
    const index = e.currentTarget.dataset.index;
    const categoryId = this.data.categories[index].id;

    this.setData({
      currentCategoryIndex: index,
      currentStyles: this.data.styles[categoryId] || []
    });
  },

  // 选择具体风格
  selectStyle: function (e) {
    const styleId = e.currentTarget.dataset.id;
    const categoryId = this.data.categories[this.data.currentCategoryIndex].id;

    // 获取选中的风格对象
    const selectedStyle = this.data.currentStyles.find(item => item.id === styleId);

    // 判断是否选择了GIF类别
    if (categoryId === 'gif') {
      // 跳转到处理页面，传递图片路径、选中的风格和GIF标记
      wx.navigateTo({
        url: `/pages/process/process?imagePath=${this.data.imagePath}&styleId=${styleId}&styleName=${selectedStyle.name}&isGif=true&effectType=${styleId}`
      });
    } else {
      // 跳转到处理页面，传递图片路径和选中的风格
      wx.navigateTo({
        url: `/pages/process/process?imagePath=${this.data.imagePath}&styleId=${styleId}&styleName=${selectedStyle.name}`
      });
    }
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack();
  },

  // 保存当前效果图
  saveImage: function () {
    // 获取当前选中的风格
    const categoryId = this.data.categories[this.data.currentCategoryIndex].id;
    const currentStyles = this.data.styles[categoryId] || [];

    // 如果没有选择具体风格，使用第一个风格
    const styleId = currentStyles.length > 0 ? currentStyles[0].id : '';
    const styleName = currentStyles.length > 0 ? currentStyles[0].name : '';

    // 判断是否为GIF类别
    if (categoryId === 'gif') {
      // 跳转到预览页面，传递图片路径、GIF标记和效果类型
      wx.navigateTo({
        url: `/pages/preview/preview?imagePath=${this.data.imagePath}&originalPath=${this.data.imagePath}&processType=gif&effectType=${styleId}&styleName=${styleName}`
      });
    } else {
      // 跳转到预览页面，传递图片路径和风格信息
      wx.navigateTo({
        url: `/pages/preview/preview?imagePath=${this.data.imagePath}&originalPath=${this.data.imagePath}&processType=style&styleId=${styleId}&styleName=${styleName}`
      });
    }
  }
})
