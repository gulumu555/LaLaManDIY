<?php

namespace app\utils\constants;

class BalanceConstants
{

    /** 消费提成 */
    const BALANCE_TYPE_COMMISSION = 1;

    /** 提现成功 */
    const BALANCE_TYPE_WITHDRAW_SUCCESS = 2;

    /** 提现失败 */
    const BALANCE_TYPE_WITHDRAW_FAIL = 3;

    /** 购买服务消费 */
    const BALANCE_TYPE_DEDUCTION = 4;

    /** 打印消费 */
    const BALANCE_TYPE_PRINT = 5;

    /** 退款 */
    const BALANCE_TYPE_REFUND = 6;

    /** 订单取消 */
    const BALANCE_TYPE_RETURN = 7;

    /** 消费退款 */
    const BALANCE_TYPE_COMMISSION_FAIL = 8;
}