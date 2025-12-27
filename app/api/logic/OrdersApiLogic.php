<?php

namespace app\api\logic;

use app\admin\logic\ConfigLogic;
use app\api\validate\OrderRefundValidate;
use app\api\validate\OrdersValidate;
use app\common\logic\BalanceLogic;
use app\common\logic\OrderRefundLogic;
use app\common\logic\UserLogic;
use app\common\model\CategoryModel;
use app\common\model\OrderItemsModel;
use app\common\model\OrderRefundModel;
use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\common\model\PhotoOrderModel;
use app\common\model\ProductModel;
use app\common\model\ProductSpecModel;
use app\common\model\UserAddressModel;
use app\common\model\UserModel;
use app\utils\constants\OrderConstants;
use app\utils\constants\BalanceConstants;
use app\utils\Pays;
use app\utils\RedisServer;
use app\utils\SeedDream4;
use support\Log;
use taoser\Validate;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;
use think\Exception;
use think\facade\Db;
use think\model\contract\Modelable;
use Yansongda\Artful\Rocket;
use Yansongda\Supports\Collection;

class OrdersApiLogic
{

    /**
     * 创建订单
     * @param array $params
     * @throws \Exception
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            $is_order_buy = $params['order_type'] == OrderConstants::ORDER_TYPE_BUY;

            self::validateParams($params, $is_order_buy);

            list($need_wx_pay, $params) = self::prepareOrderParams($params, $is_order_buy);

            if (!$is_order_buy) {
                $Address = UserAddressModel::with(['RegionCounty'])->findOrEmpty($params['address_id'])->toArray();
                $params['address'] =  $Address['name'] . "," . $Address['phone'] . "," . $Address['pid_path_title'] . "," . $Address['address'];
            }

            if (!$is_order_buy) {
                preg_match('/photo_order_ai_img_(\d+)/', $params['result_image'], $matches);
                $params['photo_order_id'] = $matches[1];

            }
            $PhotoOrder = PhotoOrderModel::findOrEmpty($params['photo_order_id']);
            $params['original_image'] = $PhotoOrder['original_img'];

            $Orders = OrdersModel::create($params);

            self::createPayment($params, $Orders->id);

            $OrderItems = null;
            if (!$is_order_buy) {
                $OrderItems = self::createOrderItems($Orders->id, $params);
                self::updateProductStockAndSales($Orders);
            }

            if ($params['balance_amount'] > 0) {
                self::updateUserBalance($params, $Orders->id, $is_order_buy);
            }

            if ($params['payment_status'] == OrderConstants::PAYMENT_STATUS_PAID && $is_order_buy) {
                UserLogic::balanceUpdate([
                    'id' => $Orders->user_id,
                    'num_balance' => Db::raw('num_balance + '. $Orders->order_count)
                ]);
            }

            Db::commit();

            if ($need_wx_pay) {
                return self::initiateWechatPayment($Orders, $params['openid']);
            } else {
                self::pushMultiFace($OrderItems);
                return  [];
            }
        } catch (\Exception $e) {
            Db::rollback();

            Log::channel('pay')->error('创建订单失败:' . $e->getMessage(), $params);
            abort($e->getMessage());
        }
    }

    protected static function pushMultiFace($OrderItems = null)
    {
        if (!empty($OrderItems) ) {
            $category_type = CategoryModel::where('id', $OrderItems->cate_id)->value('product_type');
            $redis = RedisServer::app();

            if ($category_type == 3) {
                $redis_data = [
                    'id' => $OrderItems->id,
                    'result_image' => $OrderItems->original_image
                ];
                $redis->rpush('multi_face_queue', json_encode($redis_data));
            }
            if (in_array($category_type, [1,2])) {
                SeedDream4::imageX2($OrderItems->original_image, $OrderItems->id);
//                $redis_data = [
//                    'id' => $OrderItems->id,
//                    'result_image' => $OrderItems->original_image
//                ];
//                $redis->rpush('poster_precision_enhancement', json_encode($redis_data));
            }
        }
    }

    /**
     * 验证参数
     * @param array $params
     * @param bool $is_order_buy
     */
    private static function validateParams(array $params, bool $is_order_buy): void
    {
        Validate(OrdersValidate::class)->scene($is_order_buy ? 'service' : 'print')->check($params);
    }

