<?php
namespace app\common\logic;

use app\admin\validate\PhotoOrderValidate;
use app\common\model\PhotoOrderModel;
use think\db\exception\DbException;
use think\db\Query;
use think\Paginator;
use Workerman\Worker;

/**
 * 打印订单 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoOrderLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @return Paginator
     * @throws DbException
     */
    public static function getList(array $params = [])
    {
        // 排序
        $orderBy = "id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
            $orderBy = "{$params['orderBy']},{$orderBy}";
        }

        $list = PhotoOrderModel::withSearch(['order_type', 'name', 'user_id'], $params)
            ->with(['UserBind', 'product' => function (Query $query) {
                $query->with('CategoryBind');
            }, 'photoStyle' => function (Query $query) {
                $query->with('CategoryBind');
            }])
            ->order($orderBy);

        if (isset($params['tel']) && $params['tel'] != '') {
            $list = $list->withJoin(['UserBind' => function (Query $query) use ($params) {
                $query->where('tel', 'like', '%' . $params['tel'] . '%');
            }]);
        }

        return $list->paginate($params['pageSize'] ?? 20)->each(function ($item) {
            $item['name'] = $item['order_type'] == 1 ? (
                $item['photoStyle']['cate_name'] . '-' . $item['photoStyle']['style_name']
            ) : (
                $item['product']['cate_name'] . '-' . $item['product']['product_name']
            );

            return $item;
        });
    }











}