import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 打印订单 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const photoOrderApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/PhotoOrder/getList',params);
    },
        
}