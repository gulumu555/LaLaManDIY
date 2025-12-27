<?php
namespace app\common\logic;

use app\common\model\UserBalanceLogModel;
use app\common\model\UserModel;
use app\utils\constants\BalanceConstants;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;
use think\db\Query;
use think\facade\Db;
use think\model\contract\Modelable;

/**
 * 佣金明细 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class BalanceLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * @return array|Query[]
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    public static function getList(array $params = [])
    {
        // 排序
        $orderBy = "id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
            $orderBy = "{$params['orderBy']},{$orderBy}";
        }

        $has_where = $where = [];
        if (!empty($params['nickname'])) {
            $has_where[] = ['nickname', 'like', "%{$params['nickname']}%"];
        }
        if (!empty($params['tel'])) {
            $has_where[] = ['tel', 'like', "%{$params['tel']}%"];
        }
        if (isset($params['status'])) {
            $status = $params['status'] == '1' ? [1,2] : [0];
            $where[] = ['UserBalanceLogModel.status', 'in', $status];
        }

        $list = UserBalanceLogModel::with(['UserBindName', 'OrderBind'])
            ->withSearch([ 'type', 'user_id'], $params)
            ->hasWhere('UserBindName', $has_where)
            ->where($where)
            ->order($orderBy);

        $users = Db::name('user');

        if (!empty($params['user_id'])) {
            $users->whereIn('id', $params['user_id']);
        }
        $total_amount = $users
        ->value("SUM(IFNULL(balance, 0) + IFNULL(balance_freeze, 0))");


        $use1 = (clone  $list)->whereIn('type', [2,4,5])->sum('amount');
        $use2 =  (clone  $list)->whereIn('type', [3,6,7])->sum('amount');
        $statistic = [
//            'total' => number_format((clone  $list)
//                ->whereIn('type', [1,3,6,7,8])
//                ->whereIn('UserBalanceLogModel.status', [1,2])
//                ->whereOr(function (Query $query) {
//                $query->where('type', 1)->where('UserBalanceLogModel.status', 1);
//            })
//                ->sum('amount'), 2),
            'total' => number_format($total_amount, 2, '.', ''),
            'freeze' => number_format((clone  $list)->where('UserBalanceLogModel.status', 0)->sum('amount'), 2),
            'used' => number_format($use1 - $use2,2),
        ];
        $listObj =  $list->paginate($params['pageSize'] ?? 20)->each(function ($item) {
            $item['commission_type'] = in_array($item['type'],
                [
                    BalanceConstants::BALANCE_TYPE_COMMISSION,
                    BalanceConstants::BALANCE_TYPE_WITHDRAW_FAIL,
                    BalanceConstants::BALANCE_TYPE_REFUND,
                    BalanceConstants::BALANCE_TYPE_RETURN
                    ]) ? 1 : 0;

            $order_type = $item['order_type'] ?? 1;
            $item['order_id'] = $order_type == 2 ? $item['order_id'] : '';
            return $item;
        });


        return array_merge($listObj->toArray(), ['statistic' => $statistic]);
    }


    /***
     * 佣金明细流水
     * @param array $params
     * @return Modelable|UserBalanceLogModel
     */
    public static function balanceLog(array $params = []): Modelable|UserBalanceLogModel
    {
        $params['status'] = $params['status'] ?? 1;
        return UserBalanceLogModel::create($params);
    }

    /**
     * 订单发起退款，撤销佣金
     * @param $order_id
     * @param $amount
     * @return UserModel|Modelable|void
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    public static function cancelCommission($order_id, $amount)
    {
       $obj = UserBalanceLogModel::where([
           'type' => BalanceConstants::BALANCE_TYPE_COMMISSION,
           'status' => 0,
           'order_id' => $order_id,
       ])->find();
       if (!$obj) return ;

       $user_data = [
           'id' => $obj->user_id,
       ];

        $user_data['balance_freeze'] = Db::raw('balance_freeze - ' . $obj->amount);
        UserBalanceLogModel::update([
            'id' => $obj->id,
            'status' => 2,
            'type' => $obj->type,
            'order_id' => $obj->order_id,
            'amount' => $obj->amount
        ]);

        self::balanceLog([
            'user_id' => $obj->user_id,
            'order_id' => $order_id,
            'amount' => $obj->amount,
            'type' => BalanceConstants::BALANCE_TYPE_COMMISSION_FAIL,
        ]);

       //TODO: 增加佣金解冻前必须收货或者已退款
       /*else {
           $user_data['balance'] = Db::raw('balance - ' . $amount);
           self::balanceLog([
               'user_id' => $obj->user_id,
               'type' => BalanceConstants::BALANCE_TYPE_RETURN,
               'order_id' => $order_id,
               'amount' => $amount,
               'status' => 1,
           ]);
       }*/

       return UserLogic::balanceUpdate($user_data);
    }


}