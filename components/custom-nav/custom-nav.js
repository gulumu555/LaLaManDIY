// components/custom-nav/custom-nav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true
    },
    // 自定义返回事件
    customBack: {
      type: Boolean,
      value: false
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      value: '#000000'
    },
    // 文字颜色
    textColor: {
      type: String,
      value: '#ffffff'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: 0,
    navBarHeight: 44, // 导航栏高度，默认44px
    titleText: '啦啦漫' // 默认标题文字
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached: function() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      // 设置状态栏高度
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 返回上一页
    navBack: function() {
      if (this.data.customBack) {
        // 触发自定义返回事件
        this.triggerEvent('back');
      } else {
        // 默认返回行为
        wx.navigateBack({
          delta: 1
        });
      }
    }
  }
})
