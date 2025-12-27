<?php
namespace app\common\model;


/**
 * 支付配置 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ServiceProductModel extends BaseModel
{

    // 表名
    protected $name = 'service_product';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];



}