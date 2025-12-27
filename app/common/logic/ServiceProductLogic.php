<?php
namespace app\common\logic;

use app\common\model\ServiceProductModel;
use app\admin\validate\ServiceProductValidate;
use think\facade\Db;

/**
 * 支付配置 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ServiceProductLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
      public static function getList(array $params = [])
       {
           // 排序
           $orderBy = "sort desc,id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
               $orderBy = "{$params['orderBy']},{$orderBy}";
           }

           $list = ServiceProductModel::withSearch(['status'], $params)
               //->with([])
               ->order($orderBy);

           return $list->paginate($params['pageSize'] ?? 20);
       }


}