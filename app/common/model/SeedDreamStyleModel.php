<?php
namespace app\common\model;

use think\Model;

/**
 * Seedream风格配置 模型
 *
 * @author LaLaMan
 */
class SeedDreamStyleModel extends Model
{
    // 表名
    protected $table = 'app_seed_dream_styles';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;

    // 创建时间字段
    protected $createTime = 'create_time';

    // 更新时间字段
    protected $updateTime = 'update_time';

    // JSON字段自动转换
    protected $json = ['reference_images', 'params'];

    // JSON字段转为数组
    protected $jsonAssoc = true;

    /**
     * key搜索器
     */
    public function searchKeyAttr($query, $value, $data)
    {
        if ($value !== '' && $value !== null) {
            $query->where('key', 'like', "%{$value}%");
        }
    }

    /**
     * name搜索器
     */
    public function searchNameAttr($query, $value, $data)
    {
        if ($value !== '' && $value !== null) {
            $query->where('name', 'like', "%{$value}%");
        }
    }

    /**
     * category搜索器
     */
    public function searchCategoryAttr($query, $value, $data)
    {
        if ($value !== '' && $value !== null) {
            $query->where('category', '=', $value);
        }
    }

    /**
     * is_active搜索器
     */
    public function searchIsActiveAttr($query, $value, $data)
    {
        if ($value !== '' && $value !== null) {
            $query->where('is_active', '=', $value);
        }
    }
}
