<?php
namespace app\admin\validate;

use taoser\Validate;

/**
 * 支付配置 验证器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ServiceProductValidate extends Validate
{

    // 验证规则
    protected $rule = [
        'id|id' => 'require',
        'title|套餐名称' => 'require',
        'price|购买价格（元）' => 'require',
        'count|生效次数' => 'require',
        'show_price|原价（元）' => 'require',
        //'tip|标签' => 'require',
        'sort|排序' => 'require',
        'status|状态' => 'require',
    ];

    // create 新增
    public function sceneCreate()
    {
        return $this->only(['title', 'price', 'count', 'show_price', 'tip', 'sort', 'status']);
    }
    
    // update 修改
    public function sceneUpdate()
    {
        return $this->only(['id', 'title', 'price', 'count', 'show_price', 'tip', 'sort']);
    }
    
}