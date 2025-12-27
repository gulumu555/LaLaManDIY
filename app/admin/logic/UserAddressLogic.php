<?php
namespace app\admin\logic;

use app\common\model\UserAddressModel;
use app\admin\validate\UserAddressValidate;
use think\facade\Db;

/**
 * 收货地址 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserAddressLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
      public static function getList(array $params = [])
       {
           // 排序
           $orderBy = "id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
               $orderBy = "{$params['orderBy']},{$orderBy}";
           }

           $list = UserAddressModel::withSearch(['user_id'], $params)
               ->with('RegionCounty')
               ->where('deleted', 0)
               ->order($orderBy);

           return $list->paginate($params['pageSize'] ?? 20);
       }











}