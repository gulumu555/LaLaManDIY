<?php

namespace app\api\controller;

use app\common\logic\PhotoStyleLogic;
use support\Request;
use support\Response;

class PhotoStyle
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
        $data['cate_id'] = $data['cate_id'] ?? 1;
        $data['status'] = 1;

        $list = PhotoStyleLogic::getList($data);
        return success($list);
    }

}