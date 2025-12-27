<?php
namespace app\common\logic;

use app\common\model\OrderRefundModel;
use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\common\validate\OrdersValidate;
use app\utils\constants\OrderConstants;
use app\utils\constants\BalanceConstants;
use app\utils\DateTool;
use app\utils\ImgUrlTool;
use app\utils\Pays;
use think\db\Query;
use think\facade\Db;
use Workerman\Worker;

/**
 * 打印订单 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class OrdersLogic
{

    /**
     * 打印订单列表
     * @param array $params get参数
     * */
    public static function getList(array $params = [], $field = '*')
    {

        //$params = self::handleOrderStatusSearch($params['order_status'] ?:0, $params);

        $list = OrdersModel::with(['OrderItems' => function (Query $query) {
            $query->with('category');
        }, 'UserBind', 'PhotoOrderBind', 'RefundOrderBind'])
            ->field($field)
            ->withSearch(['payment_status', 'logistics_status', 'user_id',  'payment_type', 'refund_status', 'order_no'], $params)
            ->where('order_type', OrderConstants::ORDER_TYPE_PRINT)
            ->where('orders_model.status', 1);

        $list = self::handleOrderStatusSearch($list,$params['order_status'] ?? 0);


        $list = $list->withJoin(['OrderItems' => function($query)  use($params){
            if (!empty($params['cate_id'])) {
                $query->where('cate_id', $params['cate_id']);
            }

            if (!empty($params['product_name'])) {
                $query->where('product_name', 'like', "%{$params['product_name']}%");
            }
        }, 'UserBind' => function($query) use($params){
            if (!empty($params['tel'])) {
                $query->where('tel', 'like', "%{$params['tel']}%");
            }
        }]);

        if (isset($params['id']) && $params['id'] != '') {
            $list = $list->where('orders_model.id', $params['id']);
        }

        // 排序
        $orderBy = "id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
            $orderBy = "{$params['orderBy']},{$orderBy}";
        }

        $list = $list->order($orderBy);

        return  $list->paginate($params['pageSize'] ?? 20)->each(function ($item) {
            $now = date('Y-m-d H:i:s');
            //$address = $item['UserAddress'];
            $orderItem = $item['OrderItems'];

            $item['cate_id'] = $orderItem['cate_id'];
            $item['product_name'] = $orderItem['product_name'];
            $item['price'] = $orderItem['price'];
            $item['num'] = $orderItem['num'];
            $item['total_price'] = $orderItem['total_price'];
            $item['spec'] = $orderItem['spec'];
            $item['product_image'] = $orderItem['product_image'];
            $item['result_image'] = $orderItem['result_image'];
            $item['ai_model'] = $orderItem['ai_model'];
            $item['product_type'] = $orderItem['category']['product_type'];


            if (!empty($orderItem['multi_face'])) {
                $multi_face = json_decode($orderItem['multi_face'], true);

                $multi_face = ImgUrlTool::addPrefix($multi_face);
                if ($item['product_type'] == 3) {
                    $item['ai_data'] = array_merge([
                        $orderItem['ai_model']
                    ], $multi_face);
                }else {
                    $item['ai_data'] = reset($multi_face);
                }

            }


//            $name = $address['name'] ?? '';
//            $phone = $address['phone'] ?? '';
//            $pid_path_title = $address['pid_path_title'] ?? '';
//            $address_info = $address['address'] ?? '';
//            $item['address'] = "{$name}，{$phone}，{$pid_path_title}{$address_info}";

            $is_paid = $item['payment_status'] == OrderConstants::PAYMENT_STATUS_PAID;
            $item['can_refund'] = $is_paid && $item['refund_status'] == OrderConstants::REFUND_STATUS_APPLY_REFUNDED;
            $item['can_shipping'] = $is_paid && ($item['logistics_status'] == OrderConstants::LOGISTICS_STATUS_DELIVERING) && (in_array($item['refund_status'], [OrderConstants::REFUND_STATUS_PENDING, OrderConstants::REFUND_STATUS_REFUNDED_FAILED]));

            $item['show_button'] = [
                'cancel_pay' => $item['payment_status'] == 0, // 订单取消 立即支付
                'apply_refund'    => $item['payment_status'] == 1 &&  in_array($item['refund_status'], [0]) && (
                    ($item['logistics_status'] != 3) || (
                        $item['after_time'] && (DateTool::calculateDiffDays($now, $item['after_time']) <= getenv('CLOSE_AFTER_DAY'))
                    ) || !$item['after_time']
                    ), // 申请退款
                'view_logistics' => $item['logistics_status'] > 1 && in_array($item['refund_status'], [0, 3]),  // 查看物流
                'confirm_receipt' => $item['logistics_status'] == 2,    // 确认收货
                'delete_order' => $item['payment_status'] == 2, // 删除订单
                'examine_refund' => $item['refund_status'] == 1 && $item['payment_status'] == OrderConstants::PAYMENT_STATUS_PAID,    // 审核退款
                'agree_refund' => $item['refund_status'] == 2,    // 同意退款
                'refuse_refund' => $item['refund_status'] == 3,    // 拒绝退款
            ];
            unset($item['UserAddress'], $item['OrderItems'], $item['UserBind']);

            $desc = [
                '-',
                '待商家审核',
                '退款成功',
                '退款失败'
            ];
            $item['refund_status_desc'] = $desc[$item['refund_status']] ?? '';
            $logistics_desc = [
                '-',
                '待发货',
                '已发货',
                '确认收货'
            ];
            $item['logistics_status_desc'] = $logistics_desc[$item['logistics_status']] ?? '';

            return self::showOrderStatus($item);
        })->toArray();
    }

    private static function handleOrderStatusSearch($list,$order_status)
    {
        //1待支付 2已取消 3待发货 4待收货 5确认收货（已完成）、退款成功 6申请退款 7退款成功 8退款失败

        switch ($order_status) {
            case 1:
                $list = $list->where('payment_status', OrderConstants::PAYMENT_STATUS_PENDING);
                break;
            case 2:
                $list = $list->where('payment_status', OrderConstants::PAYMENT_STATUS_CANCELLED);
                break;
            case 3:
                $list = $list->where('logistics_status', OrderConstants::LOGISTICS_STATUS_DELIVERING)
                    ->where('refund_status', OrderConstants::REFUND_STATUS_PENDING)
                    ->where('payment_status', OrderConstants::PAYMENT_STATUS_PAID);
                break;
            case 4:
                $list = $list->where('logistics_status', OrderConstants::LOGISTICS_STATUS_RECEIVING);
                break;
            case 5:
                $list = $list->where(function (Query$query) {
                   $query->where('logistics_status', OrderConstants::LOGISTICS_STATUS_FINISHED);
//                   ->whereOr('refund_status', OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS);
                });
                break;
             case 6:
                 $list = $list->where('refund_status', 'in', [OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS, OrderConstants::REFUND_STATUS_APPLY_REFUNDED]);
                break;
            /*case 7:

                break;
            case 8:

                break;*/
        }

        return $list;
    }

    private static function showOrderStatus($item)
    {
        if ($item['payment_status'] == OrderConstants::PAYMENT_STATUS_PENDING) {
            $item['order_status'] = 1;
            $item['order_status_desc'] = '待支付';
        }

        if ($item['refund_status'] == OrderConstants::REFUND_STATUS_REFUNDED_FAILED) {
            $item['order_status'] = 8;
            $item['order_status_desc'] = '退款失败';
        }

        if ($item['logistics_status'] == OrderConstants::LOGISTICS_STATUS_DELIVERING) {
            $item['order_status'] = 3;
            $item['order_status_desc'] = '待发货';
        }

        if ($item['logistics_status'] == OrderConstants::LOGISTICS_STATUS_RECEIVING) {
            $item['order_status'] = 4;
            $item['order_status_desc'] = '待收货';
        }

        if ($item['logistics_status'] == OrderConstants::LOGISTICS_STATUS_FINISHED) {
            $item['order_status'] = 5;
            $item['order_status_desc'] = '已完成';
        }

        if ($item['refund_status'] == OrderConstants::REFUND_STATUS_APPLY_REFUNDED) {
            $item['order_status'] = 6;
            $item['order_status_desc'] = '申请退款';
        }

        if ($item['refund_status'] == OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS) {
            $item['order_status'] = 7;
            $item['order_status_desc'] = '退款成功';
        }



        if ($item['payment_status'] == OrderConstants::PAYMENT_STATUS_CANCELLED) {
            $item['order_status'] = 2;
            $item['order_status_desc'] = '已取消';
        }

        return $item;
    }

    /**
     * 获取数据
     * @param int $id 数据id
     */
    public static function findData(int $id)
    {
        return OrdersModel::find($id);
    }

    /**
     * 更新物流
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(OrdersValidate::class)->scene($params['scene'])->check($params);

            OrdersModel::update($params);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }




    /**
     * 订单审核
     * @param array $params
     */
    public static function statusExamine(array $params)
    {
        
    }


    public static function examineRefund(mixed $data)
    {
        Db::startTrans();
        try {
            validate(OrdersValidate::class)->check($data);

            $is_agree = $data['examine_status'] == 1;
            $refund_status = $is_agree ? OrderConstants::REFUND_STATUS_REFUNDED_SUCCESS : OrderConstants::REFUND_STATUS_REFUNDED_FAILED;
            $order = OrdersModel::find($data['id']);
            OrdersModel::update([
                'id' => $data['id'],
                'refund_status' => $refund_status
            ]);

            $payment = PaymentsModel::where('order_id', $data['id'])->find();

            $refund = OrderRefundModel::where('order_id', $data['id'])->find();
            $refund->status = $data['examine_status'];
            $refund->remark = $data['remark'];
            $refund->examine_time = date('Y-m-d H:i:s');
            $refund->refund_amount = $data['refund_amount'];
            $refund->wx_amount  = $data['wx_amount'];
            $refund->balance_amount = $data['balance_amount'];
            $refund->out_refund_no = get_order_no('R');
            $refund->save();

            if (!$is_agree) return true;

            if ($refund->wx_amount > 0) {
                Pays::wechatRefund($payment->transaction_id, $order->payment_amount, $order->payment_amount, $refund->out_refund_no);
            }

            if ($order->balance_amount <= 0) return true;

            UserLogic::balanceUpdate([
                'id' => $order->user_id,
                'balance' => Db::raw('balance + '. $order->balance_amount),
            ]);
            BalanceLogic::balanceLog([
                'user_id' => $order->user_id,
                'type' => BalanceConstants::BALANCE_TYPE_REFUND,
                'amount' => $order->balance_amount,
                'order_id' => $order->id,
            ]);


            Db::commit();
        }catch (\Exception $e) {
           Db::rollback();
           abort($e->getMessage());
        }
    }
}