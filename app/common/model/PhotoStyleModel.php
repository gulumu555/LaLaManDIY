<?php
namespace app\common\model;


use app\utils\ImgUrlTool;
use think\Model;

/**
 * 风格样例 模型
 * 
 * v1.3 升级：新增字段
 * - model: AI模型选择
 * - reference_images: 参考图数组
 * - style_strength: 风格强度
 * - identity_strength: 身份保持强度
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
        'reference_images' => 'json',
    ];

    protected $json = ['style_param', 'reference_images'];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
        'style_param' => '',
        'style_img' => '',
        'reference_images' => 'array',
    ];

    public function getStyleImgAttr($value, $data)
    {
        return ImgUrlTool::addPrefix($value);
    }

    public function getStyleParamAttr($value, $data)
    {
        return (array) $value;
    }

    // 获取参考图（带完整URL）
    public function getReferenceImagesAttr($value, $data)
    {
        if (empty($value))
            return [];

        // Handle already decoded values (object or array)
        if (is_object($value)) {
            $images = (array) $value;
        } elseif (is_array($value)) {
            $images = $value;
        } else {
            $images = json_decode($value, true);
        }

        return array_map(function ($img) {
            return ImgUrlTool::addPrefix($img);
        }, $images ?: []);
    }

    // 获取模型，默认为 seedream_4_5
    public function getModelAttr($value, $data)
    {
        return $value ?: 'seedream_4_5';
    }

    // 获取风格强度，默认为 0.7
    public function getStyleStrengthAttr($value, $data)
    {
        return $value ?: 0.7;
    }

    // 获取身份保持强度，默认为 0.8
    public function getIdentityStrengthAttr($value, $data)
    {
        return $value ?: 0.8;
    }

    public function CategoryBind()
    {
        return $this->belongsTo(CategoryModel::class, 'cate_id', 'id')->bind(['cate_name']);
    }
}