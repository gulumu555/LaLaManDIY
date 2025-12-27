import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 产品管理 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const productApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/Product/getList',params);
    },
    //新增
    create: (params = {}) => {
        return http.post('/admin/Product/create',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/Product/findData',params);
    },
    //更新
    update: (params = {}) => {
        return http.post('/admin/Product/update',params);
    },
    //删除
    delete: (params = {}) => {
        return http.post('/admin/Product/delete',params);
    },
    //更新
    updateStatus: (params = {}) => {
        return http.post('/admin/Product/updateStatus',params);
    },
}
