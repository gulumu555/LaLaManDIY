<?php
namespace app\admin\controller;

use app\common\logic\SeedDreamStyleLogic;
use support\Request;
use support\Response;

/**
 * Seedream风格配置 控制器
 *
 * @author LaLaMan
 */
class SeedDreamStyle
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
        $list = SeedDreamStyleLogic::getList($request->get());
        return success($list);
    }

    /**
     * @log 新增Seedream风格
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function create(Request $request): Response
    {
        SeedDreamStyleLogic::create($request->post());
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
        $data = SeedDreamStyleLogic::findData($id);
        return success($data);
    }

    /**
     * @log 修改Seedream风格
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function update(Request $request): Response
    {
        SeedDreamStyleLogic::update($request->post());
        return success([], '修改成功');
    }

    /**
     * @log 删除Seedream风格
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function delete(Request $request): Response
    {
        SeedDreamStyleLogic::delete($request->post('id'));
        return success([], '删除成功');
    }

    /**
     * @log 修改Seedream风格状态
     * @method post
     * @param Request $request
     * @return Response
     */
    public function updateStatus(Request $request): Response
    {
        SeedDreamStyleLogic::updateStatus($request->post());
        return success([], '修改成功');
    }

    /**
     * 获取分类列表
     * @method get
     * @return Response
     */
    public function getCategories(): Response
    {
        $categories = SeedDreamStyleLogic::getCategories();
        return success($categories);
    }
}
