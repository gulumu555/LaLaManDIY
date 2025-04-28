// components/offscreen-canvas/offscreen-canvas.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: Number,
      value: 300
    },
    height: {
      type: Number,
      value: 300
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取Canvas上下文
     * @returns {Object} Canvas上下文
     */
    getContext: function() {
      return wx.createCanvasContext('offscreenCanvas', this);
    },
    
    /**
     * 导出Canvas为图片
     * @param {Object} options - 导出选项
     * @returns {Promise} 返回Promise对象，包含临时文件路径
     */
    exportToImage: function(options = {}) {
      const defaultOptions = {
        fileType: 'jpg',
        quality: 0.9
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvasId: 'offscreenCanvas',
          fileType: finalOptions.fileType,
          quality: finalOptions.quality,
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: (err) => {
            reject(err);
          }
        }, this);
      });
    }
  }
});
