import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 充值订单 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const paymentsApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/Payments/getList',params);
    },
        
}