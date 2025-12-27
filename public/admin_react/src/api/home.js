import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 首页列表 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const homeApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/Home/getList',params);
    },
    //新增
    create: (params = {}) => {
        return http.post('/admin/Home/create',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/Home/findData',params);
    },
    //更新
    update: (params = {}) => {
        return http.post('/admin/Home/update',params);
    },
    //删除
    delete: (params = {}) => {
        return http.post('/admin/Home/delete',params);
    },
        
}