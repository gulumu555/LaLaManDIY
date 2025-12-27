<?php

namespace app\api\logic;

use app\common\logic\BalanceLogic;
use app\common\logic\UserLogic;
use app\common\model\OrderRefundModel;
use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\common\model\ProductModel;
use app\common\model\ProductSpecModel;
use app\utils\constants\OrderConstants;
use app\utils\constants\BalanceConstants;
use think\facade\Db;

class OrderRefundLogic
{
    public static function cancel($order_id)
    {
        Db::startTrans();
        try {
            $order = OrdersModel::where('id', $order_id)->find();
            if (!$order) throw new \Exception('订单不存在');
            if ($order->refund_status == OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS) throw new \Exception('订单已退款');

            OrdersModel::update([
                'id' => $order_id,
                'refund_status' => OrderConstants::REFUND_STATUS_PENDING,
            ]);

            //删除售后申请记录
            OrderRefundModel::where('order_id', $order_id)->delete();
            Db::commit();
        }catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }
}