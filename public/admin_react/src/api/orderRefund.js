import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 退款信息 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const orderRefundApi = {
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/OrderRefund/findData',params);
    },
    //更新状态
    updateStatus: (params = {}) => {
        return http.post('/admin/OrderRefund/updateStatus',params);
    },
        
}