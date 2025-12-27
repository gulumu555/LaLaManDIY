export const config = {
    // 是否开启debug
    debug: import.meta.env.VITE_APP_DEBUG === 'true' ? true : false,
    // 项目的url
    url: import.meta.env.VITE_APP_BASE_URL,
    // 项目名称，显示登录页及登录后左上角
    projectName: 'LaLaMan后台管理系统',
    // 公司名称，显示在页脚
    company: 'LaLaMan',
    icp: '蜀ICP备2025153311号-1',
    // 存储本地数据前缀，存在本地的所有数据都有此前缀
    storageDbPrefix: 'adminDb',
    // api请求数据加密，需要跟后端的开关对应
    api_encryptor: {
        // 开关
        enable: false,
        rsa_public: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkDgd1RAyPBOXwgCLfVqm
fNLcRTi3D3O5HxBjGiX9k311XnH+8jff5C7fGDYyUo6RoPqyF4Bq5rSeccRukk+t
9/5Iw8iQdixn+cxRaldPJuXAITauzMpPNSl5/n2lbvsRyttyrdxdkzsMdVoJ/NvP
0Le2QoJy8/NW8ZqRoJMiOoSSkwNgzmeeljs+cWmqMYyiTcwAPDR7KbgO8+1EOt5+
1/d0Sv8zj+KXG/gkClM5Ad9jjkdkrKweaFKTbu3j9cJR58+E6iBozEdZqhFz2lMi
LTUQwo43Bl5Yh/V2aMKeghKh8IVb2aJnTlmpLnPC4NS1G8izvfQFiOw+o4bpj0aF
NQIDAQAB
-----END PUBLIC KEY-----`,
    },
    // 腾讯地图apiKey，form里面的的腾讯经纬度字段组件需要使用
    tencentApiKey: '',
    uploadImgMax: 10, // 图片最大上传xx兆
    uploadFileMax: 100, // 文件最大上传xx兆
    uploadMediaMax: 500, // 媒体最大上传xx兆
};
