<?php
namespace app\admin\controller;

use app\common\logic\PhotoOrderLogic;
use support\Request;
use support\Response;

/**
 * 打印订单 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoOrder
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
        $list = PhotoOrderLogic::getList($request->get());
        return success($list);
    }












}