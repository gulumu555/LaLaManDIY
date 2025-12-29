<?php
namespace app\admin\validate;

use think\Validate;

/**
 * Seedream风格配置 验证器
 *
 * @author LaLaMan
 */
class SeedDreamStyleValidate extends Validate
{
    protected $rule = [
        'key' => 'require|max:50|alphaDash',
        'name' => 'require|max:100',
        'category' => 'max:50',
        'prompt' => 'require',
    ];

    protected $message = [
        'key.require' => '风格标识不能为空',
        'key.max' => '风格标识最多50个字符',
        'key.alphaDash' => '风格标识只能是字母、数字、下划线和破折号',
        'name.require' => '风格名称不能为空',
        'name.max' => '风格名称最多100个字符',
        'category.max' => '分类最多50个字符',
        'prompt.require' => '提示词不能为空',
    ];

    protected $scene = [
        'create' => ['key', 'name', 'prompt'],
        'update' => ['name', 'prompt'],
    ];
}
