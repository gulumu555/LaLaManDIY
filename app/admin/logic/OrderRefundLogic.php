<?php
namespace app\admin\logic;

use app\common\logic\BalanceLogic;
use app\common\logic\UserLogic;
use app\common\model\OrderRefundModel;
use app\admin\validate\OrderRefundValidate;
use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\common\model\UserBalanceLogModel;
use app\utils\constants\BalanceConstants;
use app\utils\constants\OrderConstants;
use app\utils\Pays;
use app\utils\RedisServer;
use support\Log;
use think\facade\Db;

/**
 * 退款信息 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class OrderRefundLogic
{



    /**
     * 获取数据
     * @param int $id 数据id
     */
    public static function findData(int $id)
    {
        return OrderRefundModel::where('order_id', $id)->find();
    }




    /**
     * 退款
     */
    public static function updateStatus($params)
    {
        Db::startTrans();
        try {
            Validate(OrderRefundValidate::class)->check($params);

            $order_refund_no = $params['examine_status'] == OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS ? get_order_no('R') : '';
            OrderRefundModel::where('order_id', $params['order_id'])->update([
                'out_refund_no' => $order_refund_no,
                'examine_status' => $params['examine_status'],
                'examine_time'   => date('Y-m-d H:i:s'),
                'refund_amount' => $params['refund_amount'],
                'wx_amount' => $params['wx_amount'],
                'balance_amount' => $params['balance_amount'],
                'remark' => $params['remark'],
            ]);


            $Order = OrdersModel::where('id', $params['order_id'])->find();
            $Order->refund_status = $params['examine_status'];
            $Order->save();


            if ($params['examine_status'] == OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS) {
                if ($params['balance_amount'] > 0) {
                    UserLogic::balanceUpdate([
                        'id' => $Order->user_id,
                        'balance' => Db::raw('balance + '. $params['balance_amount']),
                    ]);

                    BalanceLogic::balanceLog([
                        'user_id' => $Order->user_id,
                        'type' => BalanceConstants::BALANCE_TYPE_REFUND,
                        'amount' => $params['balance_amount'],
                        'order_id' => $Order->id,
                    ]);


                }

                if ($params['wx_amount'] > 0) {
                    $Payment = PaymentsModel::where('order_id', $params['order_id'])->find();
                    Pays::wechatRefund($Payment->transaction_id, (float)$params['wx_amount'], (float)$Order->payment_amount, $order_refund_no);

                    BalanceLogic::cancelCommission($Order->id, $params['wx_amount']);
                }

            }

            Db::commit();


        } catch (\Exception $e) {
            Db::rollback();
            Log::channel('test')->info('提现审核失败:' . $e->getMessage());
            abort($e->getMessage());
        }
    }

    public static function notify()
    {
        try {
            $data = Pays::wechatNotify();

            //todo:: 微信退款回调
            return true;
        }catch (\Exception $e){
            return false;
        }
    }


}