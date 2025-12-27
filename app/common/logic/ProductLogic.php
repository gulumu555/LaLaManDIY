<?php
namespace app\common\logic;

use app\common\model\ProductModel;
use app\admin\validate\ProductValidate;
use app\common\model\ProductSpecModel;
use app\utils\Strs;
use think\facade\Db;

/**
 * 产品管理 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ProductLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
    public static function getList(array $params = [], bool $page = true)
    {
        // 排序
        $orderBy = "sort desc,id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
            $orderBy = "{$params['orderBy']},{$orderBy}";
        }

        $hasWhere = [];
        if (isset($params['cate_name']) && $params['cate_name']) {
            $params['cate_id'] = $params['cate_name'];
        }

        $list = ProductModel::withSearch(['product_name', 'cate_id', 'status'], $params)
            ->with(['CategoryBind'])
            ->order($orderBy);

        if ($hasWhere) {
            $list = $list->hasWhere('CategoryBind', $hasWhere);
        }
        return $page ? $list->paginate($params['pageSize'] ?? 20) : $list->select();
    }


    /**
     * 获取数据
     * @param int $id 数据id
     */
    public static function findData(int $id)
    {
        $obj = ProductModel::with('ProductSpec')->find($id)->toArray();
        $obj['product_spec'] = $obj['ProductSpec'];
        unset($obj['ProductSpec']);
        return $obj;
    }




}