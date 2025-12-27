<?php
namespace app\common\model;


/**
 * 分类管理 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class CategoryModel extends BaseModel
{

    // 表名
    protected $name = 'category';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];



}