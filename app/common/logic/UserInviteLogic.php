<?php
namespace app\common\logic;

use app\common\model\UserInviteModel;
use app\admin\validate\UserInviteValidate;
use think\facade\Db;

/**
 * 用户邀请 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserInviteLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
      public static function getList(array $params = [])
       {
            // 排序
            $orderBy = "update_time desc";
            if (isset($params['orderBy']) && $params['orderBy']) {
                   $orderBy = "{$params['orderBy']},{$orderBy}";
               }

           $list = UserInviteModel::with('UserInviteBind')
               ->withSearch(['user_id'], $params)
               ->order($orderBy);

           $statistic = [
               'total' => $list->count(),
            ];

           $list = $list->paginate($params['pageSize'] ?? 20)->toArray();



           return array_merge($list, ['statistic' => $statistic]);
       }











}