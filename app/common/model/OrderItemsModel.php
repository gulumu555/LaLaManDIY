<?php

namespace app\common\model;

use app\utils\ImgUrlTool;

class OrderItemsModel extends BaseModel
{
    // 表名
    protected $name = 'order_items';


    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    protected $json = [
        'multi_face'
    ];

    protected function getProductImageAttr($value): string
    {
        return ImgUrlTool::addPrefix($value);
    }

    protected function getResultImageAttr($value): string
    {
        return ImgUrlTool::addPrefix($value);
    }

    protected function getOriginalImageAttr($value): string
    {
        return ImgUrlTool::addPrefix($value);
    }

    protected function getAiModelAttr($value): string
    {
        return ImgUrlTool::addPrefix($value);
    }

//    protected function getMultiFaceAttr($value): array
//    {
//        return $value ? (ImgUrlTool::addPrefix(json_decode())) : [];
//    }

    public function category()
    {
        return $this->belongsTo(CategoryModel::class, 'cate_id', 'id');
    }
}