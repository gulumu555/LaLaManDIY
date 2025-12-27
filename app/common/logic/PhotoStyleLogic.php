<?php
namespace app\common\logic;

use app\common\model\PhotoStyleModel;
use app\admin\validate\PhotoStyleValidate;
use app\utils\ImgUrlTool;
use think\facade\Db;

/**
 * 风格样例 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoStyleLogic
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

           $list = PhotoStyleModel::withSearch(['cate_id', 'status','style_name'], $params)
               //->with([])
               ->order($orderBy);

           return $list->paginate($params['pageSize'] ?? 20);
       }

    /**
     * 新增
     * @param array $params
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            $params['style_cate'] = 1;
            validate(PhotoStyleValidate::class)->check($params);

            PhotoStyleModel::create($params);
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
        return PhotoStyleModel::find($id);
    }

    /**
     * 更新
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(PhotoStyleValidate::class)->check($params);

            PhotoStyleModel::update($params);
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
        PhotoStyleModel::destroy($id);
    }

    public static function updateStatus(mixed $post)
    {
        $id = $post['id'];
        $status = $post['status'];
        PhotoStyleModel::update(['status' => $status], ['id' => $id]);
        return true;
    }


}