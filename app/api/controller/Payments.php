<?php
namespace app\api\controller;

use app\api\logic\OrdersApiLogic;
use app\common\logic\PaymentsLogic;
use support\Log;
use support\Request;
use support\Response;

/**
 * 充值订单 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Payments
{

    // 此控制器是否需要登录
    protected $onLogin = true;
    
    // 不需要登录的方法
    protected $noNeedLogin = [];


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


        $list = PaymentsLogic::getList($data);


        return success($list);
    }

    public function cancel(Request $request): Response
    {

        return success(OrdersApiLogic::cancel($request->post('order_id')));
    }












}