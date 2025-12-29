// story_result.js - 结果展示页逻辑
const app = getApp();
const apiService = require('../../services/api');

Page({
    data: {
        // 结果数据
        resultId: '',
        imageUrl: '',
        location: '',
        timeDisplay: '',
        caption: '',

        // 状态
        isRefreshingCaption: false,
        showShareModal: false,

        // 原始数据（用于生成合成图）
        originalData: null
    },

    onLoad: function (options) {
        // 从URL参数获取数据
        const resultId = options.resultId || '';
        const imageUrl = decodeURIComponent(options.imageUrl || '');
        const location = decodeURIComponent(options.location || 'SOMEWHERE · EARTH');

        // 生成时间显示
        const now = new Date();
        const timeDisplay = this.formatTime(now);

        this.setData({
            resultId,
            imageUrl,
            location,
            timeDisplay,
            originalData: { resultId, imageUrl, location }
        });

        // 生成初始文案
        this.generateCaption();
    },

    // 格式化时间
    formatTime: function (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    },

    // 生成文案
    generateCaption: function () {
        this.setData({ isRefreshingCaption: true });

        const { location, timeDisplay } = this.data;

        // 从位置提取城市
        const city = location.split('·')[0].trim();

        apiService.generateCaption({
            city: city,
            time: timeDisplay,
            relation: 'self', // 可扩展：self/couple/family
            emotion: 'memory' // 可扩展：happy/sad/memory/calm
        })
            .then(res => {
                if (res.success && res.data && res.data.caption) {
                    this.setData({ caption: res.data.caption });
                } else {
                    // 使用默认文案
                    this.setData({ caption: this.getDefaultCaption() });
                }
            })
            .catch(err => {
                console.error('生成文案失败:', err);
                this.setData({ caption: this.getDefaultCaption() });
            })
            .finally(() => {
                this.setData({ isRefreshingCaption: false });
            });
    },

    // 获取默认文案
    getDefaultCaption: function () {
        const captions = [
            '这一格，是我们留下的。',
            '这一刻，没有什么需要解释。',
            '那天其实很普通，但我记住了。',
            '有些画面，值得被留住。',
            '日子平淡，但有你就不一样。',
            '在这里，时间慢了一点。',
            '不是每个瞬间都会被记住，但这个会。',
            '走过的路，都会变成故事。'
        ];
        return captions[Math.floor(Math.random() * captions.length)];
    },

    // 刷新文案
    refreshCaption: function () {
        if (this.data.isRefreshingCaption) return;
        this.generateCaption();
    },

    // 图片加载完成
    onImageLoad: function () {
        console.log('图片加载完成');
    },

    // 保存到相册
    saveToAlbum: function () {
        wx.showLoading({ title: '正在保存...' });

        // 先下载图片到临时文件
        wx.downloadFile({
            url: this.data.imageUrl,
            success: (res) => {
                if (res.statusCode === 200) {
                    // 保存到相册
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            wx.hideLoading();
                            wx.showToast({ title: '已保存到相册', icon: 'success' });
                        },
                        fail: (err) => {
                            wx.hideLoading();
                            if (err.errMsg.includes('auth deny')) {
                                wx.showModal({
                                    title: '提示',
                                    content: '需要您授权保存图片到相册',
                                    confirmText: '去授权',
                                    success: (modalRes) => {
                                        if (modalRes.confirm) {
                                            wx.openSetting();
                                        }
                                    }
                                });
                            } else {
                                wx.showToast({ title: '保存失败', icon: 'none' });
                            }
                        }
                    });
                }
            },
            fail: () => {
                wx.hideLoading();
                wx.showToast({ title: '下载失败', icon: 'none' });
            }
        });
    },

    // 分享图片
    shareImage: function () {
        this.setData({ showShareModal: true });
    },

    // 隐藏分享弹窗
    hideShareModal: function () {
        this.setData({ showShareModal: false });
    },

    // 分享到朋友圈
    shareToMoments: function () {
        this.hideShareModal();
        // 先保存到相册，提示用户从相册分享
        this.saveToAlbum();
        setTimeout(() => {
            wx.showModal({
                title: '提示',
                content: '图片已保存，请打开微信朋友圈从相册选择发送',
                showCancel: false
            });
        }, 1500);
    },

    // 复制链接
    copyLink: function () {
        this.hideShareModal();
        // 生成小程序链接或H5链接
        const shareUrl = `https://lalaman.app/share/${this.data.resultId}`;
        wx.setClipboardData({
            data: shareUrl,
            success: () => {
                wx.showToast({ title: '链接已复制', icon: 'success' });
            }
        });
    },

    // 再来一张
    createAnother: function () {
        wx.navigateTo({
            url: '/pages/story_create/story_create'
        });
    },

    // 返回首页
    goHome: function () {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },

    // 分享给好友
    onShareAppMessage: function () {
        return {
            title: this.data.caption || 'LaLaMan - 用漫画表达你的故事',
            path: `/pages/story_result/story_result?resultId=${this.data.resultId}&imageUrl=${encodeURIComponent(this.data.imageUrl)}&location=${encodeURIComponent(this.data.location)}`,
            imageUrl: this.data.imageUrl
        };
    }
});
