<?php
namespace app\api\controller;

use app\common\logic\ServiceProductLogic;
use support\Request;
use support\Response;

use app\admin\logic\ServiceProductAdminLogic;

/**
 * 支付配置 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ServiceProduct
{

    // 此控制器是否需要登录
    protected $onLogin = false;
    
    // 不需要登录的方法
    protected $noNeedLogin = [];


    /**
     * 列表
     * @method get
     * @auth serviceProductGetList
     * @param Request $request 
     * @return Response
     */
    public function getList(Request $request): Response
    {
        $data = $request->get();
        $data['status'] = 1;

        $list = ServiceProductLogic::getList($data);
        return success($list);
    }


}