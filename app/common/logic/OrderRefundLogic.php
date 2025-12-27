<?php

namespace app\common\logic;

use app\api\validate\OrderRefundValidate;
use app\common\model\OrderRefundModel;
use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\utils\constants\OrderConstants;
use think\facade\Db;

class OrderRefundLogic
{

    /**
     * 发起退款申请
     * @param array $params
     * @return void
     * @throws \Exception
     */
    public static function refund(array $params)
    {
        Db::startTrans();
        try {
            Validate(OrderRefundValidate::class)->check($params);

            $obj = OrdersModel::where('id', $params['id'])->find();

            $refund_amount = $params['refund_amount'];
            $wx_amount = min($obj->payment_amount, $refund_amount);

            $remain_amount = $refund_amount - $wx_amount;
            $balance_amount = $remain_amount > 0 ? min($remain_amount, $obj->balance_amount) : 0;

            $params['wx_amount'] = $wx_amount;
            $params['balance_amount'] = $balance_amount;

            OrdersModel::update([
                'id' => $params['id'],
                'refund_status' => OrderConstants::REFUND_STATUS_APPLY_REFUNDED
            ]);

            $refund = OrderRefundModel::where('order_id', $params['id'])->find();

            $update_data = [
                'order_id' => $params['id'],
                'refund_amount' => $params['refund_amount'],
                'wx_amount' => $params['wx_amount'],
                'balance_amount' => $params['balance_amount'],
                'reason' => $params['reason'] ?? '',
                'file' => $params['file'],
                'examine_status' => OrderConstants::REFUND_STATUS_APPLY_REFUNDED
            ];
            if (!$refund) {
                OrderRefundModel::create($update_data);
            } else {
                $update_data['id'] = $refund->id;
                OrderRefundModel::update($update_data);
            }

            Db::commit();
        }catch (\Exception $e){
            Db::rollback();

            abort($e->getMessage());
        }
    }

    public static function refundInfo(int $id)
    {
        return OrderRefundModel::with(['orderItemsBind', 'OrdersBind'])->where('order_id', $id)->find();
    }
}