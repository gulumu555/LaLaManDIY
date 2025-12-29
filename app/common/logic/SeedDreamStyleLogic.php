<?php
namespace app\common\logic;

use app\common\model\SeedDreamStyleModel;
use app\admin\validate\SeedDreamStyleValidate;
use think\facade\Db;

/**
 * Seedream风格配置 逻辑层
 *
 * @author LaLaMan
 */
class SeedDreamStyleLogic
{
    /**
     * 列表
     * @param array $params get参数
     */
    public static function getList(array $params = [])
    {
        // 排序
        $orderBy = "sort desc,id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
            $orderBy = "{$params['orderBy']},{$orderBy}";
        }

        $list = SeedDreamStyleModel::withSearch(['key', 'name', 'category', 'is_active'], $params)
            ->order($orderBy);

        return $list->paginate($params['pageSize'] ?? 20);
    }

    /**
     * 新增
     * @param array $params
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            validate(SeedDreamStyleValidate::class)->check($params);

            // 处理JSON字段
            if (isset($params['reference_images']) && is_string($params['reference_images'])) {
                $params['reference_images'] = json_decode($params['reference_images'], true);
            }
            if (isset($params['params']) && is_string($params['params'])) {
                $params['params'] = json_decode($params['params'], true);
            }

            SeedDreamStyleModel::create($params);

            // 清除缓存
            self::clearCache();

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }

    /**
     * 获取数据
     * @param int $id 数据id
     */
    public static function findData(int $id)
    {
        return SeedDreamStyleModel::find($id);
    }

    /**
     * 更新
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(SeedDreamStyleValidate::class)->check($params);

            // 处理JSON字段
            if (isset($params['reference_images']) && is_string($params['reference_images'])) {
                $params['reference_images'] = json_decode($params['reference_images'], true);
            }
            if (isset($params['params']) && is_string($params['params'])) {
                $params['params'] = json_decode($params['params'], true);
            }

            SeedDreamStyleModel::update($params);

            // 清除缓存
            self::clearCache();

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }

    /**
     * 删除
     * @param int|array $id 要删除的id
     */
    public static function delete(int|array $id)
    {
        SeedDreamStyleModel::destroy($id);
        self::clearCache();
    }

    /**
     * 更新状态
     */
    public static function updateStatus(mixed $post)
    {
        $id = $post['id'];
        $field = $post['field'] ?? 'is_active';
        $value = $post['value'] ?? $post['status'] ?? 0;

        SeedDreamStyleModel::update([$field => $value], ['id' => $id]);
        self::clearCache();

        return true;
    }

    /**
     * 获取所有可用风格 (for API)
     */
    public static function getActiveStyles(): array
    {
        return SeedDreamStyleModel::where('is_active', 1)
            ->order('sort desc, id desc')
            ->select()
            ->toArray();
    }

    /**
     * 获取分类列表
     */
    public static function getCategories(): array
    {
        return [
            ['id' => 'anime', 'name' => '动漫'],
            ['id' => 'painting', 'name' => '绘画'],
            ['id' => 'mixed', 'name' => '混合'],
            ['id' => 'general', 'name' => '通用'],
        ];
    }

    /**
     * 清除风格缓存
     */
    private static function clearCache(): void
    {
        try {
            if (class_exists('support\Cache')) {
                \support\Cache::delete('seed_dream_styles_list_v1');
            }
        } catch (\Exception $e) {
            // Ignore cache errors
        }
    }
}
