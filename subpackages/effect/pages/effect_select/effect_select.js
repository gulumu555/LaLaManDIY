// effect_select.js - 动效选择页面逻辑
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
    showEffectPanel: false, // 是否显示动效选择面板
    selectedEffect: '', // 选中的动效类型
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
      content: '为了让您选择照片制作动效，我们需要访问您的相册',
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
          path: `https://picsum.photos/id/${200 + i}/300/300`,
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
   * 前往动效选择
   */
  goToEffectSelection: function() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择一张照片',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到新的动效结果页面，并传递选中的图片路径
    wx.navigateTo({
      url: `/subpackages/effect/pages/effect_result/effect_result?imagePath=${encodeURIComponent(this.data.selectedImage)}`
    });
  },
  
  /**
   * 隐藏动效选择面板
   */
  hideEffectPanel: function() {
    this.setData({
      showEffectPanel: false
    });
  },
  
  /**
   * 选择动效类型
   */
  selectEffect: function(e) {
    const effectId = e.currentTarget.dataset.effect;
    this.setData({
      selectedEffect: effectId
    });
  },

  /**
   * 预览动效效果
   */
  previewEffect: function() {
    if (!this.data.selectedImage || !this.data.selectedEffect) {
      wx.showToast({
        title: '请选择照片和动效类型',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      loadingText: '生成预览中...'
    });
    
    // 模拟预览生成过程
    setTimeout(() => {
      this.setData({ isLoading: false });
      
      wx.showToast({
        title: '预览功能开发中',
        icon: 'none'
      });
    }, 1500);
  },
  
  /**
   * 创建动效
   */
  createEffect: function() {
    if (!this.data.selectedImage || !this.data.selectedEffect) {
      wx.showToast({
        title: '请选择照片和动效类型',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isLoading: true,
      loadingText: '生成动效中...'
    });

    // 模拟下载网络图片到本地临时文件
    wx.downloadFile({
      url: this.data.selectedImage,
      success: (res) => {
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath;
          
          // 上传图片并处理动效
          apiService.uploadImage(tempFilePath, 'effect')
            .then(uploadResult => {
              if (uploadResult && uploadResult.success) {
                // 调用动效处理API
                return apiService.processEffect(uploadResult.imageId, this.data.selectedEffect);
              } else {
                throw new Error('图片上传失败');
              }
            })
            .then(effectResult => {
              if (effectResult && effectResult.success) {
                // 跳转到预览页面
                wx.navigateTo({
                  url: '/subpackages/effect/pages/effect_preview/effect_preview?gifUrl=' + effectResult.gifUrl
                });
              } else {
                throw new Error('动效处理失败');
              }
            })
            .catch(error => {
              console.error('生成动效失败:', error);
              wx.showToast({
                title: '生成动效失败',
                icon: 'none'
              });
            })
            .finally(() => {
              this.setData({
                isLoading: false,
                showEffectPanel: false
              });
            });
        } else {
          throw new Error('下载图片失败');
        }
      },
      fail: (error) => {
        console.error('下载图片失败:', error);
        wx.showToast({
          title: '下载图片失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
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
