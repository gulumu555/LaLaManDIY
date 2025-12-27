<?php
namespace app\admin\controller;

use support\Request;
use support\Response;

use app\admin\logic\HomeLogic;

/**
 * 首页列表 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Home
{

    // 此控制器是否需要登录
    protected $onLogin = true;
    
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
        $list = HomeLogic::getList($request->get());
        return success($list);
    }

    /**
     * @log 新增首页列表
     * @method post
     * @auth homeCreate
     * @param Request $request 
     * @return Response
     */
    public function create(Request $request): Response
    {
        HomeLogic::create($request->post());
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
        $data = HomeLogic::findData($id);
        return success($data);
    }

    /**
     * @log 修改首页列表
     * @method post
     * @auth homeUpdate
     * @param Request $request 
     * @return Response
     */
    public function update(Request $request): Response
    {
        HomeLogic::update($request->post());
        return success([], '修改成功');
    }

    /**
     * @log 删除首页列表
     * @method post
     * @auth homeDelete
     * @param Request $request 
     * @return Response
     */
    public function delete(Request $request): Response
    {
        HomeLogic::delete($request->post('id'));
        return success([], '删除成功');
    }








}