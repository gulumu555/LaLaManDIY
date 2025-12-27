import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 风格样例 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const photoStyleApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/PhotoStyle/getList',params);
    },
    //新增
    create: (params = {}) => {
        return http.post('/admin/PhotoStyle/create',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/PhotoStyle/findData',params);
    },
    //更新
    update: (params = {}) => {
        return http.post('/admin/PhotoStyle/update',params);
    },
    //删除
    delete: (params = {}) => {
        return http.post('/admin/PhotoStyle/delete',params);
    },
    updateStatus: (params = {}) => {
        return http.post('/admin/PhotoStyle/updateStatus',params);
    },
}
