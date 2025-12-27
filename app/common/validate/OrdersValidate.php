<?php

namespace app\common\validate;

use app\common\model\OrdersModel;
use app\utils\constants\OrderConstants;
use taoser\Validate;

class OrdersValidate extends Validate
{

    protected $rule = [
        'id' => 'require|validateId',
        'shipping_name|物流公司' => 'require',
        'shipping_code|物流单号' => 'require',
        'examine_status|审核状态' => 'require|in:1,2|validateExamineStatus',
    ];


    protected function sceneShipping()
    {
        return $this->only(['id','shipping_name','shipping_code']);
    }

    protected function sceneExamineStatus()
    {
        return $this->only(['id','examine_status']);
    }

    protected function validateId($value, $rule, array $data = [])
    {
        $obj = OrdersModel::find($value);
        if (!$obj) return '订单不存在';


        return true;
    }

    protected function validateExamineStatus($value, $rule, array $data = [])
    {
        $obj = OrdersModel::find($value);

        if ($obj->order_type != OrderConstants::ORDER_TYPE_PRINT) return '非打印订单';
        if ($obj->status != OrderConstants::PAYMENT_STATUS_APPLY_REFUNDED) return '订单退款状态异常';


        return true;
    }
}