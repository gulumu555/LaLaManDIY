<?php
namespace app\admin\controller;

use app\common\logic\PhotoStyleLogic;
use support\Request;
use support\Response;


/**
 * 风格样例 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
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
        $list = PhotoStyleLogic::getList($request->get());
        return success($list);
    }

    /**
     * @log 新增风格样例
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function create(Request $request): Response
    {
        PhotoStyleLogic::create($request->post());
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
        $data = PhotoStyleLogic::findData($id);
        return success($data);
    }

    /**
     * @log 修改风格样例
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function update(Request $request): Response
    {
        PhotoStyleLogic::update($request->post());
        return success([], '修改成功');
    }

    /**
     * @log 删除风格样例
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function delete(Request $request): Response
    {
        PhotoStyleLogic::delete($request->post('id'));
        return success([], '删除成功');
    }


    /**
     * @log 修改风格样例
     * @method post
     * @param Request $request
     * @return Response
     */
    public function updateStatus(Request $request): Response
    {
        PhotoStyleLogic::updateStatus($request->post());
        return success([], '修改成功');
    }





}