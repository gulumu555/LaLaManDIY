import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 分类管理 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const categoryApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/Category/getList',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/Category/findData',params);
    },
    //更新
    update: (params = {}) => {
        return http.post('/admin/Category/update',params);
    },
    //更新状态
    updateStatus: (params = {}) => {
        return http.post('/admin/Category/updateStatus',params);
    },
        
}