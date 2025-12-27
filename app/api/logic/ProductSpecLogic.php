<?php
namespace app\api\logic;

use app\common\model\ProductSpecModel;
use app\admin\validate\ProductSpecValidate;
use think\facade\Db;

/**
 * 产品规格 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ProductSpecLogic
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

           $list = ProductSpecModel::withSearch(['product_id', 'status'], $params)
               ->where('stock', '>', 0)
               ->order($orderBy);

           return $list->paginate($params['pageSize'] ?? 20);
       }











}