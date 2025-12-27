<?php
namespace app\api\controller;

use app\admin\logic\RegionLogic;
use app\utils\TencentLocation;
use support\Request;
use support\Response;

/**
 * 省市区
 *
 * @author zy <741599086@qq.com>
 * */
class Region
{
	//此控制器是否需要登录
	protected $onLogin = true;
	//不需要登录的方法，受控于上面个参数
	protected $noNeedLogin = [];

    /**
     * @log 根据上级获取下级
     * @method get
     * @param Request $request 
     * @param int $id 上级id
     * @return Response
     * */
    public static function getList(Request $request, int $id): Response
    {
        $list = RegionLogic::getList($id);
        return success($list);
    }

    /**
     * @log 获取所有的省
     * @method get
     * @param Request $request 
     * @return Response
     * */
    public static function getProvince(Request $request): Response
    {
        $list = RegionLogic::getProvince();
        return success($list);
    }

    /**
     * @log 获取所有的省市，多维的
     * @method get
     * @param Request $request 
     * @return Response
     * */
    public static function getProvinceCity(Request $request): Response
    {
        $list = RegionLogic::getProvinceCity();
        return success($list);
    }

    /**
     * @log 获取所有省市区，多维的
     * @method get
     * @param Request $request 
     * @return Response
     * */
    public static function getListAll(Request $request): Response
    {
        $list = RegionLogic::getListAll();
        return success($list);
    }

    public function getLocation(Request $request): Response
    {
        return success(TencentLocation::getLocation($request->get('lat'), $request->get('lng')));
    }
}
