// effect_result.js - 动效选择页面逻辑
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
    effectCategories: [], // 动效分类列表
    currentCategory: 'popular', // 当前选中的分类
    effects: [], // 当前分类下的动效列表
    selectedEffect: 'bounce', // 默认选中第一个动效
    isLoading: false, // 加载状态
    loadingText: '处理中...', // 加载提示文字
    showTips: false // 是否显示使用提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取上一页传来的图片路径
    if (options.imagePath) {
      this.setData({
        imagePath: options.imagePath
      });
      
      // 加载动效分类和效果列表
      this.loadEffectCategories();
      
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
   * 加载动效分类
   * 从服务器获取所有动效分类及对应的效果列表
   */
  loadEffectCategories: function() {
    this.setData({ isLoading: true, loadingText: '加载动效中...' });
    
    // 调用API获取动效分类
    apiService.getEffectCategories()
      .then(res => {
        // 演示数据 - 实际应用中会使用API返回的数据
        const categories = [
          { id: 'popular', name: '热门动效' },
          { id: 'funny', name: '趣味表情' },
          { id: 'anime', name: '二次元' },
          { id: 'special', name: '特效' },
          { id: 'celebration', name: '庆祝' }
        ];
        
        // 每个分类下的动效
        const effectsMap = {
          'popular': [
            { id: 'bounce', name: '弹跳', icon: '/images/effects/bounce_icon.png' },
            { id: 'shake', name: '抖动', icon: '/images/effects/shake_icon.png' },
            { id: 'sparkle', name: '闪烁', icon: '/images/effects/sparkle_icon.png' }
          ],
          'funny': [
            { id: 'shake', name: '抖动', icon: '/images/effects/shake_icon.png' },
            { id: 'rotate', name: '旋转', icon: '/images/effects/rotate_icon.png' },
            { id: 'zoom', name: '缩放', icon: '/images/effects/zoom_icon.png' }
          ],
          'anime': [
            { id: 'sparkle', name: '闪烁', icon: '/images/effects/sparkle_icon.png' },
            { id: 'fade', name: '淡入淡出', icon: '/images/effects/fade_icon.png' }
          ],
          'special': [
            { id: 'zoom', name: '缩放', icon: '/images/effects/zoom_icon.png' },
            { id: 'bounce', name: '弹跳', icon: '/images/effects/bounce_icon.png' }
          ],
          'celebration': [
            { id: 'sparkle', name: '闪烁', icon: '/images/effects/sparkle_icon.png' },
            { id: 'rotate', name: '旋转', icon: '/images/effects/rotate_icon.png' }
          ]
        };
        
        const currentEffects = effectsMap['popular'] || [];
        
        this.setData({
          effectCategories: categories,
          effects: currentEffects,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('获取动效分类失败:', err);
        wx.showToast({
          title: '获取动效分类失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      });
  },
  
  /**
   * 切换动效分类
   * 用户点击不同的动效分类标签时调用
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.category;
    
    // 演示数据 - 实际应用中会根据分类ID获取对应的效果列表
    const effectsMap = {
      'popular': [
        { id: 'bounce', name: '弹跳', icon: '/images/effects/bounce_icon.png' },
        { id: 'shake', name: '抖动', icon: '/images/effects/shake_icon.png' },
        { id: 'sparkle', name: '闪烁', icon: '/images/effects/sparkle_icon.png' }
      ],
      'funny': [
        { id: 'shake', name: '抖动', icon: '/images/effects/shake_icon.png' },
        { id: 'rotate', name: '旋转', icon: '/images/effects/rotate_icon.png' },
        { id: 'zoom', name: '缩放', icon: '/images/effects/zoom_icon.png' }
      ],
      'anime': [
        { id: 'sparkle', name: '闪烁', icon: '/images/effects/sparkle_icon.png' },
        { id: 'fade', name: '淡入淡出', icon: '/images/effects/fade_icon.png' }
      ],
      'special': [
        { id: 'zoom', name: '缩放', icon: '/images/effects/zoom_icon.png' },
        { id: 'bounce', name: '弹跳', icon: '/images/effects/bounce_icon.png' }
      ],
      'celebration': [
        { id: 'sparkle', name: '闪烁', icon: '/images/effects/sparkle_icon.png' },
        { id: 'rotate', name: '旋转', icon: '/images/effects/rotate_icon.png' }
      ]
    };
    
    this.setData({
      currentCategory: categoryId,
      effects: effectsMap[categoryId] || []
    });
    
    // 选中当前分类下的第一个效果
    if (effectsMap[categoryId] && effectsMap[categoryId].length > 0) {
      this.setData({
        selectedEffect: effectsMap[categoryId][0].id
      });
    }
  },

  /**
   * 选择动效类型
   * 用户点击某个具体动效时调用，更新预览效果
   */
  selectEffect: function(e) {
    const effectId = e.currentTarget.dataset.effect;
    this.setData({
      selectedEffect: effectId
    });
    
    // 反馈选择成功，震动提示用户已选择
    wx.vibrateShort({
      type: 'light'
    });
    
    // 预加载效果，提升用户体验
    this.previewEffect();
  },

  /**
   * 应用动效创建GIF
   * 将用户选择的图片和动效发送到服务器，生成GIF动画
   */
  createEffect: function() {
    const { imagePath, selectedEffect } = this.data;
    
    // 检查是否有选中的图片和动效
    if (!imagePath) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedEffect) {
      wx.showToast({
        title: '请选择动效类型',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      loadingText: '正在生成动效图...'
    });
    
    // 告诉用户处理流程，增强用户体验
    let loadingTexts = [
      '正在上传图片...',
      '正在应用动效...',
      '正在生成GIF动画...',
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
    // 实际实现中，需要将图片上传到服务器，然后应用选定的动效
    apiService.processEffect(imagePath, selectedEffect)
      .then(res => {
        // 清除加载提示
        clearInterval(loadingInterval);
        this.setData({ isLoading: false });
        
        // 演示使用 - 实际应用中会使用API返回的结果
        const resultUrl = '/images/sample_gif.gif';
        
        // 保存结果并跳转到结果页
        wx.navigateTo({
          url: `/subpackages/effect/pages/effect_preview/effect_preview?resultUrl=${encodeURIComponent(resultUrl)}&effectName=${encodeURIComponent(this.getEffectNameById(selectedEffect))}`
        });
      })
      .catch(err => {
        // 清除加载提示
        clearInterval(loadingInterval);
        
        console.error('创建动效失败:', err);
        this.setData({ isLoading: false });
        
        wx.showToast({
          title: '动效创建失败，请重试',
          icon: 'none'
        });
      });
  },
  
  /**
   * 根据动效ID获取动效名称
   * 辅助函数，用于在界面上显示友好的动效名称
   */
  getEffectNameById: function(effectId) {
    // 遍历当前分类下的所有动效，查找匹配的ID
    const { effects } = this.data;
    const effect = effects.find(item => item.id === effectId);
    
    // 如果找到了匹配的动效，返回其名称，否则返回ID作为名称
    return effect ? effect.name : effectId;
  },

  /**
   * 预览动效效果
   * 在用户选择动效后立即显示预览，提升用户体验
   */
  previewEffect: function() {
    const { imagePath, selectedEffect } = this.data;
    
    // 实际应用中，这里可以调用API获取动效预览
    // 当前版本中通过CSS实现动画效果，所以仅需更新状态
    
    // 添加震动反馈，增强交互感
    wx.vibrateShort({ type: 'light' });
    
    // 可以在这里添加预加载逻辑，例如预先请求一个低质量的预览图
    // 现在通过CSS动画直接预览
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
