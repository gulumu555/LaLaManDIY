<?php
namespace app\common\validate;

use app\common\model\UserModel;
use app\common\model\WithdrawOrderModel;
use taoser\Validate;

/**
 * 提现记录 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class WithdrawOrderValidate extends Validate
{

    // 验证规则
    protected $rule = [
        'amount|提现金额' => 'require|egt:0.1',
        'wx_id|提现账号' => 'require',
        'user_id' => 'require|validateUser',
        'id|提现记录ID' => 'require',
        'status|审核状态' => 'require|in:1,2|validateStatus',
    ];

    protected $scene = [
      'withdraw' => ['amount', 'wx_id', 'user_id'],
      'examine' => ['id', 'status']
    ];


    protected function validateUser($value, $rule, $data): bool|string
    {
        $user = UserModel::where('id', $value)->find();
        if (!$user) {
            return '用户不存在';
        }

        if ($user->balance < $data['amount']) {
            return '余额不足';
        }
        return true;
    }

    protected function validateStatus($value, $rule, $data): bool|string
    {
        $id = is_array($data['id']) ? $data['id'] : [$data['id']];
        $obj = WithdrawOrderModel::whereIn('id', $id)->column('status', 'id');

        if (count($obj)!= count($id)) return '提现记录不存在';
        if (array_reduce($obj, function ($item, $carry){
            return $carry || ($item != 0);
        }, false)) return '提现记录已审核';
        return true;
    }
}