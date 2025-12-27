<?php

namespace app\process;

use app\admin\logic\ConfigLogic;
use app\common\logic\UserLogic;
use app\common\model\OrdersModel;
use app\common\model\UserBalanceLogModel;
use app\common\model\UserModel;
use app\utils\constants\OrderConstants;
use app\utils\DateTool;
use support\Log;
use think\facade\Db;
use Workerman\Crontab\Crontab;

class FreezeBalance
{
        // 新增版本标识属性
    private static $version = '1.0.3';
    
    public function onWorkerStart()
    {
        // 每天的0点1执行一次，解冻超过10天的佣金
        //Log::info("FreezeBalance进程启动，版本号：" . self::$version);

        //每天凌晨 0时30分
        new Crontab('30 0 * * *', function () {
            self::freezeBalance();
        });
    }


    public static function freezeBalance()
    {

        $Balances = UserBalanceLogModel::where('status', 0)->cursor();

        $time = date('Y-m-d H:i:s');
        $config_time = DateTool::maxConfigTime('commission_frozen');

        Db::startTrans();
        try {
            foreach ($Balances as $Balance) {
                if (DateTool::calculateDiffTime($time, $Balance->create_time) <= $config_time) continue;
                $Order = OrdersModel::find($Balance->order_id);

                if ($Order && $Order->order_type == OrderConstants::ORDER_TYPE_PRINT  && (in_array($Order->refund_status, [OrderConstants::REFUND_STATUS_APPLY_REFUNDED, OrderConstants::REFUND_STATUS_REFUNDED_FAILED])  || (
                        $Order->refund_status == OrderConstants::REFUND_STATUS_PENDING && $Order->logistics_status != OrderConstants::LOGISTICS_STATUS_FINISHED
                    ))) continue;

                UserBalanceLogModel::update([
                    'id' => $Balance->id,
                    'type' => $Balance->type,
                    'status' => 2,
                ]);

                UserLogic::balanceUpdate([
                        'id' => $Balance->user_id,
                        'balance' => Db::raw('balance + '. $Balance->amount),
                        'balance_freeze' => Db::raw('balance_freeze - '. $Balance->amount),
                ]);
            }

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            Log::channel('test')->info('解冻脚本异常:' . $e->getMessage());
            abort($e->getMessage());
        }
    }
}