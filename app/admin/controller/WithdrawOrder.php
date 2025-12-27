<?php
namespace app\admin\controller;

use app\common\logic\UserLogic;
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
        $orderBy = 'status asc';
        $list = WithdrawOrderLogic::getList($request->get(), $orderBy);
        return success($list);
    }

    /**
     * 获取数据
     * @method get
     * @param int $id
     * @return Response
     */
    public function findData(int $id): Response
    {
        $data = WithdrawOrderLogic::findData($id);
        return success($data);
    }

    /**
     * 提现
     * @log 提现审核
     * @method post
     * @param Request $request
     * @return Response
     */
    public function updateStatus(Request $request): Response
    {
        $data = $request->post();

        WithdrawOrderLogic::updateStatus($data);

        return success();
    }

    public static function notify(Request $request): Response
    {
        Log::channel('transfer')->info('转账回调', $request->all());
        return success(200);
    }







}