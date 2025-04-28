// process.js - 照片处理选择页面逻辑
const app = getApp();
// 引入图像处理服务
const imageProcessingService = require('../../../../services/imageProcessing');
// 引入API服务
const apiService = require('../../../../services/api');

/**
 * 页面的初始数据
 */
Page({
  data: {
    photoInfo: {
      path: '', // 照片路径
      width: 0, // 照片宽度
      height: 0 // 照片高度
    },
    styleInfo: {
      id: '', // 风格ID
      name: '' // 风格名称
    },
    currentTab: 'style', // 当前选项卡，'resolution'(分辨率提升) 或 'style'(风格转换)
    selectedResolution: '2x', // 选择的分辨率提升倍数
    isLoading: false, // 加载状态
    loadingText: '处理中...', // 加载提示文字
    isGif: false, // 是否为GIF处理
    effectType: '' // GIF效果类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否有图片路径和风格信息
    if (options.imagePath && options.styleId && options.styleName) {
      // 获取图片信息
      wx.getImageInfo({
        src: options.imagePath,
        success: (res) => {
          // 基本数据设置
          const data = {
            'photoInfo.path': options.imagePath,
            'photoInfo.width': res.width,
            'photoInfo.height': res.height,
            'styleInfo.id': options.styleId,
            'styleInfo.name': options.styleName
          };
          
          // 检查是否为GIF处理
          if (options.isGif === 'true' && options.effectType) {
            data.isGif = true;
            data.effectType = options.effectType;
          }
          
          this.setData(data);
        },
        fail: (error) => {
          console.error('获取图片信息失败', error);
          wx.showToast({
            title: '图片加载失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 缺少必要信息，返回上一页
      wx.showToast({
        title: '缺少必要信息',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 切换选项卡
   */
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
  },

  /**
   * 选择分辨率提升倍数
   */
  selectResolution: function (e) {
    const resolution = e.currentTarget.dataset.resolution;
    this.setData({
      selectedResolution: resolution
    });
  },

  /**
   * 开始处理图片
   */
  processImage: function () {
    if (!this.data.photoInfo.path) {
      wx.showToast({
        title: '请先选择照片',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      loadingText: '正在处理图片...'
    });
    
    // 根据选择的选项卡调用不同的处理方法
    if (this.data.currentTab === 'resolution') {
      // 分辨率提升
      this.enhanceResolution();
    } else if (this.data.currentTab === 'style') {
      // 风格转换
      this.convertStyle();
    }
  },

  /**
   * 提升图片分辨率
   */
  enhanceResolution: function () {
    const imagePath = this.data.photoInfo.path;
    const resolutionOption = this.data.selectedResolution;
    
    // 优先使用后端API
    apiService.enhanceResolution(imagePath, resolutionOption)
      .then(result => {
        this.setData({
          isLoading: false
        });
        
        if (result.success) {
          // 处理成功，跳转到预览页面
          wx.navigateTo({
            url: `/subpackages/style/pages/preview/preview?imagePath=${result.data.processedImageUrl}&originalPath=${imagePath}&processType=resolution&scale=${resolutionOption}`
          });
        } else {
          // 后端API处理失败，尝试使用本地服务
          return this.useLocalProcessing('resolution', imagePath, resolutionOption);
        }
      })
      .catch(error => {
        console.error('后端API分辨率提升出错', error);
        // 尝试使用本地服务
        return this.useLocalProcessing('resolution', imagePath, resolutionOption);
      });
  },

  /**
   * 转换图片风格
   */
  convertStyle: function () {
    const imagePath = this.data.photoInfo.path;
    const styleId = this.data.styleInfo.id;
    const styleName = this.data.styleInfo.name;
    
    // 检查是否为GIF处理
    if (this.data.isGif) {
      // 使用GIF处理函数
      this.createGifAnimation();
      return;
    }
    
    // 优先使用后端API
    apiService.convertImage(imagePath, styleId)
      .then(result => {
        this.setData({
          isLoading: false
        });
        
        if (result.success) {
          // 处理成功，跳转到预览页面
          wx.navigateTo({
            url: `/subpackages/style/pages/preview/preview?imagePath=${result.data.processedImageUrl}&originalPath=${imagePath}&processType=style&styleId=${styleId}&styleName=${styleName}`
          });
        } else {
          // 后端API处理失败，尝试使用本地服务
          return this.useLocalProcessing('style', imagePath, styleName.toLowerCase());
        }
      })
      .catch(error => {
        console.error('后端API风格转换出错', error);
        // 尝试使用本地服务
        return this.useLocalProcessing('style', imagePath, styleName.toLowerCase());
      });
  },
  
  /**
   * 使用本地处理服务作为备选
   */
  useLocalProcessing: function(type, imagePath, option) {
    wx.showToast({
      title: '正在使用本地服务处理...',
      icon: 'none',
      duration: 2000
    });
    
    if (type === 'resolution') {
      // 使用本地服务提升分辨率
      imageProcessingService.enhanceImage(imagePath, 'resolution', { scale: option })
        .then(result => {
          this.setData({
            isLoading: false
          });
          
          if (result.success) {
            // 处理成功，跳转到预览页面
            wx.navigateTo({
              url: `/subpackages/style/pages/preview/preview?imagePath=${result.tempFilePath}&originalPath=${imagePath}&processType=resolution&scale=${option}`
            });
          } else {
            // 处理失败
            wx.showToast({
              title: result.error || '分辨率提升失败',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          this.setData({
            isLoading: false
          });
          
          console.error('本地分辨率提升出错', error);
          wx.showToast({
            title: '分辨率提升出错',
            icon: 'none'
          });
        });
    } else if (type === 'style') {
      // 将风格名称映射到本地服务支持的风格类型
      let styleType = 'cartoon'; // 默认卡通风格
      
      // 简单映射逻辑，可根据实际需求扩展
      if (option.includes('水墨') || option.includes('ink')) {
        styleType = 'ink';
      } else if (option.includes('新海诚') || option.includes('shinkai')) {
        styleType = 'anime';
      } else if (option.includes('铅笔') || option.includes('pencil')) {
        styleType = 'pencil';
      }
      
      // 使用本地服务转换风格
      imageProcessingService.convertImageStyle(imagePath, styleType)
        .then(result => {
          this.setData({
            isLoading: false
          });
          
          if (result.success) {
            // 处理成功，跳转到预览页面
            wx.navigateTo({
              url: `/subpackages/style/pages/preview/preview?imagePath=${result.tempFilePath}&originalPath=${imagePath}&processType=style&styleType=${styleType}`
            });
          } else {
            // 处理失败
            wx.showToast({
              title: result.error || '风格转换失败',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          this.setData({
            isLoading: false
          });
          
          console.error('本地风格转换出错', error);
          wx.showToast({
            title: '风格转换出错',
            icon: 'none'
          });
        });
    }
  },

  /**
   * 创建GIF动画
   */
  createGifAnimation: function () {
    const imagePath = this.data.photoInfo.path;
    const effectType = this.data.effectType;
    const styleName = this.data.styleInfo.name;
    
    this.setData({
      loadingText: '正在生成GIF动画...'
    });
    
    // 优先使用后端API
    apiService.createGif(imagePath, effectType)
      .then(result => {
        this.setData({
          isLoading: false
        });
        
        if (result.success) {
          // 处理成功，跳转到预览页面
          wx.navigateTo({
            url: `/subpackages/style/pages/preview/preview?imagePath=${result.data.processedImageUrl}&originalPath=${imagePath}&processType=gif&effectType=${effectType}&styleName=${styleName}`
          });
        } else {
          // 后端API处理失败，尝试使用本地服务
          this.createLocalGif();
        }
      })
      .catch(error => {
        console.error('后端API GIF创建出错', error);
        // 尝试使用本地服务
        this.createLocalGif();
      });
  },
  
  /**
   * 使用本地服务创建GIF动画
   */
  createLocalGif: function () {
    const imagePath = this.data.photoInfo.path;
    const effectType = this.data.effectType;
    const styleName = this.data.styleInfo.name;
    
    // 使用本地图像处理服务创建简单GIF
    imageProcessingService.createSimpleGif(imagePath, effectType)
      .then(result => {
        this.setData({
          isLoading: false
        });
        
        // 跳转到预览页面
        wx.navigateTo({
          url: `/subpackages/style/pages/preview/preview?imagePath=${result.tempFilePath}&originalPath=${imagePath}&processType=gif&effectType=${effectType}&styleName=${styleName}`
        });
      })
      .catch(error => {
        console.error('本地GIF创建出错', error);
        this.setData({
          isLoading: false
        });
        
        wx.showToast({
          title: 'GIF创建失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 返回上一页
   */
  goBack: function () {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时可以执行一些操作
  }
});