    /**
     * 准备订单参数
     * @param array $params 订单参数
     * @param bool $is_order_buy 是否是充值订单
     * @return array
     */
    private static function prepareOrderParams(array $params, bool $is_order_buy): array
    {
        global $OrderProduct;

        $user = request()->user ?? UserModel::find($params['user_id']);

        $params['total_amount'] = $is_order_buy ? $OrderProduct['service_product']['price'] : ($OrderProduct['product_spec']['price_adjustment'] * 1);
        $params['balance_amount'] = min($params['total_amount'], $user->balance, $params['balance_amount']);
        $params['payment_amount'] = $params['total_amount'] - $params['balance_amount'];

        $need_wx_pay = $params['payment_amount'] > 0;

        $params['payment_type'] = ($params['balance_amount'] > 0) ? (
        $params['payment_amount'] > 0 ? 3 : 2
        ) : 1;

        $params['order_no'] = get_order_no();
        $params['payment_status'] = $need_wx_pay ? OrderConstants::PAYMENT_STATUS_PENDING : OrderConstants::PAYMENT_STATUS_PAID;
        $params['payment_time'] = $need_wx_pay ? null : date('Y-m-d H:i:s');
        $params['logistics_status'] = !$is_order_buy && !$need_wx_pay ? OrderConstants::LOGISTICS_STATUS_DELIVERING : OrderConstants::LOGISTICS_STATUS_PENDING;
        return [$need_wx_pay, $params];
    }

    /**
     * 创建支付记录
     * @param array $params
     * @return PaymentsModel|Modelable
     */
    public static function createPayment(array $params, $order_id): Modelable|PaymentsModel
    {
        return PaymentsModel::create([
            'user_id' => $params['user_id'],
            'order_id' => $order_id,
            'payment_amount' => $params['payment_amount'],
            'payment_type' => $params['payment_type'],
            'payment_status' => $params['payment_status'],
            'payment_time' => $params['payment_time'],
        ]);
    }

    /**
     * 创建订单商品
     * @param $order_id
     * @param $params
     * @return OrderItemsModel|Modelable
     */
    public static function createOrderItems($order_id, $params): Modelable|OrderItemsModel
    {
        global $OrderProduct;

        $product = $OrderProduct['product'];
        $product_spec = $OrderProduct['product_spec'];




        return OrderItemsModel::create([
            'order_id' => $order_id,
            'product_id' => $product['id'],
            'product_spec_id' => $product_spec['id'],
            'cate_id' => $product['cate_id'],
            'product_name' => $product['product_name'],
            'product_image' => $product['main_image'],
            'spec' => $product_spec['spec_name'],
            'price' => $product_spec['price_adjustment'],
            'num' => $params['num'],
            'total_price' => $product_spec['price_adjustment'] * $params['num'],
            'original_image' => $params['original_image'] ?? '',
            'result_image' => $params['result_image'] ?? '',
            'ai_model' => '',
        ]);
    }

    /**
     * 创建订单商品
     * @param $Orders
     * @return void
     */
    private static function updateProductStockAndSales($Orders): void
    {
        ProductModel::update([
            'id' => $Orders->product_id,
            'sales' => Db::raw('sales + ' . $Orders->num),
            'stock' => Db::raw('stock - ' . $Orders->num),
        ]);

        ProductSpecModel::update([
            'id' => $Orders->product_spec_id,
            //'sales' => Db::raw('sales + ' . $Orders->num),
            'stock' => Db::raw('stock - ' . $Orders->num),
        ]);
    }

    /**
     * @param array $params
     * @param int $orderId
     * @param bool $is_order_buy
     * @return void
     */
    private static function updateUserBalance(array $params, int $orderId, bool $is_order_buy): void
    {
        UserLogic::balanceUpdate([
            'id' => $params['user_id'],
            'balance' => Db::raw('balance - ' . $params['balance_amount']),
        ]);

        BalanceLogic::balanceLog([
            'user_id' => $params['user_id'],
            'amount' => $params['balance_amount'],
            'type' => $is_order_buy ? BalanceConstants::BALANCE_TYPE_DEDUCTION : BalanceConstants::BALANCE_TYPE_PRINT,
            'order_id' => $orderId
        ]);
    }

