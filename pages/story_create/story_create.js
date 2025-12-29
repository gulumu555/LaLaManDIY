// story_create.js - 创作入口页逻辑
const app = getApp();
const apiService = require('../../services/api');

Page({
    data: {
        // 当前步骤 (1: 选意图, 2: 选风格+格数, 3: 选照片, 4: 确认)
        currentStep: 1,

        // 表达意图选项
        intents: [
            { key: 'moment', icon: '🧠', title: '记录一个瞬间', desc: '简单的一刻，值得留下', panels: 1 },
            { key: 'story', icon: '📖', title: '讲一个小故事', desc: '2-4格小情节', panels: 4 },
            { key: 'memory', icon: '🧊', title: '留一张纪念图', desc: '配上地点和时间的纪念卡', recommended: true, panels: 1 },
            { key: 'series', icon: '📷', title: '发一组朋友圈', desc: '适合九宫格展示', panels: 9 },
        ],
        selectedIntent: '',
        selectedIntentText: '',

        // 格数布局选项 (1/2/3/4/6/9)
        panelLayouts: [
            { count: 1, icon: '◼️', name: '1格', desc: '单图' },
            { count: 2, icon: '▬', name: '2格', desc: '对比' },
            { count: 3, icon: '☰', name: '3格', desc: '三连' },
            { count: 4, icon: '⊞', name: '4格', desc: '四格漫画' },
            { count: 6, icon: '⊞⊞', name: '6格', desc: '故事线' },
            { count: 9, icon: '▦', name: '9格', desc: '九宫格', recommended: true },
        ],
        selectedPanels: 1,

        // 风格选项
        styles: [],
        selectedStyle: '',
        selectedStyleText: '',

        // 照片
        photoPath: '',

        // 位置信息
        locationName: '',
        latitude: 0,
        longitude: 0,

        // 生成状态
        isGenerating: false,

        // 模板ID（如果从首页点击进入）
        templateId: '',
    },

    onLoad: function (options) {
        // 加载风格列表
        this.loadStyles();

        // 获取位置
        this.getLocation();

        // 如果从模板进入
        if (options.templateId) {
            this.setData({ templateId: options.templateId });
            // 预设选项
            if (options.intent) {
                this.setData({
                    selectedIntent: options.intent,
                    selectedIntentText: this.getIntentText(options.intent),
                    currentStep: 2
                });
            }
            if (options.style) {
                this.setData({
                    selectedStyle: options.style,
                    selectedStyleText: options.style
                });
            }
        }
    },

    // 加载风格列表
    loadStyles: function () {
        apiService.getStyles()
            .then(res => {
                if (res.success && res.data) {
                    const styles = res.data.map(item => ({
                        key: item.key || item.id,
                        name: item.name || item.style_name,
                        cover: item.cover_image || item.style_img || '/images/styles/default.png'
                    }));
                    this.setData({ styles });
                }
            })
            .catch(err => {
                console.error('加载风格失败:', err);
                // 使用默认风格
                this.setData({
                    styles: [
                        { key: 'ghibli_watercolor', name: '吉卜力水彩', cover: '/images/styles/ghibli.png' },
                        { key: 'jimmy', name: '几米', cover: '/images/styles/jimmy.png' },
                        { key: 'art_toy', name: '手办', cover: '/images/styles/art_toy.png' },
                        { key: 'chinese_ink', name: '国风水墨', cover: '/images/styles/ink.png' },
                        { key: 'disney', name: '迪士尼', cover: '/images/styles/disney.png' },
                        { key: 'shinkai', name: '新海诚', cover: '/images/styles/shinkai.png' },
                    ]
                });
            });
    },

    // 获取位置
    getLocation: function () {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                this.setData({
                    latitude: res.latitude,
                    longitude: res.longitude
                });
                // 反向地理编码获取城市名
                this.reverseGeocode(res.latitude, res.longitude);
            },
            fail: (err) => {
                console.log('获取位置失败，使用默认', err);
                this.setData({ locationName: 'SOMEWHERE · EARTH' });
            }
        });
    },

    // 反向地理编码
    reverseGeocode: function (lat, lng) {
        // 使用微信地图API或后端服务
        // 这里简化处理，实际需要接入地图服务
        const cities = {
            '39': 'BEIJING',
            '31': 'SHANGHAI',
            '30': 'CHENGDU',
            '23': 'GUANGZHOU',
            '22': 'SHENZHEN'
        };
        const latPrefix = Math.floor(lat).toString();
        const cityName = cities[latPrefix] || 'CHINA';
        this.setData({ locationName: `${cityName} · ${new Date().getFullYear()}` });
    },

    // 获取意图文本
    getIntentText: function (key) {
        const intent = this.data.intents.find(i => i.key === key);
        return intent ? intent.title : '';
    },

    // 选择意图
    selectIntent: function (e) {
        const key = e.currentTarget.dataset.key;
        const panels = e.currentTarget.dataset.panels || 1;
        const intent = this.data.intents.find(i => i.key === key);
        if (intent && !intent.disabled) {
            this.setData({
                selectedIntent: key,
                selectedIntentText: intent.title,
                selectedPanels: panels // 根据意图预设格数
            });
        }
    },

    // 选择格数
    selectPanels: function (e) {
        const count = e.currentTarget.dataset.count;
        this.setData({ selectedPanels: count });
    },

    // 选择风格
    selectStyle: function (e) {
        const key = e.currentTarget.dataset.key;
        const style = this.data.styles.find(s => s.key === key);
        this.setData({
            selectedStyle: key,
            selectedStyleText: style ? style.name : key
        });
    },

    // 选择照片
    choosePhoto: function () {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath;
                this.setData({ photoPath: tempFilePath });
            }
        });
    },

    // 移除照片
    removePhoto: function () {
        this.setData({ photoPath: '' });
    },

    // 下一步
    nextStep: function () {
        const { currentStep, selectedIntent, selectedStyle } = this.data;

        if (currentStep === 1) {
            if (!selectedIntent) {
                wx.showToast({ title: '请选择表达意图', icon: 'none' });
                return;
            }
        }

        if (currentStep === 2) {
            if (!selectedStyle) {
                wx.showToast({ title: '请选择风格', icon: 'none' });
                return;
            }
        }

        this.setData({ currentStep: currentStep + 1 });
    },

    // 上一步
    prevStep: function () {
        const { currentStep } = this.data;
        if (currentStep > 1) {
            this.setData({ currentStep: currentStep - 1 });
        }
    },

    // 开始生成
    startGenerate: function () {
        if (this.data.isGenerating) return;

        this.setData({ isGenerating: true });

        const { selectedStyle, selectedIntent, photoPath, latitude, longitude, locationName } = this.data;

        // 如果有照片，先上传
        const uploadPromise = photoPath
            ? this.uploadPhoto(photoPath)
            : Promise.resolve(null);

        uploadPromise
            .then(uploadedUrl => {
                // 调用生成API
                return apiService.generateStoryCard({
                    styleKey: selectedStyle,
                    intent: selectedIntent,
                    panelCount: this.data.selectedPanels,
                    identityImage: uploadedUrl,
                    location: locationName,
                    latitude: latitude,
                    longitude: longitude,
                    timestamp: Date.now()
                });
            })
            .then(res => {
                this.setData({ isGenerating: false });

                if (res.success && res.data) {
                    // 跳转到结果页
                    wx.navigateTo({
                        url: `/pages/story_result/story_result?resultId=${res.data.id}&imageUrl=${encodeURIComponent(res.data.imageUrl)}&location=${encodeURIComponent(this.data.locationName)}`
                    });
                } else {
                    throw new Error(res.message || '生成失败');
                }
            })
            .catch(err => {
                this.setData({ isGenerating: false });
                console.error('生成失败:', err);
                wx.showToast({ title: '生成失败，请重试', icon: 'none' });
            });
    },

    // 上传照片
    uploadPhoto: function (filePath) {
        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: apiService.getBaseUrl() + '/api/Upload/image',
                filePath: filePath,
                name: 'file',
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data);
                        if (data.code === 1 && data.data) {
                            resolve(data.data.url);
                        } else {
                            reject(new Error(data.message || '上传失败'));
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                fail: reject
            });
        });
    }
});
