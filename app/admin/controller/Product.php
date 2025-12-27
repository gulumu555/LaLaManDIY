<?php
namespace app\admin\controller;

use app\admin\logic\ProductAdminLogic;
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
        $list = ProductLogic::getList($request->get());
        return success($list);
    }

    /**
     * @log 新增产品管理
     * @method post
     * @auth productCreate
     * @param Request $request 
     * @return Response
     */
    public function create(Request $request): Response
    {
        ProductAdminLogic::create($request->post());
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
        $data = ProductLogic::findData($id);
        return success($data);
    }

    /**
     * @log 修改产品管理
     * @method post
     * @auth productUpdate
     * @param Request $request 
     * @return Response
     */
    public function update(Request $request): Response
    {
        ProductAdminLogic::update($request->post());
        return success([], '修改成功');
    }

    /**
     * @log 删除产品管理
     * @method post
     * @auth productDelete
     * @param Request $request 
     * @return Response
     */
    public function delete(Request $request): Response
    {
        ProductAdminLogic::delete($request->post('id'));
        return success([], '删除成功');
    }


    public function updateStatus (Request $request)
    {
        ProductAdminLogic::updateStatus($request->post());
        return success([], '修改成功');
    }






}