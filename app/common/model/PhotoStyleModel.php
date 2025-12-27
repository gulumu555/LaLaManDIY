<?php
namespace app\common\model;


use app\utils\ImgUrlTool;
use think\Model;

/**
 * 风格样例 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoStyleModel extends BaseModel
{

    // 表名
    protected $name = 'photo_style';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
        'style_param' => 'json',
    ];

    protected $json = ['style_param'];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
        'style_param' => '',
    ];

    public function getStyleImgAttr($value, $data)
    {
        return ImgUrlTool::addPrefix($value);
    }

    public function getStyleParamAttr($value, $data)
    {
        return (array)$value;
    }

    public function CategoryBind()
    {
        return $this->belongsTo(CategoryModel::class , 'cate_id', 'id')->bind(['cate_name']);
    }
}