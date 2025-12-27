<?php
namespace app\common\model;


use think\model\relation\HasOne;

/**
 * 打印订单 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class OrdersModel extends BaseModel
{

    // 表名
    protected $name = 'orders';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];



    // 用户 关联模型
    public function UserBind()
    {
        return $this->belongsTo(UserModel::class)->bind(['tel']);
    }
    public function User()
    {
        return $this->belongsTo(UserModel::class);
    }

    // 地址 关联模型
    public function Address()
    {
        return $this->belongsTo(AddressModel::class);
    }

    public function OrderItems()
    {
        return $this->hasOne(OrderItemsModel::class, 'order_id', 'id');
    }

    public function OrderItemsBind()
    {
        return $this->hasOne(OrderItemsModel::class, 'order_id', 'id')->bind([
            'product_id', 'product_spec_id', 'num'
        ]);
    }

    public function UserAddress()
    {
        return $this->belongsTo(UserAddressModel::class, 'address_id', 'id');
    }

    public function PhotoOrderBind(): \think\model\relation\BelongsTo
    {
        return $this->belongsTo(PhotoOrderModel::class, 'photo_order_id', 'id')->bind(['ai_original_img']);
    }

    public function RefundOrderBind()
    {
        return $this->hasOne(OrderRefundModel::class, 'order_id', 'id')->bind([
            'refund_amount', 'reason', 'file', 'refund_time' => 'create_time', 'examine_status','refuse_reason' => 'remark'
        ]);
    }

    public function PaymentsBind()
    {
        return $this->hasOne(PaymentsModel::class, 'order_id', 'id')->bind(['transaction_id']);
    }
}