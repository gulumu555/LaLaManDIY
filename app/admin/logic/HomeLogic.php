<?php
namespace app\admin\logic;

use app\common\model\HomeModel;
use app\admin\validate\HomeValidate;
use think\facade\Db;

/**
 * 首页列表 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class HomeLogic
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

           $list = HomeModel::withoutField('')
               ->withSearch(['desc'], $params)
               ->order($orderBy);

           return $page ? $list->paginate($params['pageSize'] ?? 20) : $list->select();
       }

    /**
     * 新增
     * @param array $params
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            validate(HomeValidate::class)->check($params);

            HomeModel::create($params);
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
        return HomeModel::find($id);
    }

    /**
     * 更新
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(HomeValidate::class)->check($params);

            HomeModel::update($params);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }

    /**
     * 删除
     * @param int|array $id 要删除的id
     */
    public static function delete(int|array $id)
    {
        HomeModel::destroy($id);
    }







}