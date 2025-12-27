<?php
namespace app\admin\validate;

use app\common\model\ProductModel;
use taoser\Validate;

/**
 * 产品管理 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ProductValidate extends Validate
{

    // 验证规则
    protected $rule = [
        'id|产品ID' => 'require|number|validateId',
        'cate_id|分类ID' => 'require',
        'product_name|产品名称' => 'require',
        'main_image|产品图片' => 'require',
        'product_spec|产品规格' => 'validateProductSpec',
        'status|状态' => 'require|in:0,1',
    ];

    protected $scene = [
        'base' => ['cate_id', 'product_name', 'main_image', 'product_spec'],
        'edit' => ['id'],
        'status' => ['status']
    ];

    // 自定义验证规则
    protected function validateId($value, $rule, $data)
    {
        if (!ProductModel::find($value)) return '产品不存在';
        return true;
    }

    protected function validateProductSpec($value, $rule, $data)
    {
        if (!$value) return '请选择产品规格';
        foreach ($value as $item) {
            //if (!empty($data['id']) && empty($item['id'])) return "规格ID不能为空";

            if (empty($item['spec_name'])) return "规格名称不能为空";
            if (empty($item['price_adjustment'])) return "规格价格不能为空";
            //if (empty($item['accuracy_width']) && $data['cate_id'] != 4) return "规格精度（宽）应大于0";
            //if (empty($item['accuracy_height']) && $data['cate_id'] != 4) return "规格精度（高）应大于0";
            if (!isset($item['stock']) || ($item['stock'] < 0) ) return "规格库存至少为0";
            if (!isset($item['sort']) || $item['sort'] < 0) return "规格排序错误";
        }

        return true;
    }
}