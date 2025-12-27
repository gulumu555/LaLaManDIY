<?php

namespace app\utils\constants;

class OrderConstants
{
    /** 充值类型订单 */
    const ORDER_TYPE_BUY = 1;

    /** 打印类型订单 */
    const ORDER_TYPE_PRINT = 2;

    /** 待支付 */
    const PAYMENT_STATUS_PENDING = 0;

    /** 已支付 */
    const PAYMENT_STATUS_PAID = 1;

    /** 已取消 */
    const PAYMENT_STATUS_CANCELLED = 2;


    const REFUND_STATUS_PENDING = 0;

    /** 申请退款 */
    const REFUND_STATUS_APPLY_REFUNDED = 1;

    /** 退款成功 */
    const REFUND_STATUS_REFUNDED_SUCCESS = 2;

    /** 退款失败 */
    const REFUND_STATUS_REFUNDED_FAILED = 3;

    /** 售后关闭 */
    const REFUND_STATUS_REFUNDED_CLOSED = 4;

    /** 退款中 */
    const PAYMENT_STATUS_REFUNDED_PENDING = 6;

    /** 无 */
    const LOGISTICS_STATUS_PENDING = 0;

    /** 待发货 */
    const LOGISTICS_STATUS_DELIVERING = 1;

    /** 待收货 */
    const LOGISTICS_STATUS_RECEIVING = 2;

    /** 已收货 */
    const LOGISTICS_STATUS_FINISHED = 3;

    //订单状态
    const PAY_LOGISTICS_STATUS = [
        '0-0' => 1, // 待支付
        '1-1' => 2, // 待发货
        '1-2' => 3, // 待收货
        '1-3' => 4, // 已完成
        '2-0' => 5, // 已取消
        '2-1' => 5, // 已取消
    ];
}