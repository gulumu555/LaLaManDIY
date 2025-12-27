<?php
namespace app\common\model;


use app\utils\ImgUrlTool;

/**
 * 产品管理 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ProductModel extends BaseModel
{

    // 表名
    protected $name = 'product';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
        'id' => 'integer',
        'style_param' => 'json',
    ];

    protected $json = ['style_param'];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
        'main_image' => '',
    ];



    // 分类 关联模型
    public function CategoryBind()
    {
        return $this->belongsTo(CategoryModel::class,'cate_id','id')->bind(['cate_name']);
    }

    // 产品规格 关联模型
    public function ProductSpec()
    {
        return $this->hasMany(ProductSpecModel::class);
    }

    public function getMainImageAttr($value)
    {
        return ImgUrlTool::addPrefix($value);
    }
    public function getStyleParamAttr($value, $data)
    {
        return (array)$value;
    }
}