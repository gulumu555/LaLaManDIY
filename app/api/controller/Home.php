<?php

namespace app\api\controller;

use app\admin\logic\HomeLogic;
use support\Request;
use support\Response;

class Home
{

    // 此控制器是否需要登录
    protected $onLogin = false;
    // 不需要登录的方法
    protected $noNeedLogin = [];

    /**
     * 列表
     * @method get
     * @auth homeGetList
     * @param Request $request
     * @return Response
     */
    public function getList(Request $request): Response
    {
        $list = HomeLogic::getList($request->get(), false);
        return success($list);
    }
}