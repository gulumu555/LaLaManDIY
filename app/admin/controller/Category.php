<?php
namespace app\admin\controller;

use app\common\model\CategoryModel;
use support\Request;
use support\Response;

use app\admin\logic\CategoryLogic;

/**
 * 分类管理 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Category
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
        $list = CategoryLogic::getList($request->get());
        return success($list);
    }



    /**
     * @log 修改分类管理
     * @method post
     * @auth categoryUpdate
     * @param Request $request 
     * @return Response
     */
    public function update(Request $request): Response
    {
        CategoryLogic::update($request->post());
        return success([], '修改成功');
    }



    /**
     * @log 修改分类管理状态
     * @method post
	 * @param Request $request 
     * @param int $id 数据id
     * @param int $status 数据状态 
     * @return Response
     */
    public function updateStatus(Request $request, int $id, int $status): Response
    {
        CategoryLogic::updateStatus($id, $status);
        return success();
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
        $data = CategoryLogic::findData($id);
        return success($data);
    }


}