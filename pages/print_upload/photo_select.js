// photo_select.js - 打印功能照片选择页面逻辑
const app = getApp();
// 引入API服务
const apiService = require('../../services/api');
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
    orderInfo: null // 订单信息，从上一页传递过来
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取上一页传递的订单信息
    if (options.orderInfo) {
      try {
        const orderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
        this.setData({ orderInfo });
      } catch (error) {
        console.error('解析订单信息失败:', error);
      }
    }
    
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
      content: '为了让您选择照片进行打印，我们需要访问您的相册',
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
      // 使用项目中已有的图片资源
      const availableImages = [
        '/images/sample_portrait.jpg',
        '/images/styles/style1_ghibli.png',
        '/images/styles/style2_miyazaki.png',
        '/images/styles/style3_shinkai.png',
        '/images/styles/style4_ink.png',
        '/images/styles/style5_watercolor.png',
        '/images/styles/style6_love_death.png',
        '/images/styles/style7_pixar.png',
        '/images/styles/style8_pikachu.png',
        '/images/styles/style9_celshading.png',
        '/images/styles/style10_disney.png',
        '/images/product_print.jpg'
      ];
      
      // 生成30张模拟照片
      const mockPhotos = [];
      for (let i = 1; i <= 30; i++) {
        mockPhotos.push({
          id: `photo-${i}`,
          path: availableImages[i % availableImages.length], // 使用项目中已有的图片
          date: new Date(2025, 3, 20 - i).getTime()
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
   * 前往打印效果预览页面
   */
  goToPrintOrder: function() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择一张照片',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中提示
    this.setData({
      isLoading: true,
      loadingText: '准备图片中...'
    });
    
    // 检查是否为相对路径（本地图片）
    if (this.data.selectedImage.startsWith('/')) {
      // 直接使用项目中的图片，无需下载
      console.log('使用项目本地图片:', this.data.selectedImage);
      this.setData({ isLoading: false });
      
      // 直接上传图片
      this.uploadImageForPrint(this.data.selectedImage);
    } else {
      // 如果是完整URL，才尝试下载
      wx.downloadFile({
        url: this.data.selectedImage,
        success: (res) => {
          this.setData({ isLoading: false });
          
          if (res.statusCode === 200) {
            const tempFilePath = res.tempFilePath;
            
            // 上传图片到服务器，获取imageId
            this.uploadImageForPrint(tempFilePath);
          } else {
            wx.showToast({
              title: '图片下载失败',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('下载图片失败:', error);
          this.setData({ isLoading: false });
          
          // 如果下载失败，但路径存在，仍尝试使用
          if (this.data.selectedImage) {
            console.log('尝试直接使用图片路径:', this.data.selectedImage);
            this.uploadImageForPrint(this.data.selectedImage);
          } else {
            wx.showToast({
              title: '图片加载失败',
              icon: 'none'
            });
          }
        }
      });
    }
  },
  
  /**
   * 上传打印图片并跳转到预览页面
   */
  uploadImageForPrint: function(imagePath) {
    this.setData({
      isLoading: true,
      loadingText: '上传图片中...'
    });
    
    // 上传图片到服务器
    apiService.uploadImage(imagePath, 'print')
      .then(res => {
        this.setData({ isLoading: false });
        
        if (res.success && res.imageId) {
          // 准备打印参数
          let printParams = {
            imagePath: imagePath,
            imageId: res.imageId
          };
          
          // 如果有从上一页传递的订单信息，获取打印类型
          if (this.data.orderInfo && this.data.orderInfo.printType) {
            printParams.printType = this.data.orderInfo.printType;
          }
          
          // 跳转到打印效果预览页面
          wx.navigateTo({
            url: '/subpackages/print/pages/print_preview/print_preview?' + 
                 'imagePath=' + encodeURIComponent(imagePath) + 
                 '&imageId=' + encodeURIComponent(res.imageId) + 
                 (printParams.printType ? '&printType=' + printParams.printType : '')
          });
        } else {
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('图片上传失败:', err);
        this.setData({ isLoading: false });
        
        // 演示模式：即使上传失败也继续
        const mockImageId = 'IMG' + Date.now(); // 生成模拟图片ID
        
        wx.navigateTo({
          url: '/subpackages/print/pages/print_preview/print_preview?' + 
               'imagePath=' + encodeURIComponent(imagePath) + 
               '&imageId=' + mockImageId
        });
      });
  },
  
  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
