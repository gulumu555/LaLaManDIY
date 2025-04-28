// style_result.js - 风格效果页面逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../../../services/api');
// 引入图像处理服务
const imageProcessingService = require('../../../../services/imageProcessing');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePath: '', // 用户选择的图片路径
    imageId: '', // 上传后的图片ID
    styleCategories: [], // 风格分类列表
    currentCategory: 'popular', // 当前选中的分类
    styles: [], // 当前分类下的风格列表
    selectedStyle: '', // 当前选中的风格ID
    isLoading: false, // 全局加载状态
    loadingText: '处理中...', // 加载提示文字
    showTips: false, // 是否显示使用提示
    showOriginal: false, // 是否显示原图
    stylePreviewUrl: '', // 风格预览图URL
    previewLoading: false, // 预览加载状态
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
      
      // 如果有imageId，说明图片已经上传过
      if (options.imageId) {
        this.setData({ imageId: options.imageId });
      }
      
      // 加载风格分类和风格列表
      this.loadStyleCategories();
      
      // 显示使用提示
      setTimeout(() => {
        this.setData({ showTips: true });
        setTimeout(() => {
          this.setData({ showTips: false });
        }, 3000);
      }, 500);
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
   * 加载风格分类
   * 从服务器获取所有风格分类及对应的风格列表
   */
  loadStyleCategories: function() {
    this.setData({ isLoading: true, loadingText: '加载风格中...' });
    
    // 调用API获取风格分类
    apiService.getStyleCategories()
      .then(res => {
        // 演示数据 - 实际应用中会使用API返回的数据
        const categories = [
          { id: 'popular', name: '热门风格' },
          { id: 'cartoon', name: '卡通动漫' },
          { id: 'painting', name: '绘画艺术' },
          { id: 'photo', name: '写实照片' },
          { id: 'special', name: '特殊效果' }
        ];
        
        // 每个分类下的风格
        const stylesMap = {
          'popular': [
            { id: 'anime', name: '二次元', icon: '/images/styles/anime_style.jpg' },
            { id: 'oil', name: '油画', icon: '/images/styles/oil_style.jpg' },
            { id: 'sketch', name: '素描', icon: '/images/styles/sketch_style.jpg' }
          ],
          'cartoon': [
            { id: 'anime', name: '二次元', icon: '/images/styles/anime_style.jpg' },
            { id: 'pixar', name: '皮克斯', icon: '/images/styles/pixar_style.jpg' },
            { id: 'comic', name: '漫画', icon: '/images/styles/comic_style.jpg' }
          ],
          'painting': [
            { id: 'oil', name: '油画', icon: '/images/styles/oil_style.jpg' },
            { id: 'watercolor', name: '水彩', icon: '/images/styles/watercolor_style.jpg' },
            { id: 'chinese', name: '国画', icon: '/images/styles/chinese_style.jpg' }
          ],
          'photo': [
            { id: 'portrait', name: '人像', icon: '/images/styles/portrait_style.jpg' },
            { id: 'landscape', name: '风景', icon: '/images/styles/landscape_style.jpg' }
          ],
          'special': [
            { id: 'neon', name: '霓虹', icon: '/images/styles/neon_style.jpg' },
            { id: 'mosaic', name: '马赛克', icon: '/images/styles/mosaic_style.jpg' }
          ]
        };
        
        const currentStyles = stylesMap['popular'] || [];
        let firstStyleId = '';
        
        if (currentStyles.length > 0) {
          firstStyleId = currentStyles[0].id;
        }
        
        this.setData({
          styleCategories: categories,
          styles: currentStyles,
          selectedStyle: firstStyleId,
          isLoading: false
        });
        
        // 如果选中了风格，立即预览第一个风格效果
        if (firstStyleId) {
          this.previewStyle(firstStyleId);
        }
      })
      .catch(err => {
        console.error('获取风格分类失败:', err);
        wx.showToast({
          title: '获取风格分类失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      });
  },
  
  /**
   * 切换风格分类
   * 用户点击不同的风格分类标签时调用
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.category;
    
    // 演示数据 - 实际应用中会根据分类ID获取对应的风格列表
    const stylesMap = {
      'popular': [
        { id: 'anime', name: '二次元', icon: '/images/styles/anime_style.jpg' },
        { id: 'oil', name: '油画', icon: '/images/styles/oil_style.jpg' },
        { id: 'sketch', name: '素描', icon: '/images/styles/sketch_style.jpg' }
      ],
      'cartoon': [
        { id: 'anime', name: '二次元', icon: '/images/styles/anime_style.jpg' },
        { id: 'pixar', name: '皮克斯', icon: '/images/styles/pixar_style.jpg' },
        { id: 'comic', name: '漫画', icon: '/images/styles/comic_style.jpg' }
      ],
      'painting': [
        { id: 'oil', name: '油画', icon: '/images/styles/oil_style.jpg' },
        { id: 'watercolor', name: '水彩', icon: '/images/styles/watercolor_style.jpg' },
        { id: 'chinese', name: '国画', icon: '/images/styles/chinese_style.jpg' }
      ],
      'photo': [
        { id: 'portrait', name: '人像', icon: '/images/styles/portrait_style.jpg' },
        { id: 'landscape', name: '风景', icon: '/images/styles/landscape_style.jpg' }
      ],
      'special': [
        { id: 'neon', name: '霓虹', icon: '/images/styles/neon_style.jpg' },
        { id: 'mosaic', name: '马赛克', icon: '/images/styles/mosaic_style.jpg' }
      ]
    };
    
    const currentStyles = stylesMap[categoryId] || [];
    let firstStyleId = '';
    
    if (currentStyles.length > 0) {
      firstStyleId = currentStyles[0].id;
    }
    
    this.setData({
      currentCategory: categoryId,
      styles: currentStyles,
      selectedStyle: firstStyleId
    });
    
    // 预览第一个风格效果
    if (firstStyleId) {
      this.previewStyle(firstStyleId);
    }
  },
  
  /**
   * 选择风格
   * 用户点击某个具体风格时调用，更新预览效果
   */
  selectStyle: function(e) {
    const styleId = e.currentTarget.dataset.style;
    
    this.setData({
      selectedStyle: styleId
    });
    
    // 预览选中的风格效果
    this.previewStyle(styleId);
    
    // 提供触感反馈
    wx.vibrateShort({
      type: 'light'
    });
  },
  
  /**
   * 预览风格效果
   * 在用户选择风格后调用API获取预览图
   */
  previewStyle: function(styleId) {
    const { imagePath, imageId } = this.data;
    
    // 设置预览加载状态
    this.setData({
      previewLoading: true,
      showOriginal: false // 强制显示效果图
    });
    
    // 如果还没有imageId，先上传图片
    if (!imageId && imagePath) {
      // 先上传图片获取imageId
      apiService.uploadImage(imagePath, 'style')
        .then(res => {
          if (res.success && res.imageId) {
            this.setData({ imageId: res.imageId });
            
            // 现在我们有了imageId，可以请求预览
            this.requestStylePreview(res.imageId, styleId);
          } else {
            throw new Error('上传图片失败');
          }
        })
        .catch(err => {
          console.error('上传图片失败:', err);
          this.setData({ previewLoading: false });
          
          wx.showToast({
            title: '无法生成预览，请重试',
            icon: 'none'
          });
        });
    } else {
      // 已有imageId，直接请求预览
      this.requestStylePreview(imageId, styleId);
    }
  },
  
  /**
   * 请求风格预览
   * 调用API获取风格预览图
   */
  requestStylePreview: function(imageId, styleId) {
    // 调用API获取风格预览
    apiService.getStylePreview(imageId, styleId)
      .then(res => {
        // 演示阶段使用示例图片 - 实际应用中会使用API返回的预览URL
        let previewUrl = '/images/styles/previews/' + styleId + '_preview.jpg';
        
        // 模拟API返回的数据结构
        if (res && res.previewUrl) {
          previewUrl = res.previewUrl;
        }
        
        this.setData({
          stylePreviewUrl: previewUrl,
          previewLoading: false
        });
      })
      .catch(err => {
        console.error('获取风格预览失败:', err);
        this.setData({ previewLoading: false });
        
        wx.showToast({
          title: '获取预览失败，请重试',
          icon: 'none'
        });
      });
  },
  
  /**
   * 切换原图/效果图预览
   */
  togglePreview: function() {
    this.setData({
      showOriginal: !this.data.showOriginal
    });
  },
  
  /**
   * 预览图加载完成回调
   */
  onPreviewLoaded: function() {
    // 图片加载完成后可以添加一些动画效果
  },
  
  /**
   * 应用风格生成最终图片
   */
  applyStyle: function() {
    const { imageId, selectedStyle } = this.data;
    
    // 检查是否有选中的图片和风格
    if (!imageId) {
      wx.showToast({
        title: '请先上传图片',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedStyle) {
      wx.showToast({
        title: '请选择风格',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      loadingText: '正在生成艺术图...'
    });
    
    // 告诉用户处理流程，增强用户体验
    let loadingTexts = [
      '正在处理图片...',
      '应用艺术风格中...',
      '优化图像质量...',
      '即将完成...'
    ];
    
    let textIndex = 0;
    const loadingInterval = setInterval(() => {
      if (textIndex < loadingTexts.length) {
        this.setData({ loadingText: loadingTexts[textIndex] });
        textIndex++;
      } else {
        clearInterval(loadingInterval);
      }
    }, 800);
    
    // 调用API处理图片
    apiService.processStyle(imageId, selectedStyle)
      .then(res => {
        // 清除加载提示
        clearInterval(loadingInterval);
        this.setData({ isLoading: false });
        
        // 演示使用 - 实际应用中会使用API返回的结果
        const resultUrl = this.data.stylePreviewUrl || '/images/styles/result.jpg';
        const styleName = this.getStyleNameById(selectedStyle);
        
        // 保存结果并跳转到结果页
        wx.navigateTo({
          url: `/subpackages/style/pages/preview/preview?resultUrl=${encodeURIComponent(resultUrl)}&styleName=${encodeURIComponent(styleName)}`
        });
      })
      .catch(err => {
        // 清除加载提示
        clearInterval(loadingInterval);
        
        console.error('创建风格图失败:', err);
        this.setData({ isLoading: false });
        
        wx.showToast({
          title: '风格处理失败，请重试',
          icon: 'none'
        });
      });
  },
  
  /**
   * 根据风格ID获取风格名称
   * 辅助函数，用于在界面上显示友好的风格名称
   */
  getStyleNameById: function(styleId) {
    // 遍历当前分类下的所有风格，查找匹配的ID
    const { styles } = this.data;
    const style = styles.find(item => item.id === styleId);
    
    // 如果找到了匹配的风格，返回其名称，否则返回ID作为名称
    return style ? style.name : styleId;
  },
  
  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
