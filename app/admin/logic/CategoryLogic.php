<?php
namespace app\admin\logic;

use app\common\model\CategoryModel;
use app\admin\validate\CategoryValidate;
use think\facade\Db;

/**
 * 分类管理 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class CategoryLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
      public static function getList(array $params = [], bool $page = true)
       {
           $params['type'] = $params['type'] ?? 1;
           // 排序
           $orderBy = "sort desc,id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
               $orderBy = "{$params['orderBy']},{$orderBy}";
           }

           $list = CategoryModel::withSearch(['type', 'status'], $params)
               //->with([])
               ->order($orderBy);

//           if (isset($params['origin']) && (in_array($params['origin'], [2,3]))) {
//               $list = $list->where('id', '<>', 4);
//           }
           return $page ? $list->paginate($params['pageSize'] ?? 20) : $list->select();
       }



    /**
     * 更新
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(CategoryValidate::class)->check($params);

            CategoryModel::update($params);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }



    /**
     * 更新状态
     * @param int|array $id
     * @param int $status
     */
    public static function updateStatus(int|array $id, int $status)
    {
        Db::startTrans();
        try {
            CategoryModel::where('id', 'in', $id)->update([
                'status' => $status
            ]);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }


    /**
     * 获取数据
     * @param int $id 数据id
     */
    public static function findData(int $id)
    {
        return CategoryModel::find($id);
    }



}