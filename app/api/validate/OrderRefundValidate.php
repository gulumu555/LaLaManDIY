<?php

namespace app\api\validate;

use app\common\model\OrderRefundModel;
use app\common\model\OrdersModel;
use app\utils\constants\OrderConstants;
use taoser\Validate;

class OrderRefundValidate extends Validate
{

    protected $rule = [
        'refund_amount|退款金额' => 'require|egt:0.01',
        'reason|退款原因' => 'require',
        'file|退款凭证' => 'require',
        'id|订单ID' =>'require|number|validateOrder',
    ];

    protected function validateOrder($value, $rule, $data): bool|string
    {

        $order = OrdersModel::where('id', $value)->find();
        if (!$order) return '订单不存在';

        if ($order->order_type != OrderConstants::ORDER_TYPE_PRINT) return '非打印订单';
        if ($order->payment_status != OrderConstants::PAYMENT_STATUS_PAID) return '订单未支付';
        if ($order->refund_status == OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS) return '订单已退款';

        if ($order->logistics_status == OrderConstants::LOGISTICS_STATUS_RECEIVING) return '请先确认收货';


        if ($data['refund_amount'] > $order->total_amount)  return "退款金额不正确";


        //if ($order->total_amount < $data['refund_amount']) return '退款金额不能大于订单总金额';

        return true;
    }
}