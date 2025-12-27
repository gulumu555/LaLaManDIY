<?php
namespace app\api\validate;

use app\common\model\PhotoStyleModel;
use app\common\model\ProductModel;
use app\common\model\UserModel;
use app\utils\RequestHandle;
use taoser\Validate;

/**
 * 打印订单 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoOrderValidate extends Validate
{

    // 验证规则
    protected $rule = [
        'id|订单ID' => 'require',
        'name|生图名称' => 'require',
        'photo_style_id|风格ID' => 'require|validateStyle',
        'order_type|类型' => 'require|in:1,2',
        'user_id|user_id' => 'require|validateUser',
        'original_img|用户原图' => 'require',
        'product_id|产品ID' =>'require|validateProduct',
        'result_img|处理后图' => 'require',
        'is_strength|精度增强' => 'require|in:0,1',
    ];

    // base 基础
    public function sceneStyle(): PhotoOrderValidate
    {
        return $this->only(['name','photo_style_id', 'order_type', 'user_id',  'original_img', 'is_strength']);
    }

    public function sceneProduct(): PhotoOrderValidate
    {
        return $this->only(['name','product_id', 'order_type', 'user_id',  'original_img', 'is_strength']);
    }
    
    // edit 修改
    public function sceneUpdate(): PhotoOrderValidate
    {
        return $this->only(['id', 'result_img']);
    }


    protected function validateUser($value, $rule, $data): bool|string
    {
        $user = UserModel::where('id', $value)->find();
        if (!$user) return '用户不存在';

        if ($user['num_balance'] <= 0) return "可用次数不足";

        $nx = RequestHandle::preventRepeat('request:repeat:photo_order:' . $value, 3);
        if (!$nx) return '请勿操作过快...';

        return true;
    }

    protected function validateStyle($value, $rule, $data): bool|string
    {
        $OrderStyle = PhotoStyleModel::where('id', $value)->find();

        if (!$OrderStyle) return '风格不存在';

        global $PhotoOrderParam;
        $PhotoOrderParam = $OrderStyle->toArray();

        return true;
    }

    protected function validateProduct($value, $rule, $data): bool|string
    {
        $product = ProductModel::where('id', $value)->find();

        if (!$product) return '产品不存在';

        global $PhotoOrderParam;
        $PhotoOrderParam = $product->toArray();

        return true;
    }
}