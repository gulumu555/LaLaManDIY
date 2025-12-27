<?php

namespace app\common\model;

class UserAddressModel extends BaseModel
{

    // 表名
    protected $name = 'user_address';


    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];


    protected function RegionCounty()
    {
        return $this->belongsTo(RegionModel::class, 'county', 'id')->bind(['pid_path_title']);
    }
}