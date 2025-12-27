<?php
namespace app\admin\validate;

use app\common\model\CategoryModel;
use taoser\Validate;

/**
 * 风格样例 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class PhotoStyleValidate extends Validate
{

    // 验证规则
    protected $rule = [
//        'style_name|风格名称' => 'require',
        'cate_id|风格类别' => 'require|validCateId',
        'style_img|风格样例' => 'require',
//        'style_param|风格参数' => 'require',
        'sort|排序' => 'require',
    ];

    protected function validCateId($value, $rule, array $data = []): bool|string
    {
        if (!CategoryModel::where('id', $value)->find()) return '一级风格不存在';

        return true;
    }
}