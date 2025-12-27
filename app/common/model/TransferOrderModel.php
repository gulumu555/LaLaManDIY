<?php

namespace app\common\model;

use think\Model;

class TransferOrderModel extends BaseModel
{
    // 表名
    protected $name = 'transfer_order';


    // 自动时间戳
    protected $autoWriteTimestamp = true;


    protected $json = [
        'package_info'
    ];


    protected function getPackageInfoAttr($value)
    {
        return $value ? ((array)$value) : [];
    }

    protected function userBind()
    {
        return $this->belongsTo(UserModel::class, 'user_id', 'id')->bind(['openid']);
    }
}