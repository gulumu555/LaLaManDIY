<?php

namespace app\common\validate;

use taoser\Validate;

class UserAddressValidate extends Validate
{
    protected $rule = [
        'name|收货人姓名' => 'require',
        'phone|手机号码' => 'require|mobile',
        'province|省份' => 'require',
        'city|城市' => 'require',
        'county|区/县' => 'require',
        'address|详细地址' => 'require',
        'is_default|是否默认地址' => 'require|in:0,1',
        'user_id|用户id' => 'require|validateUserId',
        'id|id' => 'require|number',
    ];

    public function sceneBase()
    {
        return $this->only(['name', 'phone', 'province', 'city', 'county', 'address', 'is_default', 'user_id']);
    }

    public function sceneEdit()
    {
        return $this->only(['name', 'phone', 'province', 'city', 'county', 'address', 'is_default', 'user_id', 'id']);
    }
    protected function validateUserId($value, $rule, $data)
    {
        /*$obj = UserAddressModel::where([
            'user_id' => $value,
            'county' => $data['county'],
        ]);

        if (!empty($data['id'])) {
            $obj = $obj->where('id', '<>', $data['id']);
        }
        $obj = $obj->find();
        if ($obj) return "该地址已存在";*/


        return true;
    }
}