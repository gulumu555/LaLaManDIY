// photo_select.js - 风格功能照片选择页面逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../../../services/api');
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
    hasPhotoAuthorization: false // 是否有相册访问权限
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
      content: '为了让您选择照片制作风格效果，我们需要访问您的相册',
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
    
    // 模拟从相册加载照片
    setTimeout(() => {
      // 生成模拟照片数据
      const mockPhotos = [];
      const count = albumId === 'all' ? 30 : (albumId === 'favorites' ? 15 : 20);
      
      for (let i = 0; i < count; i++) {
        mockPhotos.push({
          id: `photo_${albumId}_${i}`,
          path: `https://picsum.photos/id/${300 + i}/300/300`,
          createTime: new Date().getTime() - i * 86400000 // 每张照片间隔一天
        });
      }
      
      this.setData({
        photoList: mockPhotos,
        isLoading: false
      });
      
      // 默认选中第一张照片
      if (mockPhotos.length > 0) {
        this.selectImage(null, 0, mockPhotos[0].path);
      }
    }, 800);
  },

  /**
   * 选择照片
   */
  selectImage: function(e, index, path) {
    // 支持两种调用方式：事件触发或直接传参
    let selectedIndex = index;
    let imagePath = path;
    
    if (e) {
      selectedIndex = e.currentTarget.dataset.index;
      imagePath = e.currentTarget.dataset.path;
    }
    
    this.setData({
      selectedImageIndex: selectedIndex,
      selectedImage: imagePath
    });
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
    
    // 下载网络图片到本地临时文件
    wx.downloadFile({
      url: this.data.selectedImage,
      success: (res) => {
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath;
          
          // 跳转到风格选择页面，并传递图片路径
          wx.redirectTo({
            url: './style_select?imagePath=' + encodeURIComponent(tempFilePath)
          });
        } else {
          wx.showToast({
            title: '图片下载失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('下载图片失败:', error);
        wx.showToast({
          title: '下载图片失败',
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
