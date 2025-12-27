<?php
namespace app\common\logic;

use app\common\model\TransferOrderModel;
use app\common\model\UserModel;
use app\common\model\WithdrawOrderModel;
use app\common\validate\WithdrawOrderValidate;
use app\utils\constants\BalanceConstants;
use app\utils\Pays;
use app\utils\WechatV3Transfer;
use support\Log;
use taoser\Validate;
use think\db\Query;
use think\facade\Db;

/**
 * 提现记录 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class WithdrawOrderLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
    public static function getList(array $params = [], $orderBy = ''): array|\think\Collection|\think\Paginator
    {
        // 排序
        $orderBy = $orderBy ?:"status desc";
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

        $list = WithdrawOrderModel::with(['UserBindName', 'transferOrder' => function (Query $query) {
//            $query->where('status', '<', 2);
        }])
            ->hasWhere('UserBindName', $has_where)
           // ->withSearch([ '.status', 'user_id'], $params)
            ->order($orderBy);

        if (!empty($params['user_id'])) {
            $where[] = ['WithdrawOrderModel.user_id', '=', $params['user_id']];
        }
        if (!empty(isset($params['status'])) && $params['status']!== '') {
            $where[] = ['WithdrawOrderModel.status', '=', $params['status']];
        }

        $list = $list->where($where);

        $statistic = [
            'total' => (clone $list)->where('status','!=', 2)->sum('amount'),
        ];

        $list = $list->paginate($params['pageSize'] ?? 20)->each(function ($item) {
            $transfer = $item['transferOrder'] ?? [
                'status' => 0,
                'remark' => ''
            ];
            $examine = [
                '审核中',
                '审核通过',
                '审核拒绝'
            ];

            $desc = [
                '审核通过',
                '提现成功',
                '提现失败'
            ];

            $item['show_confirm'] = isset($item['transferOrder']['status']) && $item['transferOrder']['status'] != 1 ? 1 : 0;

            $item['status_desc'] = $item['status'] != 1 ? $examine[$item['status']] : (
                $desc[$transfer['status']] ?? ''
            );

            $item['remark'] =  $item['remark'] ?: $transfer['remark'];

//            unset($item['transferOrder']);
            return $item;
        })->toArray();

        return array_merge( $list, ['statistic' => $statistic]);
    }

    /**
     * 提现
     * @param array $params
     * @return void
     */
    public static function withdraw(array $params)
    {
        Db::startTrans();
        try {
            Validate(WithdrawOrderValidate::class)->scene('withdraw')->check($params);

            UserLogic::balanceUpdate([
                'id' => $params['user_id'],
                'balance' => Db::raw('balance - '. $params['amount']),
                'balance_freeze' => Db::raw('balance_freeze + '. $params['amount']),
            ]);

            WithdrawOrderModel::create([
                'user_id' => $params['user_id'],
                'amount' => $params['amount'],
                'channel' => 'wx',
                'wx_id' => $params['wx_id'],
                'status' => 0
            ]);

            Db::commit();
        }catch (\Exception $e){
            Db::rollback();

            abort($e->getMessage());
        }
    }

    public static function findData(int $id)
    {
        return WithdrawOrderModel::find($id);
    }

    /**
     * 提现审核
     * @param array $params
     * @return void
     * @throws \Exception
     */
    public static function updateStatus(array $params): void
    {
        Db::startTrans();
        try {
            Validate(WithdrawOrderValidate::class)->scene('examine')->check($params);

            $ids = is_array($params['id']) ? $params['id'] : [$params['id']];

            $status = $params['status'];
            $remark = $params['remark'] ?? '';

            foreach ($ids as $id) {
                $withdrawOrder = WithdrawOrderModel::with('User')->find($id);

                WithdrawOrderModel::update([
                    'id' => $id,
                    'status' => $status,
                    'remark' => $remark
                ]);

                $user_id = $withdrawOrder->user_id;
                $amount = $withdrawOrder->amount;

                $update_data = [
                    'id' => $user_id,
                    'balance_freeze' => Db::raw('balance_freeze - '. $amount),
                ];

                if ($status == 2) {
                    $update_data['balance'] = Db::raw('balance + ' . $amount);
                }

                UserLogic::balanceUpdate($update_data);

                BalanceLogic::balanceLog([
                    'user_id' => $user_id,
                    'amount' => $amount,
                    'status' => 1,
                    'type' => ($status == 1 ? BalanceConstants::BALANCE_TYPE_WITHDRAW_SUCCESS : BalanceConstants::BALANCE_TYPE_WITHDRAW_FAIL)
                ]);

                if ($status == 1) {

                    self::createTransfer($withdrawOrder);
                }
            }

            //TODO:提现成功发红包
//            if ($status == 1) {
//                Pays::wechatTransfer($result);
//            }

            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            abort($e->getMessage());
        }
    }

    private static function createTransfer($withdrawOrder)
    {
        $out_bill_no = get_order_no('T');
        $result = WechatV3Transfer::transfer($withdrawOrder->User->openid, $withdrawOrder->amount, $out_bill_no);

        $transfer_order = [
            'user_id' => $withdrawOrder->user_id,
            'withdraw_order_id' => $withdrawOrder->id,
            'out_bill_no' => $out_bill_no,
            'status' => 0,
            'amount' => $withdrawOrder->amount,
            'package_info' => json_encode($result)
        ];
        TransferOrderModel::create($transfer_order);

        return $result;
    }

    public static function getPackageInfo($id)
    {
        try {
            $obj = TransferOrderModel::with('userBind')->where('withdraw_order_id', $id)->find()->toArray();

            $result = WechatV3Transfer::search($obj['out_bill_no']);

            if ($result['state'] == 'WAIT_USER_CONFIRM') {
                $package = json_decode($obj['package_info']['scalar'], true);
                $package_info = $package['package_info'];

            } else {

                $out_bill_no = get_order_no('T');
                $result = WechatV3Transfer::transfer($obj['openid'], $obj['amount'], $out_bill_no);

                $package_info = $result['package_info'];
                TransferOrderModel::update([
                    'id' => $obj['id'],
                    'out_bill_no' => $out_bill_no,
                    'package_info' => json_encode($result)
                ]);
            }

            return [
                'mchId' => config('superadminx.wechat_pay.mch_id'),
                'appId' => config('superadminx.wechat_xiaochengxu.AppID'),
                'package' => $package_info,
            ];
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
    }


    public static function notify()
    {
        try {
            $notify =  Pays::wechatNotify();
            Log::channel('transfer')->info('回调解析结果', $notify);

            $obj = TransferOrderModel::where('out_bill_no', $notify['out_bill_no'])->find();
            if ($obj) {
                TransferOrderModel::update([
                    'id' => $obj['id'],
                    'status' => 1,
                    'remark' => $notify['fail_reason'] ?? '',
                ]);
            }
        }catch (\Exception $e){
            Log::channel('transfer')->info('回调错误：' . $e->getMessage());
            abort($e->getMessage());
        }

    }
}