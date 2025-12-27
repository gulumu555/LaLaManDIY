<?php
namespace app\admin\validate;

use app\common\model\OrderRefundModel;
use app\common\model\OrdersModel;
use app\utils\constants\OrderConstants;
use taoser\Validate;

/**
 * 退款信息 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class OrderRefundValidate extends Validate
{

    // 验证规则
    protected $rule = [
        'refund_amount|refund_amount' => 'require',
        'wx_amount|wx_amount' => 'require',
        'balance_amount|balance_amount' => 'require',
        'order_id|order_id' => 'require',
        'examine_status|examine_status' => 'require|in:2,3|validateStatus',
    ];


    protected function validateStatus($value, $rule, $data)
    {
        $refund = OrderRefundModel::where('order_id', $data['order_id'])->find();
        if (!$refund) return '订单不存在';
        if ($refund['examine_status']!= OrderConstants::REFUND_STATUS_APPLY_REFUNDED) return '该订单已审核';

        $order = OrdersModel::where('id', $data['order_id'])->find();
        if (!$order) return '订单不存在';
        if ($order['refund_status']!= OrderConstants::REFUND_STATUS_APPLY_REFUNDED) return '该订单不在申请退款状态';

        if ($data['wx_amount'] > $order->payment_amount) return '微信可退款金额不能大于支付金额';
        if ($data['balance_amount'] > $order->balance_amount) return '佣金可退款金额不能大于支付佣金金额';
        if (number_format($data['refund_amount'], 2, '.', '') <
            number_format($data['wx_amount'] + $data['balance_amount'], 2, '.', '')) return '微信与佣金可退款金额之和不能超过退款总额';

        return true;
    }
}