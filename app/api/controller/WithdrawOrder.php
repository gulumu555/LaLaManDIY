<?php
namespace app\api\controller;

use app\common\logic\WithdrawOrderLogic;
use support\Log;
use support\Request;
use support\Response;

/**
 * 提现记录 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class WithdrawOrder
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

        $list = WithdrawOrderLogic::getList($data, 'update_time desc');
        return success($list);
    }

    /***
     * 发起提现
     * @param Request $request
     * @return Response
     */
    public function withdraw(Request $request): Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];


         WithdrawOrderLogic::withdraw($data);
        return success([], '发起提现成功，请等待管理员审核');
    }

    public  function getPackInfo(Request $request): Response
    {
        return success(WithdrawOrderLogic::getPackageInfo($request->get('id')));
    }


    public function notify(Request $request): Response
    {
        Log::channel('transfer')->info('回调成功', $request->all());

        WithdrawOrderLogic::notify();
        return success([], 200);
    }




}