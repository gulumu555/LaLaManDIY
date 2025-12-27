<?php
namespace app\api\controller;

use support\Request;
use support\Response;

use app\api\logic\ProductSpecLogic;

/**
 * 产品规格 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ProductSpec
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
        $data['status'] = 1;
        if (empty($data['product_id'])) return error('缺少必填参数');
        $list = ProductSpecLogic::getList($data);
        return success($list);
    }












}