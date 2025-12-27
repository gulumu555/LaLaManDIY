<?php

namespace app\api\validate;

use app\common\model\PhotoOrderModel;
use app\common\model\ProductModel;
use app\common\model\ProductSpecModel;
use app\common\model\ServiceProductModel;
use app\common\model\UserAddressModel;
use app\common\model\UserModel;
use app\utils\RequestHandle;
use support\Log;
use taoser\Validate;

class OrdersValidate extends Validate
{
    protected $rule = [
        'user_id|用户id' => 'require|validateUserId',
        'order_type|订单类型' => 'require|in:1,2',
        'total_amount|订单总金额' => 'require|egt:0.01',
        'payment_amount|支付金额' => 'require',
        'balance_amount|抵扣金额' => 'require|validateAmount',
        'product_id|商品' => 'require|validateProductId',
        'num|数量' => 'require|number|egt:1',
        'product_spec_id|商品规格' => 'require|validateProductSpecId',
        'photo_order_id|生图订单id' => 'require|validatePhotoOrderId',
        'address_id|收货地址' => 'require|validateAddressId',
        'id|订单id' => 'require|number',
        'status|订单状态' => 'require|in:1,2,3,4,5',
        'service_product_id|服务商品' => 'require|validateServiceProductId',
        'order_count|服务订单次数' => 'require|egt:1',
        'openid' => 'require'
    ];

    public function scenePrint(): OrdersValidate
    {
        return $this->only(['user_id', 'openid','order_type', 'total_amount', 'payment_amount', 'balance_amount',  'product_id', 'product_spec_id', 'num',  'address_id']);
    }

    public function sceneService()
    {
        return $this->only(['user_id', 'openid','order_type', 'total_amount', 'payment_amount', 'balance_amount','service_product_id', 'order_count']);
    }
    public function sceneUpdate(): OrdersValidate
    {
        return $this->only(['id']);
    }

    protected function validateUserId($value, $rule, $data): bool|string
    {
        /** 重复请求 */
        $nx = RequestHandle::preventRepeat('request:repeat:' . $value, 3);
        if (!$nx) return '请勿频繁操作';

        $user = UserModel::where('id', $value)->find();
        if (!$user) return '用户不存在';
        if (!$user['openid']) return '用户未绑定微信';

        return true;
    }

    protected function validateAmount($value, $rule, $data): bool|string
    {
        if (number_format($data['payment_amount'] + $value, 2) != number_format($data['total_amount'],2)) return "支付金额异常";
        if ($data['payment_amount'] < 0 || $data['balance_amount'] < 0) return '支付金额异常';

        $user = UserModel::where(['id' => $data['user_id']])->value("balance");
        if (!$user || $user < $value) return "余额不足";

        return true;
    }

    protected function validateProductId($value, $rule, $data): bool|string
    {
        global $OrderProduct;

        $product = ProductModel::where(['id' => $value, 'status' => 1])->find();
        if (!$product) return "商品不存在";

        $OrderProduct['product'] = $product->toArray();
        return true;
    }

    protected function validateProductSpecId($value, $rule, $data): bool|string
    {
        $obj = ProductSpecModel::where(['id' => $value, 'product_id' => $data['product_id'],'status' => 1])->find();
        if (!$obj) return "商品规格不存在";

        if ($obj['stock'] < $data['num']) return "库存不足";

        if (number_format($obj['price_adjustment'] * $data['num'], 2) != number_format($data['total_amount'],2)) return "商品价格与支付金额不匹配";

        global $OrderProduct;
        $OrderProduct['product_spec'] = $obj->toArray();
        return true;
    }

    protected function validatePhotoOrderId($value, $rule, $data): bool|string
    {
        if ($value > 0 && !PhotoOrderModel::where(['id' => $value, 'user_id' => $data['user_id']])->find()) return "生图订单不存在";

        return true;
    }

    protected function validateAddressId($value, $rule, $data): bool|string
    {
        if (!UserAddressModel::where(['id' => $value, 'user_id' => $data['user_id']])->find()) return "收货地址不存在";

        return true;
    }

    /**
     * 充值产品验证
     * @param $value
     * @param $rule
     * @param $data
     * @return bool|string
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    protected function validateServiceProductId($value, $rule, $data): bool|string
    {
        $service_product = ServiceProductModel::where('id', $value)->find();
        if (!$service_product) return "服务商品不存在";

        $product_price = number_format($service_product->price, 2);
        if ($product_price != number_format($data['total_amount'],2) || (
            $product_price != number_format($data['payment_amount'] + $data['balance_amount'],2)
            )) return "商品价格与支付金额不匹配";

        if ($service_product->status == 0) return "服务商品已下架";

        global $OrderProduct;
        $OrderProduct['service_product'] = $service_product->toArray();

        return true;
    }
}