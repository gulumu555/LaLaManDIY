/**
 * MCP (Model Control Panel) 配置
 * 用于管理和切换不同的AI模型服务提供商
 */

// 从环境变量获取当前使用的模型提供商
const currentProvider = process.env.MCP_PROVIDER || 'mock';

// 各提供商配置
const providers = {
  // 模拟数据（开发测试用）
  mock: {
    name: '模拟数据',
    apiKey: 'mock-key',
    baseUrl: 'http://localhost/mock',
    timeout: 5000
  },
  
  // 腾讯云AI服务
  tencent: {
    name: '腾讯云AI',
    apiKey: process.env.TENCENT_API_KEY,
    secretKey: process.env.TENCENT_SECRET_KEY,
    baseUrl: 'https://api.cloud.tencent.com',
    timeout: 30000
  },
  
  // 百度AI开放平台
  baidu: {
    name: '百度AI',
    apiKey: process.env.BAIDU_API_KEY,
    secretKey: process.env.BAIDU_SECRET_KEY,
    baseUrl: 'https://aip.baidubce.com',
    timeout: 30000
  }
  
  // 可以添加更多提供商...
};

// 导出配置
module.exports = {
  // 当前使用的提供商
  currentProvider,
  
  // 获取当前提供商配置
  getProviderConfig() {
    return providers[currentProvider] || providers.mock;
  },
  
  // 获取所有提供商列表
  getAllProviders() {
    return Object.keys(providers).map(key => ({
      id: key,
      name: providers[key].name
    }));
  },
  
  // 切换提供商
  switchProvider(providerId) {
    if (providers[providerId]) {
      process.env.MCP_PROVIDER = providerId;
      return true;
    }
    return false;
  }
};
