<?php
namespace app\common\validate;

use app\common\model\UserModel;
use taoser\Validate;

/**
 * 用户 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserValidate extends Validate
{
    //unique:User
    // 验证规则
    protected $rule = [
        'nickname|昵称' => 'require',
        'tel|手机号' => 'require|mobile|validateUser',
        'avatar|头像' => 'require',
        'code|认证码' => 'require',
    ];

    protected $scene = [
        'register' => [ 'tel', 'code'],
        'updateInfo' => ['nickname', 'avatar'],
    ];

    public function validateUser($value, $rule, array $data = [])
    {
        $obj = UserModel::where('tel', $value);
        if (isset($data['id'])) {
            $obj = $obj->where('id', '<>', $data['id']);
        }
        if ($obj->count() > 0) return "手机号已存在";


        return true;
    }
}