    /**
     * 获取拉起微信支付预会话标识
     * @param $Orders
     * @param $openid
     * @return Rocket|Collection
     */
    public static function initiateWechatPayment($Orders, $openid)
    {

        $data = [
            'out_trade_no' => $Orders->order_no,
            'description'  => ($Orders->order_type == OrderConstants::ORDER_TYPE_BUY ? '充值' : '购买') . '商品',
            'amount' => [
                'total' => intval($Orders->payment_amount * 100),
                'currency' => 'CNY'
            ],
            'attach' => "order_id={$Orders->id}",
            'payer' => [
                'openid' => $openid,
            ]
        ];

        Log::channel('pay')->info('支付参数', $data);
        return Pays::wechatMiniPay($data);
    }

    /**
     * 重新支付
     * @param $id
     * @return void|Rocket|Collection
     * @throws \Exception
     */
    public static function rePay($id)
    {
        try {
            $Orders = OrdersModel::with(['User', 'OrderItemsBind'])->where('id', $id)->find();
            if (!$Orders) throw new Exception('not exist');

            //发起微信支付
            return self::initiateWechatPayment($Orders, $Orders['User']['openid']);
        }catch (\Exception $e){
            abort($e->getMessage());
        }
    }


    /**
     * 微信支付回调
     * @return void
     * @throws \Exception
     */
    public static function notify()
    {
        Db::startTrans();
        try {
            $notify = Pays::wechatNotify();
            Log::channel('notify')->info('回调解析:' .json_encode($notify));
            $order_id = self::extractOrderIdFromNotify($notify);

            if ($notify['trade_state'] == 'SUCCESS' && $order_id) {
                $pay_time = self::parsePaymentTime($notify);
                $order = self::findOrderById($order_id);

                self::updateOrderStatus($order, $pay_time);
                self::updatePaymentStatus($order, $notify, $pay_time);
                self::handleParentDistribution($order);
            }

            Db::commit();

            $OrderItems = OrderItemsModel::where('order_id', $order_id)->find();
            self::pushMultiFace($OrderItems);

        } catch (\Exception $e) {
            Db::rollback();

            Log::channel('notify')->info('notify_error:' . $e->getMessage());
            abort($e->getMessage());
        }
    }

    /**
     * 从回调参数中提取订单 ID
     * @param array $notify 回调参数
     * @return int 订单 ID
     */
    private static function extractOrderIdFromNotify(array $notify): int
    {
        return explode('=', $notify['attach'])[1] ?? 0;
    }

    /**
     * 解析支付时间
     * @param array $notify 回调参数
     * @return string 支付时间
     */
    private static function parsePaymentTime(array $notify): string
    {
        return date('Y-m-d H:i:s', strtotime($notify['success_time']));
    }

    /**
     * 根据订单 ID 查找订单
     * @param int $order_id
     * @return mixed 订单对象
     * @throws \Exception
     */
    private static function findOrderById(int $order_id): mixed
    {
        $order = OrdersModel::with(['OrderItemsBind'])->where('id', $order_id)->find();
        if (!$order) {
            throw new \Exception('not exist:');
        }
        return $order;
    }

    /**
     * 更新订单状态
     * @param $order
     * @param string $pay_time
     */
    private static function updateOrderStatus($order, string $pay_time): void
    {
        $update = [
            'id' => $order->id,
            'payment_status' => OrderConstants::PAYMENT_STATUS_PAID,
            'payment_time' => $pay_time,
        ];

        if ($order->order_type == OrderConstants::ORDER_TYPE_PRINT) {
            $update['logistics_status'] = OrderConstants::LOGISTICS_STATUS_DELIVERING;
        } else {
            UserLogic::balanceUpdate([
                'id' => $order->user_id,
                'num_balance' => Db::raw('num_balance + '. $order->order_count)
            ]);
        }

        OrdersModel::update($update);
    }

