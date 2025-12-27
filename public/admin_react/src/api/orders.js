import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 打印订单 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const ordersApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/Orders/getList',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/Orders/findData',params);
    },
    //更新
    updateShipping: (params = {}) => {
        return http.post('/admin/Orders/updateShipping',params);
    },
    download: (params = {}) => {
        return http.post('/admin/Orders/download',params);
    },
}
