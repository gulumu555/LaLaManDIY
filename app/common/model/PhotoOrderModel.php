<?php
namespace app\common\model;


use app\utils\ImgUrlTool;

/**
 * 打印订单 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoOrderModel extends BaseModel
{

    // 表名
    protected $name = 'photo_order';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];

    protected $append = [
        'status_text',
    ];


    // 用户 关联模型
    public function UserBind()
    {
        return $this->belongsTo(UserModel::class)->bind(['tel']);
    }

    protected function getResultImgAttr($value, $data)
    {
        return ImgUrlTool::addPrefix($value);
    }

    protected function getOriginalImgAttr($value, $data)
    {
        return ImgUrlTool::addPrefix($value);
    }

    protected function getAiOriginalImgAttr($value, $data)
    {
        return ImgUrlTool::addPrefix($value);
    }

    protected function getStatusTextAttr($value, $data)
    {
        $desc = [
            "未生成",
            "生成中",
            "生成成功",
            "生成失败"
        ];

        return $desc[$data['status']] ?? '';
    }

    protected function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id', 'id');
    }

    protected function photoStyle()
    {
        return $this->belongsTo(PhotoStyleModel::class, 'photo_style_id', 'id');
    }
}