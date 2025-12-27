<?php
namespace app\api\controller;

use app\common\logic\BalanceLogic;
use support\Request;
use support\Response;

/**
 * 佣金明细 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserBalanceLog
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

        $list = BalanceLogic::getList($data);
        return success($list);
    }












}