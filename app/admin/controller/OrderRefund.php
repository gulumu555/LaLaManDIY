<?php
namespace app\admin\controller;

use support\Log;
use support\Request;
use support\Response;

use app\admin\logic\OrderRefundLogic;

/**
 * 退款信息 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class OrderRefund
{

    // 此控制器是否需要登录
    protected $onLogin = true;
    
    // 不需要登录的方法
    protected $noNeedLogin = ['notify'];




    /**
     * 获取数据
     * @method get
	 * @param Request $request 
     * @param int $id 
     * @return Response
     */
    public function findData(Request $request): Response
    {
        //TODO: 待写退款逻辑
        $data = OrderRefundLogic::findData($request->get('order_id'));
        return success($data);
    }




    /**
     * @log 售后审核
     * @method post
     * @auth orderRefundUpdateStatus
	 * @param Request $request 
     * @return Response
     */
    public function updateStatus(Request $request): Response
    {
        OrderRefundLogic::updateStatus($request->post());
        return success();
    }


    public function notify(Request $request): Response
    {
        Log::channel('pay')->info('退款回调成功', $request->all());
        OrderRefundLogic::notify();
        return success([],'', 200);
    }



}