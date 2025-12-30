import { http } from '@/common/axios.js';

/**
 * AI模型配置 API
 */
export const modelConfigApi = {
    // 列表
    getList: (params = {}) => {
        return http.get('/admin/ModelConfig/getList', params);
    },
    // 获取激活模型列表（用于下拉选择）
    getActiveList: () => {
        return http.get('/admin/ModelConfig/getActiveList');
    },
    // 新增
    create: (params = {}) => {
        return http.post('/admin/ModelConfig/create', params);
    },
    // 获取数据
    findData: (params = {}) => {
        return http.get('/admin/ModelConfig/findData', params);
    },
    // 更新
    update: (params = {}) => {
        return http.post('/admin/ModelConfig/update', params);
    },
    // 删除
    delete: (params = {}) => {
        return http.post('/admin/ModelConfig/delete', params);
    },
    // 设置为默认
    setDefault: (params = {}) => {
        return http.post('/admin/ModelConfig/setDefault', params);
    },
    // 更新状态
    updateStatus: (params = {}) => {
        return http.post('/admin/ModelConfig/updateStatus', params);
    },
};