    /**
     * 更新支付记录状态
     * @param  $order
     * @param array $notify 回调参数
     * @param string $payTime 支付时间
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    private static function updatePaymentStatus($order, array $notify, string $payTime): void
    {
        $payment = PaymentsModel::where('order_id', $order->id)->find();

        PaymentsModel::update([
            'id' => $payment->id,
            'payment_status' => OrderConstants::PAYMENT_STATUS_PAID,
            'transaction_id' => $notify['transaction_id'],
            'payment_time' => $payTime,
        ]);
    }

    /**
     * 处理父级分销
     * @param  $order
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    private static function handleParentDistribution($order): void
    {
        $user = UserModel::where('id', $order->user_id)->find();

        if ($user && $user->pid > 0) {
            $config = ConfigLogic::getConfig();
            if (!empty($config['commission_rate'])) {
                $amount = $order->payment_amount * $config['commission_rate'];
                //$amount = $order->total_amount * $config['commission_rate'];
                UserLogic::balanceUpdate([
                    'id' => $user->pid,
                    'balance_freeze' => Db::raw('balance_freeze + ' . $amount),
                ]);

                BalanceLogic::balanceLog([
                    'user_id' => $user->pid,
                    'amount' => $amount,
                    'order_id' => $order->id,
                    'type' => BalanceConstants::BALANCE_TYPE_COMMISSION,
                    'status' => 0
                ]);
            }
        }
    }

    public static function confirm($id)
    {
        $order = OrdersModel::where('id', $id)->find();
        if (!$order) {
            abort('订单不存在');
        }

        OrdersModel::update([
            'id' => $order->id,
            'logistics_status' => OrderConstants::LOGISTICS_STATUS_FINISHED,
            'after_time' => date('Y-m-d H:i:s')
        ]);

        return true;
    }

    public static function delete($id)
    {
        $order = OrdersModel::where('id', $id)->find();
        if (!$order) {
            abort('订单不存在');
        }
        if ($order->status == 0) abort('已删除');

        OrdersModel::update([
            'id' => $order->id,
            'status' => 0,
        ]);

        return true;
    }

    /**
     * 订单取消
     * @param $order_id
     * @return \support\Response|void
     * @throws \Exception
     */
    public static function cancel($order_id)
    {
        Db::startTrans();
        try {
            $Orders = OrdersModel::with('OrderItemsBind')->find($order_id);
            if (!$Orders) throw new \Exception('订单不存在');

            if ($Orders->status != 1) throw new \Exception('无法取消订单');
            if ($Orders->payment_status == OrderConstants::PAYMENT_STATUS_CANCELLED) throw new \Exception('订单已取消');

            OrdersModel::update([
                'id' => $Orders->id,
                'payment_status' => OrderConstants::PAYMENT_STATUS_CANCELLED,
            ]);

            PaymentsModel::where('order_id', $Orders->id)->update([
                'payment_status' => OrderConstants::PAYMENT_STATUS_CANCELLED,
            ]);

            if ($Orders->order_type == OrderConstants::ORDER_TYPE_PRINT) {
                ProductModel::update([
                    'id' => $Orders->product_id,
                    'sales' => Db::raw('sales -' . $Orders->num),
                    'stock' => Db::raw('stock + ' . $Orders->num),
                ]);

                ProductSpecModel::update([
                    'id' => $Orders->product_spec_id,
                    'stock' => Db::raw('stock + ' . $Orders->num),
                ]);

            }
            if ($Orders->balance_amount > 0) {
                UserLogic::balanceUpdate([
                    'id' => $Orders->user_id,
                    'balance' => Db::raw('balance + '. $Orders->balance_amount),
                ]);
                BalanceLogic::balanceLog([
                    'user_id' => $Orders->user_id,
                    'amount' => $Orders->balance_amount,
                    'type' => BalanceConstants::BALANCE_TYPE_RETURN,
                    'order_id' => $Orders->id,
                ]);
            }

            Db::commit();

            return success();
        }catch (\Exception $e) {
            Db::rollback();

            abort($e->getMessage());
        }
    }
}