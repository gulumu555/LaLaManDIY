<?php
namespace app\api\controller;

use support\Log;
use support\Request;
use support\Response;

use app\common\logic\ProductLogic;

/**
 * 产品管理 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Product
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

        if (empty($data['cate_id'])) return error('缺少打印类型参数');
        $list = ProductLogic::getList($data);

        return success($list);
    }







}