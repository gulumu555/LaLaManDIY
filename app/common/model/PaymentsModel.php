<?php
namespace app\common\model;


/**
 * 充值订单 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PaymentsModel extends BaseModel
{

    // 表名
    protected $name = 'payments';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];



    // 订单 关联模型
    public function OrdersBind()
    {
        return $this->belongsTo(OrdersModel::class, 'order_id')->bind([
            'order_count', 'total_amount','balance_amount','order_no'
        ]);
    }

    // 用户 关联模型
    public function UserBind()
    {
        return $this->belongsTo(UserModel::class)->bind([
            'tel'
        ]);
    }

}