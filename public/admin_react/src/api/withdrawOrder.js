import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 提现记录 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const withdrawOrderApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/WithdrawOrder/getList',params);
    },
    //获取数据
    findData: (params = {}) => {
        return http.get('/admin/WithdrawOrder/findData',params);
    },
    //更新
    updateStatus: (params = {}) => {
        return http.post('/admin/WithdrawOrder/updateStatus',params);
    },
}
