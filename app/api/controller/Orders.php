<?php
namespace app\api\controller;

use app\api\logic\OrdersApiLogic;
use app\common\logic\LogisticsLogic;
use app\common\logic\OrderRefundLogic;
use app\common\logic\OrdersLogic;
use app\common\logic\UserAddressLogic;
use app\common\model\OrdersModel;
use app\common\model\PaymentsModel;
use app\utils\constants\OrderConstants;
use support\Log;
use support\Request;
use support\Response;

/**
 * 打印订单 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Orders
{

    // 此控制器是否需要登录
    protected $onLogin = true;
    
    // 不需要登录的方法
    protected $noNeedLogin = ['notify'];



    /**
     * 列表
     * @method get
     * @param Request $request 
     * @return Response
     */
    public function getList(Request $request): Response
    {
        $data = $request->get();
        $data['user_id'] = $request->user['id'];

        $list = OrdersLogic::getList($data, "
            id,address_id,total_amount,payment_amount,balance_amount,create_time,photo_order_id,payment_status,logistics_status,refund_status,
            order_no,payment_time,after_time,shipping_name,shipping_code, address
        ");

        return success($list);
    }

    public function refund(Request $request): Response
    {
        $data = $request->post();

        OrderRefundLogic::refund($data);
        return success();
    }

    public function refundInfo(Request $request): Response
    {

        $info = OrderRefundLogic::refundInfo($request->get('id'));
        return success($info);
    }

    public function create(Request $request): Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];
        $data['openid'] = $request->user['openid'];

        $result = OrdersApiLogic::create($data);

        return success($result);
    }

    public function notify(): Response
    {
        Log::channel('notify')->info('回调获取:' .json_encode(request()->post()));
        OrdersApiLogic::notify();

        return success([],'success', 200);
    }

    public function logistics(Request $request): Response
    {
        $route_info = UserAddressLogic::logistics($request->get());

        return success($route_info,'success');
    }

    /**
     * 订单取消
     * @param Request $request
     * @return Response
     */
    public function cancel(Request $request): Response
    {

        return success(OrdersApiLogic::cancel($request->post('id')));
    }

    public function repay(Request $request): Response
    {
        return success(OrdersApiLogic::rePay($request->post('id')));
    }

    public function confirm(Request $request): Response
    {
        return success(OrdersApiLogic::confirm($request->post('id')));
    }

    public function delete(Request $request): Response
    {
        return success(OrdersApiLogic::delete($request->post('id')));
    }
}