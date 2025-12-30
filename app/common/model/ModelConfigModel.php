<?php
namespace app\common\model;

use think\Model;

/**
 * AI模型配置 Model
 * 
 * 用于管理可用的AI生成模型（Seedream等）
 */
class ModelConfigModel extends BaseModel
{
    protected $name = 'model_config';

    protected $autoWriteTimestamp = true;

    // JSON字段
    protected $json = ['params'];

    protected $type = [
        'params' => 'json',
        'is_active' => 'integer',
        'is_default' => 'integer',
    ];

    /**
     * 获取当前激活的默认模型
     */
    public static function getDefaultModel(): ?array
    {
        $model = self::where('is_active', 1)
            ->where('is_default', 1)
            ->find();
        return $model ? $model->toArray() : null;
    }

    /**
     * 获取所有激活的模型列表
     */
    public static function getActiveModels(): array
    {
        return self::where('is_active', 1)
            ->order('sort', 'desc')
            ->select()
            ->toArray();
    }

    /**
     * 设置某个模型为默认
     */
    public static function setAsDefault(int $id): bool
    {
        // 先清除其他默认
        self::where('is_default', 1)->update(['is_default' => 0]);
        // 设置新默认
        return self::where('id', $id)->update(['is_default' => 1]) > 0;
    }
}
