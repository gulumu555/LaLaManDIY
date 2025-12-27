<?php

namespace app\common\model;

use app\utils\ImgUrlTool;
use think\entity\Simple;

class OrderRefundModel extends BaseModel
{
    // 表名
    protected $name = 'order_refund';

    protected $append = [
        'examine_status_desc'
    ];

    protected $json = [
        'file'
    ];


    protected function getFileAttr($value): array|string
    {
        return ImgUrlTool::addPrefix((array)$value);
    }


    public  function orderItemsBind()
    {
        return $this->belongsTo(OrderItemsModel::class, 'order_id', 'order_id')->bind([
            'cate_name', 'product_name', 'product_image', 'spec', 'total_price', 'num'
        ]);
    }

    protected function getExamineStatusDescAttr($value, $data)
    {
        $desc = [
            '',
            '审核中',
            '审核通过',
            '审核失败',
        ];
        return $desc[$data['examine_status']] ?? '';
    }

    protected function OrdersBind()
    {
        return $this->belongsTo(OrdersModel::class, 'order_id', 'id')->bind(['payment_amount']);
    }
}