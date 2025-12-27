<?php
namespace app\admin\controller;

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
    protected $onLogin = true;
    
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
        $list = ServiceProductLogic::getList($request->get());
        return success($list);
    }

    /**
     * @log 新增支付配置
     * @method post
     * @auth serviceProductCreate
     * @param Request $request 
     * @return Response
     */
    public function create(Request $request): Response
    {
        ServiceProductAdminLogic::create($request->post());
        return success([], '添加成功');
    }

    /**
     * 获取数据
     * @method get
	 * @param Request $request 
     * @param int $id 
     * @return Response
     */
    public function findData(Request $request, int $id): Response
    {
        $data = ServiceProductAdminLogic::findData($id);
        return success($data);
    }

    /**
     * @log 修改支付配置
     * @method post
     * @auth serviceProductUpdate
     * @param Request $request 
     * @return Response
     */
    public function update(Request $request): Response
    {
        ServiceProductAdminLogic::update($request->post());
        return success([], '修改成功');
    }



    /**
     * @log 修改支付配置状态
     * @method post
     * @auth serviceProductUpdateStatus
	 * @param Request $request 
     * @param int $id 数据id
     * @param int $status 数据状态 
     * @return Response
     */
    public function updateStatus(Request $request, int $id, int $status): Response
    {
        ServiceProductAdminLogic::updateStatus($id, $status);
        return success();
    }






}