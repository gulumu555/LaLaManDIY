<?php

namespace app\utils;

/**
 * LibLib 工作流风格预设管理
 * 
 * 包含 4 种个性化风格，基于 LibLib 平台的 LoRA/模型工作流：
 * - 轻次元厚涂风
 * - 韩系Q版时尚
 * - 2.5D皮肤质感
 * - 吉卜力水彩风
 * 
 * 注意：需要在 LibLib 平台创建对应工作流并获取 workflowUuid
 */
class LibLibStyles
{
    /**
     * 获取所有可用的 LibLib 风格
     * 
     * @return array
     */
    public static function getStyles(): array
    {
        return [
            // ========== 二次元/插画风格 ==========
            [
                'key' => 'thick_paint_2d',
                'name' => '轻次元厚涂',
                'name_en' => 'Light Dimension Thick Paint',
                'description' => '二次元光影厚涂效果，强化光影氛围和色彩',
                // TODO: 替换为实际的工作流 UUID
                'workflow_uuid' => 'YOUR_WORKFLOW_UUID_HERE',
                'model_version_uuid' => '22a9b999d9c94dbc8efbf451f5221605',
                // 稳定输出参数 - 避免随机性
                'stable_params' => [
                    'seed' => 42,           // 固定种子，确保可复现
                    'steps' => 40,          // 推荐步数
                    'cfg_scale' => 7.0,     // 推荐 CFG
                    'sampler' => 'euler_a', // Euler A 采样器
                    'denoise' => 0.6,       // 重绘幅度适中
                ],
                'sort' => 1,
            ],
            [
                'key' => 'korean_qversion',
                'name' => '韩系Q版时尚',
                'name_en' => 'Korean Q-style Fashion',
                'description' => '卡通风格角色设计，清新可爱，富有生活气息',
                // TODO: 替换为实际的工作流 UUID
                'workflow_uuid' => 'YOUR_WORKFLOW_UUID_HERE',
                'model_version_uuid' => 'a902b499f9ba432ba3b0e31f2ff369d4',
                'stable_params' => [
                    'seed' => 42,
                    'steps' => 30,
                    'cfg_scale' => 7.0,
                    'sampler' => 'euler_a',
                    'denoise' => 0.55,
                ],
                'sort' => 2,
            ],

            // ========== 2.5D/写实风格 ==========
            [
                'key' => 'skin_texture_25d',
                'name' => '2.5D皮肤质感',
                'name_en' => '2.5D Skin Texture',
                'description' => '写实2.5D动漫，主打皮肤质感，光线效果下质感突出',
                // TODO: 替换为实际的工作流 UUID
                'workflow_uuid' => 'YOUR_WORKFLOW_UUID_HERE',
                'model_version_uuid' => '7f7ba10440d540048def4d15857fd105',
                'stable_params' => [
                    'seed' => 42,
                    'steps' => 30,
                    'cfg_scale' => 5.0,     // 推荐 CFG 5.0
                    'sampler' => 'dpm++_2m_karras',
                    'denoise' => 0.5,
                ],
                'sort' => 3,
            ],

            // ========== 手绘/艺术风格 ==========
            [
                'key' => 'ghibli_watercolor',
                'name' => '吉卜力水彩',
                'name_en' => 'Ghibli Watercolor',
                'description' => '手绘水彩风格，清新自然，温暖治愈，童真奇幻',
                // TODO: 替换为实际的工作流 UUID
                'workflow_uuid' => 'YOUR_WORKFLOW_UUID_HERE',
                'model_version_uuid' => '59e6ea5b6bdd4608ba1a3b9a6945f230',
                'stable_params' => [
                    'seed' => 42,
                    'steps' => 35,
                    'cfg_scale' => 7.0,
                    'sampler' => 'euler_a',
                    'denoise' => 0.6,
                ],
                'sort' => 4,
            ],
        ];
    }

    /**
     * 根据 key 获取单个风格配置
     *
     * @param string $key
     * @return array|null
     */
    public static function getStyleByKey(string $key): ?array
    {
        $styles = self::getStyles();
        foreach ($styles as $style) {
            if ($style['key'] === $key) {
                return $style;
            }
        }
        return null;
    }

    /**
     * 获取风格的工作流 UUID
     *
     * @param string $key
     * @return string|null
     */
    public static function getWorkflowUuid(string $key): ?string
    {
        $style = self::getStyleByKey($key);
        return $style ? $style['workflow_uuid'] : null;
    }

    /**
     * 获取风格的稳定参数
     *
     * @param string $key
     * @return array|null
     */
    public static function getStableParams(string $key): ?array
    {
        $style = self::getStyleByKey($key);
        return $style ? $style['stable_params'] : null;
    }

    /**
     * 验证风格是否存在
     *
     * @param string $key
     * @return bool
     */
    public static function isValidStyle(string $key): bool
    {
        return self::getStyleByKey($key) !== null;
    }

    /**
     * 获取所有风格的简要列表（用于 API 返回）
     *
     * @return array
     */
    public static function getStyleList(): array
    {
        $styles = self::getStyles();
        return array_map(function ($style) {
            return [
                'key' => $style['key'],
                'name' => $style['name'],
                'name_en' => $style['name_en'],
                'description' => $style['description'],
            ];
        }, $styles);
    }
}
