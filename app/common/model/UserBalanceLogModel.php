<?php
namespace app\common\model;


/**
 * 佣金明细 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserBalanceLogModel extends BaseModel
{

    // 表名
    protected $name = 'user_balance_log';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];

    protected $append = [
        'type_desc',
        'status_desc',
    ];


    // 用户 关联模型
    public function UserBindName()
    {
        return $this->belongsTo(UserModel::class)->bind(['nickname', 'tel']);
    }

    // 订单 关联模型
    public function OrderBind()
    {
        return $this->belongsTo(OrdersModel::class, 'order_id', 'id')->bind(['order_type']);
    }

    protected function getTypeDescAttr($value, $data): string
    {
        $desc = [
            '',
            '消费提成',
            '提现成功',
            '提现失败',
            '购买服务消费',
            '打印消费',
            '售后退费',
            '订单取消',
            '消费退款'
        ];

        return $desc[$data['type']] ?? '';
    }

    protected function getStatusDescAttr($value, $data): string
    {
        $desc = [
            '冻结',
            '正常',
            '正常'
        ];

        return $desc[$data['status']] ?? '';
    }
}