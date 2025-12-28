<?php

namespace app\utils;

/**
 * Seedream 4.5 风格预设管理
 * 
 * 包含 12 种精选风格：
 * - 5 种动画/插画风格
 * - 7 种经典艺术风格
 */
class SeedDreamStyles
{
    /**
     * 获取所有可用风格
     */
    public static function getStyles(): array
    {
        // Simple cache key
        $cacheKey = 'seed_dream_styles_list_v1';
        try {
            // 尝试从缓存获取
            if (class_exists('support\Cache') && $cached = \support\Cache::get($cacheKey)) {
                return $cached;
            }

            $styles = \app\model\SeedDreamStyle::where('is_active', 1)
                ->order('sort', 'asc')
                ->select()
                ->toArray();

            if (!empty($styles) && class_exists('support\Cache')) {
                // 缓存 5 分钟
                \support\Cache::set($cacheKey, $styles, 300);
            }

            return $styles ?: [];
        } catch (\Throwable $e) {
            // Log error but fallback to empty or critical log
            if (class_exists('support\Log')) {
                \support\Log::error("Failed to fetch styles from DB: " . $e->getMessage());
            }
            return [];
        }
    }

    /**
     * 根据 key 获取单个风格
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
     * 获取风格的提示词
     */
    public static function getStylePrompt(string $key): ?string
    {
        $style = self::getStyleByKey($key);
        return $style ? $style['prompt'] : null;
    }

    /**
     * 构建完整提示词（风格 + 用户输入）
     */
    public static function buildPrompt(string $styleKey, string $userPrompt = ''): string
    {
        $stylePrompt = self::getStylePrompt($styleKey);
        if (!$stylePrompt) {
            return $userPrompt;
        }

        if (empty($userPrompt)) {
            return $stylePrompt;
        }

        return $userPrompt . ', ' . $stylePrompt;
    }

    /**
     * 验证风格是否存在
     */
    public static function isValidStyle(string $key): bool
    {
        return self::getStyleByKey($key) !== null;
    }
}
