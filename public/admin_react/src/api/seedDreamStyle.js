import { http } from '@/common/axios.js'

/**
 * Seedream风格配置 API
 *
 * @author LaLaMan
 */
export const seedDreamStyleApi = {
    // 列表
    getList: (params = {}) => {
        return http.get('/admin/SeedDreamStyle/getList', params);
    },
    // 新增
    create: (params = {}) => {
        return http.post('/admin/SeedDreamStyle/create', params);
    },
    // 获取数据
    findData: (params = {}) => {
        return http.get('/admin/SeedDreamStyle/findData', params);
    },
    // 更新
    update: (params = {}) => {
        return http.post('/admin/SeedDreamStyle/update', params);
    },
    // 删除
    delete: (params = {}) => {
        return http.post('/admin/SeedDreamStyle/delete', params);
    },
    // 更新状态
    updateStatus: (params = {}) => {
        return http.post('/admin/SeedDreamStyle/updateStatus', params);
    },
    // 获取分类列表
    getCategories: () => {
        return http.get('/admin/SeedDreamStyle/getCategories');
    },
}
