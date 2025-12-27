<?php
namespace app\api\controller;

use app\common\logic\UserAddressLogic;
use support\Log;
use support\Request;
use support\Response;

/**
 * 收货地址 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserAddress
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

        $list = UserAddressLogic::getList($data);
        return success($list);
    }


    public function create(Request $request): Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];

        UserAddressLogic::create($data);
        return success();
    }

    public function update(Request $request): Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];

        UserAddressLogic::update($data);
        return success();
    }


    public function delete(Request $request): Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];

        UserAddressLogic::delete($data);
        return success();
    }





}