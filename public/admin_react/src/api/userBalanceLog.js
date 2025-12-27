import { http } from '@/common/axios.js'
import { config } from '@/common/config';

/**
 * 佣金明细 API
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const userBalanceLogApi = {
    //列表
    getList: (params = {}) => {
        return http.get('/admin/UserBalanceLog/getList',params);
    },
        
}