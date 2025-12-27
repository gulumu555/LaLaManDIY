<?php

namespace app\api\controller;

use support\Request;
use support\Response;

class OrderRefund
{
    // 此控制器是否需要登录
    protected $onLogin = true;

    // 不需要登录的方法
    protected $noNeedLogin = [];


    /**
     * 撤销售后
     * @param Request $request
     * @return Response
     */
    public function cancel(Request $request): Response
    {
        $id = $request->post('id');

        \app\api\logic\OrderRefundLogic::cancel($id);
        return success();
    }
}