import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 支付配置 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const serviceProductApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/ServiceProduct/getList',params);
    },
    //新增
    create: (params = {}) => {
        return http.post('/admin/ServiceProduct/create',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/ServiceProduct/findData',params);
    },
    //更新
    update: (params = {}) => {
        return http.post('/admin/ServiceProduct/update',params);
    },
    //更新状态
    updateStatus: (params = {}) => {
        return http.post('/admin/ServiceProduct/updateStatus',params);
    },
        
}