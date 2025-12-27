<?php
namespace app\api\controller;

use app\admin\logic\ConfigLogic;
use support\Request;
use support\Response;

/**
 * 配置
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Config
{
    //此控制器是否需要登录
    protected $onLogin = true;
    //不需要登录的方法
    protected $noNeedLogin = ['getConfig'];


    /**
     * 获取列表
     * @method get
     * @auth configGetList
     * @param Request $request
     * @return Response
     */
    public function getConfig(string $name = 'web_config') : Response
    {
        $data = ConfigLogic::getConfig($name);

        $data = file_url($data);
        return success($data);
    }
}
