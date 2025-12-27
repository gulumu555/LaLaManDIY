<?php
namespace app\common\model;


/**
 * 提现记录 模型
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class WithdrawOrderModel extends BaseModel
{

    // 表名
    protected $name = 'withdraw_order';

    // 自动时间戳
    protected $autoWriteTimestamp = true;

    // 字段类型转换
    protected $type = [
    ];

    // 包含附件的字段，''代表直接等于附件路劲，'array'代表数组中包含附件路劲，'editor'代表富文本中包含附件路劲
    protected $file = [
    ];

    protected $append = [
      'status_desc'
    ];


    // 用户 关联模型
    public function UserBindName()
    {
        return $this->belongsTo(UserModel::class)->bind(['nickname', 'avatar', 'tel']);
    }

    public function User()
    {
        return $this->belongsTo(UserModel::class);
    }

//    public function getStatusDescAttr($value, $data): string
//    {
//        $desc = [
//            '审核中',
//            '审核通过',
//            '审核拒绝'
//        ];
//        return $desc[$data['status']] ?? '';
//    }


    protected function getAmountAttr($value, $data): string
    {
        return number_format($value, 2, '.', '');
    }

    protected function transferOrder()
    {
        return $this->hasOne(TransferOrderModel::class, 'withdraw_order_id', 'id');
    }
}