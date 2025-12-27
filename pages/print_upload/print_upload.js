// pages/print_upload/print_upload.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 打印规格数据
    printSizes: [
      {
        id: 'small',
        name: '小幅',
        size: '6寸 (约15×10cm)',
        price: 39.9,
        imageUrl: '/images/print/small_print.png'
      },
      {
        id: 'medium',
        name: '中幅',
        size: '30×20cm',
        price: 79.9,
        imageUrl: '/images/print/medium_print.png'
      },
      {
        id: 'large',
        name: '大幅',
        size: '60×40cm',
        price: 129.9,
        imageUrl: '/images/print/large_print.png'
      },
      {
        id: 'custom',
        name: '定制尺寸',
        size: '自定义',
        price: 0,
        imageUrl: '/images/print/custom_print.png'
      }
    ],
    selectedSize: null,
    uploadedImages: [], // 已上传的图片列表
    totalPrice: 0, // 总价
    maxImageCount: 10, // 最大上传图片数量
    isUploading: false // 是否正在上传
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '上传图片'
    });

    // 获取传递的规格ID和价格
    const { sizeId, price } = options;
    
    if (sizeId) {
      // 根据ID获取选中的规格
      const selectedSize = this.data.printSizes.find(item => item.id === sizeId);
      
      if (selectedSize) {
        // 如果是自定义尺寸，价格需要单独处理
        if (sizeId === 'custom') {
          // 这里可以添加自定义尺寸的价格计算逻辑
          selectedSize.price = 99.9; // 默认价格，实际应该根据用户输入计算
        }
        
        this.setData({
          selectedSize: selectedSize,
          totalPrice: 0 // 初始总价为0，等待用户上传图片后计算
        });
      }
    }
  },

  /**
   * 选择并上传图片
   */
  chooseAndUploadImage: function () {
    const that = this;
    const { uploadedImages, maxImageCount } = this.data;
    
    // 检查是否已达到最大上传数量
    if (uploadedImages.length >= maxImageCount) {
      wx.showToast({
        title: `最多只能上传${maxImageCount}张图片`,
        icon: 'none'
      });
      return;
    }
    
    // 计算还能上传的图片数量
    const remainCount = maxImageCount - uploadedImages.length;
    
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        // 显示上传中提示
        that.setData({ isUploading: true });
        
        const tempFiles = res.tempFiles;
        const uploadTasks = [];
        
        // 模拟上传过程（实际项目中应该调用真实的上传API）
        tempFiles.forEach((file, index) => {
          uploadTasks.push(
            new Promise((resolve) => {
              // 模拟上传延迟
              setTimeout(() => {
                // 生成唯一ID
                const imageId = 'img_' + Date.now() + '_' + index;
                
                // 构建上传后的图片对象
                const uploadedImage = {
                  id: imageId,
                  path: file.tempFilePath,
                  size: file.size,
                  uploadTime: new Date().getTime()
                };
                
                resolve(uploadedImage);
              }, 500);
            })
          );
        });
        
        // 等待所有图片上传完成
        Promise.all(uploadTasks).then(newImages => {
          // 合并新上传的图片和已有图片
          const updatedImages = [...that.data.uploadedImages, ...newImages];
          
          // 计算总价
          const totalPrice = that._calculateTotalPrice(updatedImages);
          
          // 更新数据
          that.setData({
            uploadedImages: updatedImages,
            totalPrice: totalPrice,
            isUploading: false
          });
        });
      },
      fail: function (err) {
        console.error('选择图片失败', err);
        that.setData({ isUploading: false });
      }
    });
  },

  /**
   * 删除已上传的图片
   */
  deleteImage: function (e) {
    const imageId = e.currentTarget.dataset.id;
    const { uploadedImages } = this.data;
    
    // 过滤掉要删除的图片
    const updatedImages = uploadedImages.filter(img => img.id !== imageId);
    
    // 重新计算总价
    const totalPrice = this._calculateTotalPrice(updatedImages);
    
    // 更新数据
    this.setData({
      uploadedImages: updatedImages,
      totalPrice: totalPrice
    });
  },

  /**
   * 预览图片
   */
  previewImage: function (e) {
    const imageId = e.currentTarget.dataset.id;
    const { uploadedImages } = this.data;
    
    // 找到要预览的图片
    const targetImage = uploadedImages.find(img => img.id === imageId);
    
    if (targetImage) {
      // 构建预览图片的URL数组
      const urls = uploadedImages.map(img => img.path);
      const current = targetImage.path;
      
      wx.previewImage({
        urls: urls,
        current: current
      });
    }
  },

  /**
   * 计算总价
   */
  _calculateTotalPrice: function (images) {
    const { selectedSize } = this.data;
    
    if (!selectedSize || images.length === 0) {
      return 0;
    }
    
    // 单价 × 图片数量
    return (selectedSize.price * images.length).toFixed(2);
  },

  /**
   * 继续按钮点击事件 - 导航到订单确认页面
   */
  goToOrderConfirm: function () {
    const { uploadedImages, totalPrice, selectedSize } = this.data;
    
    if (uploadedImages.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return;
    }
    
    // 构建订单数据
    const orderData = {
      printSize: selectedSize,
      images: uploadedImages,
      totalPrice: totalPrice,
      quantity: uploadedImages.length
    };
    
    // 将订单数据序列化为JSON字符串
    const orderDataStr = JSON.stringify(orderData);
    
    // 导航到订单确认页面
    wx.navigateTo({
      url: `/pages/print_order/print_order?orderData=${encodeURIComponent(orderDataStr)}`
    });
  },

  /**
   * 返回上一页
   */
  goBack: function () {
    wx.navigateBack();
  }
});
