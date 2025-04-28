// style_select.js - 风格选择页面逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../../../services/api');
// 引入图像处理服务
const imageProcessingService = require('../../../../services/imageProcessing');
// 引入文件系统管理器
const fsm = wx.getFileSystemManager();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    photoList: [], // 照片列表
    albumList: [], // 相册列表
    selectedImage: '', // 选中的图片路径
    selectedImageIndex: -1, // 选中的图片索引
    currentAlbum: 'all', // 当前选中的相册ID
    currentAlbumName: '所有照片', // 当前选中的相册名称
    showAlbumPanel: false, // 是否显示相册选择面板
    isLoading: false, // 加载状态
    loadingText: '加载中...', // 加载提示文字
    hasPhotoAuthorization: false, // 是否有相册访问权限
    // 风格相关数据
    categories: [], // 风格类别
    styles: {}, // 各类别下的具体风格
    currentCategoryIndex: 0, // 当前选中的风格类别索引
    currentStyles: [] // 当前类别下的风格列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查相册访问权限
    this.checkPhotoAuthorization();
  },
  
  /**
   * 检查相册访问权限
   */
  checkPhotoAuthorization: function() {
    this.setData({ isLoading: true, loadingText: '检查权限中...' });
    
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => {
        // 获取写入相册权限成功，继续请求读取权限
        this.setData({ hasPhotoAuthorization: true });
        this.loadAlbums();
      },
      fail: () => {
        // 用户拒绝授权，显示引导页面
        this.setData({ 
          isLoading: false,
          hasPhotoAuthorization: false 
        });
        this.showAuthorizationGuide();
      }
    });
  },
  
  /**
   * 显示授权引导
   */
  showAuthorizationGuide: function() {
    wx.showModal({
      title: '需要访问相册权限',
      content: '为了让您选择照片应用风格效果，我们需要访问您的相册',
      confirmText: '去授权',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting['scope.writePhotosAlbum']) {
                this.setData({ hasPhotoAuthorization: true });
                this.loadAlbums();
              }
            }
          });
        } else {
          // 用户拒绝授权，返回上一页
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 加载相册列表
   */
  loadAlbums: function() {
    this.setData({ isLoading: true, loadingText: '加载相册中...' });
    
    // 模拟获取相册列表
    setTimeout(() => {
      const mockAlbums = [
        { id: 'all', name: '所有照片', count: 128 },
        { id: 'favorites', name: '收藏', count: 24 },
        { id: 'recent', name: '最近添加', count: 36 },
        { id: 'selfies', name: '自拍', count: 42 },
        { id: 'screenshots', name: '截图', count: 18 }
      ];
      
      this.setData({
        albumList: mockAlbums,
        isLoading: false
      });
      
      // 默认加载"所有照片"相册
      this.loadPhotosFromAlbum('all', '所有照片');
    }, 500);
  },

  /**
   * 从相册加载照片
   */
  loadPhotosFromAlbum: function(albumId, albumName) {
    this.setData({ 
      isLoading: true, 
      loadingText: '加载照片中...',
      currentAlbum: albumId,
      currentAlbumName: albumName,
      showAlbumPanel: false
    });
    
    // 模拟从相册加载照片列表
    setTimeout(() => {
      // 生成30张模拟照片
      const mockPhotos = [];
      for (let i = 1; i <= 30; i++) {
        mockPhotos.push({
          id: `photo-${i}`,
          path: `/images/mock/photo-${i % 8 + 1}.jpg`, // 使用循环的8张模拟图片
          date: new Date(2025, 3, 20 - i).getTime()
        });
      }
      
      this.setData({
        photoList: mockPhotos,
        isLoading: false
      });
      
      // 默认选中第一张照片
      if (mockPhotos.length > 0 && this.data.selectedImageIndex === -1) {
        this.selectImage({ currentTarget: { dataset: { index: 0, path: mockPhotos[0].path } } });
      }
    }, 800);
  },

  /**
   * 选择照片
   */
  selectImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const path = e.currentTarget.dataset.path;
    
    this.setData({
      selectedImage: path,
      selectedImageIndex: index
    });
    
    // 可以在这里添加预览逻辑
    console.log('已选择照片:', path);
  },

  /**
   * 切换相册选择面板
   */
  toggleAlbumPanel: function() {
    this.setData({
      showAlbumPanel: !this.data.showAlbumPanel
    });
  },

  /**
   * 选择相册
   */
  selectAlbum: function(e) {
    const albumId = e.currentTarget.dataset.albumId;
    const albumName = e.currentTarget.dataset.albumName;
    this.loadPhotosFromAlbum(albumId, albumName);
  },

  /**
   * 前往风格选择
   */
  goToStyleSelection: function() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择一张照片',
        icon: 'none'
      });
      return;
    }
    
    // 加载风格数据
    this.loadStyleData();
    
    // 跳转到风格选择界面 - 由于我们已经在风格选择页面，这里可以切换视图或通过API调用获取风格数据
    wx.navigateTo({
      url: `/subpackages/style/pages/style_select_result/style_select_result?imagePath=${encodeURIComponent(this.data.selectedImage)}`
    });
  },
  
  /**
   * 加载风格数据
   */
  loadStyleData: function() {
    this.setData({
      isLoading: true,
      loadingText: '加载风格数据...'
    });
    
    // 调用API加载风格数据
    apiService.getStyleCategories()
      .then(categories => {
        // 成功获取风格类别
        this.setData({
          categories: categories,
          isLoading: false
        });
        
        // 加载每个类别下的具体风格
        let promises = categories.map(category => {
          return apiService.getStylesByCategory(category.id)
            .then(styles => ({categoryId: category.id, styles: styles}));
        });
        
        // 等待所有风格数据加载完成
        return Promise.all(promises);
      })
      .then(results => {
        // 整理风格数据
        let stylesObj = {};
        results.forEach(result => {
          stylesObj[result.categoryId] = result.styles;
        });
        
        // 更新数据
        this.setData({
          styles: stylesObj,
          currentStyles: stylesObj[this.data.categories[0].id] || []
        });
      })
      .catch(error => {
        console.error('加载风格数据失败:', error);
        this.setData({
          isLoading: false
        });
        wx.showToast({
          title: '加载风格数据失败',
          icon: 'none'
        });
      });
  },
  
  /**
   * 切换风格类别
   */
  switchCategory: function(e) {
    const index = e.currentTarget.dataset.index;
    const categoryId = this.data.categories[index].id;
    
    this.setData({
      currentCategoryIndex: index,
      currentStyles: this.data.styles[categoryId] || []
    });
  },
  
  /**
   * 选择具体风格
   */
  selectStyle: function(e) {
    const styleId = e.currentTarget.dataset.id;
    const category = this.data.categories[this.data.currentCategoryIndex];
    const style = this.data.currentStyles.find(s => s.id === styleId);
    
    if (!style) return;
    
    this.setData({
      isLoading: true,
      loadingText: `应用${style.name}风格中...`
    });
    
    // 调用API应用风格
    apiService.applyStyle(this.data.selectedImage, styleId)
      .then(result => {
        // 处理结果
        this.setData({
          imagePath: result.imagePath,
          isLoading: false
        });
        
        // 成功提示
        wx.showToast({
          title: '风格应用成功',
          icon: 'success'
        });
      })
      .catch(error => {
        console.error('应用风格失败:', error);
        this.setData({
          isLoading: false
        });
        wx.showToast({
          title: '应用风格失败',
          icon: 'none'
        });
      });
  },
  
  /**
   * 保存当前效果图
   */
  saveImage: function() {
    if (!this.data.imagePath) {
      wx.showToast({
        title: '暂无图片可保存',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      loadingText: '保存图片中...'
    });
    
    // 保存图片到相册
    wx.saveImageToPhotosAlbum({
      filePath: this.data.imagePath,
      success: () => {
        this.setData({
          isLoading: false
        });
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: error => {
        console.error('保存图片失败:', error);
        this.setData({
          isLoading: false
        });
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
