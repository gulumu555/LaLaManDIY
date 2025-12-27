<?php

namespace app\process;

use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\utils\constants\OrderConstants;
use app\utils\DateTool;
use support\App;
use support\Log;
use think\facade\Db;
use Workerman\Crontab\Crontab;

class OrderUpdate
{
    // 新增版本标识属性
    private static $version = '1.0.0';

    public function onWorkerStart()
    {
        // 每天的0点30执行一次，确认收货

        //Log::info("OrderUpdate进程启动，版本号：" . self::$version);

        //凌晨 0时0分
        new Crontab('0 0 * * *', function () {
            self::closeOrder();
        });

        //凌晨 1时0分
        new Crontab('0 1 * * *', function () {
            self::cancelOrder();
        });
    }

    public static function getOrders($where, $field)
    {
        return OrdersModel::where($where)->field($field)->select();
    }

    public static function getTimes($field)
    {
        $time = date('Y-m-d H:i:s');

        $config_time = DateTool::maxConfigTime($field);

        return [$time, $config_time];
    }

    /**
     * 订单关闭
     * @return void
     * @throws \Exception
     */
    public static function closeOrder()
    {

        $Orders = self::getOrders([
            ['payment_status', '=', OrderConstants::PAYMENT_STATUS_PAID],
            ['logistics_status', '=', OrderConstants::LOGISTICS_STATUS_RECEIVING]
        ], 'id,shipping_time,logistics_status,payment_status');

        list($time, $config_time)  = self::getTimes('confirm_receipt');

        //Log::info('$config_time'.$config_time);
        Db::startTrans();
        try {

            foreach ($Orders as $Order) {
                if (DateTool::calculateDiffTime($time, $Order->shipping_time) <= $config_time) continue;

                OrdersModel::update([
                    'id' => $Order->id,
                    'logistics_status' => OrderConstants::LOGISTICS_STATUS_FINISHED,
                    'after_time' => $time
                ]);
            }

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            Log::channel('test')->info('自动收货脚本异常:' . $e->getMessage());
            abort($e->getMessage());
        }
    }

    /**
     * 订单取消
     * @return void
     */
    public static function cancelOrder()
    {
        $time = date('Y-m-d H:i:s');

        $Orders = self::getOrders([
            ['payment_status', '=', OrderConstants::PAYMENT_STATUS_PENDING],
        ], 'id,create_time,payment_status,order_type');

        $buy_time = 1800;
        $print_time = 1800;
        Db::startTrans();
        try {

            foreach ($Orders as $Order) {

                if (($Order->order_type == OrderConstants::ORDER_TYPE_BUY && DateTool::calculateDiffTime($time, $Order->create_time) <= $buy_time) || (
                    $Order->order_type == OrderConstants::ORDER_TYPE_PRINT && DateTool::calculateDiffTime($time, $Order->create_time) <= $print_time
                    )) continue;

                OrdersModel::update([
                    'id' => $Order->id,
                    'payment_status' => OrderConstants::PAYMENT_STATUS_CANCELLED,
                ]);

                $payment = PaymentsModel::where('order_id', $Order->id)->find();
                if ($payment) {
                    PaymentsModel::update([
                        'id' => $payment->id,
                        'status' => OrderConstants::PAYMENT_STATUS_CANCELLED,
                    ]);
                }

            }

            Db::commit();
        } catch (\Exception $e) {

            Db::rollback();
            Log::channel('test')->info('取消订单脚本异常:' . $e->getMessage());
            abort($e->getMessage());
        }
    }
}