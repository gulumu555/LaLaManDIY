<?php
namespace app\common\logic;


use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\utils\constants\OrderConstants;
use support\Log;
use think\db\exception\DbException;
use think\db\Query;
use think\facade\Db;
use think\Paginator;
use Workerman\Worker;

/**
 * 充值订单 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PaymentsLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @return Paginator
     * @throws DbException
     */
    public static function getList(array $params = [])
    {
        // 排序
        $orderBy = "id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
            $orderBy = "{$params['orderBy']},{$orderBy}";
        }


        $params['order_type'] = OrderConstants::ORDER_TYPE_BUY;
        $list = OrdersModel::with(['PaymentsBind', 'UserBind'])
            ->withSearch(['order_type','order_count', 'user_id', 'payment_type', 'payment_status'], $params)
            ->withJoin(['UserBind' => function ($query)  use ($params) {
                if (isset($params['tel']) && $params['tel']) {
                    $query->where(['tel' => $params['tel']]);
                }
            }])

            ->order($orderBy);

        return $list->paginate($params['pageSize'] ?? 20);
    }

    public static function cancel($data)
    {
        Db::startTrans();
        try {
            Validate(PaymentsValidate::class)->check($data);

            PaymentsModel::where('order_id', $data['order_id'])->update(['payment_status' => OrderConstants::PAYMENT_STATUS_CANCELLED]);
            OrdersModel::where('id', $data['order_id'])->update(['order_status' => OrderConstants::PAYMENT_STATUS_CANCELLED]);

            Db::commit();
        }catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }


}