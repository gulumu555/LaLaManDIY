<?php

namespace app\common\logic;

use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\utils\constants\OrderConstants;
use taoser\Validate;

class PaymentsValidate extends Validate
{
    protected $rule =[
        'order_id|' => 'require|validateId',
    ];


    protected function validateId($value, $rule, $data)
    {
        $payment = PaymentsModel::where('order_id', $value)->find();
        if (!$payment) return '支付单不存在';
        if ($payment->payment_status != OrderConstants::PAYMENT_STATUS_PENDING) return '订单不可取消';

        $order = OrdersModel::find($payment->order_id);
        if (!$order) return '订单不存在';
        if ($order->order_status != OrderConstants::PAYMENT_STATUS_PENDING) return '订单不可取消';
        return true;
    }
}