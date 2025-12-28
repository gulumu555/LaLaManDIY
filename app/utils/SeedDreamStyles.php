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
        return [
            // ========== 动画/插画风格 ==========
            [
                'key' => 'ghibli',
                'name' => '吉卜力',
                'name_en' => 'Studio Ghibli',
                'prompt' => 'Studio Ghibli anime style, Hayao Miyazaki art style, soft watercolor background, whimsical and dreamy atmosphere, hand-drawn animation, warm colors, natural lighting, detailed environment, nostalgic and magical feeling',
                'sort' => 1,
            ],
            [
                'key' => 'shinkai',
                'name' => '新海诚',
                'name_en' => 'Makoto Shinkai',
                'prompt' => 'Makoto Shinkai anime style, Your Name movie style, stunning sky and clouds, vibrant colors, detailed backgrounds, dramatic lighting, lens flare, photorealistic environment with anime characters, emotional atmosphere, cinematic composition',
                'sort' => 2,
            ],
            [
                'key' => 'pixar',
                'name' => '皮克斯',
                'name_en' => 'Pixar',
                'prompt' => 'Pixar 3D animation style, Disney Pixar character design, smooth skin texture, big expressive eyes, colorful and vibrant, high quality 3D render, soft lighting, detailed facial features, cute and appealing character design',
                'sort' => 3,
            ],
            [
                'key' => 'disney',
                'name' => '迪士尼',
                'name_en' => 'Disney',
                'prompt' => 'Disney animation style, classic Disney princess aesthetic, magical and enchanting, beautiful character design, soft and warm lighting, fairy tale atmosphere, expressive eyes, elegant and graceful, colorful and dreamy',
                'sort' => 4,
            ],
            [
                'key' => 'jimmy',
                'name' => '几米',
                'name_en' => 'Jimmy Liao',
                'prompt' => 'Jimmy Liao illustration style, soft grainy texture, muted watercolor and pastel colors, dreamy atmosphere, gentle brush strokes, simplistic hand-drawn art, clean composition, high quality art, keep original composition',
                'sort' => 5,
            ],

            // ========== 经典艺术风格 ==========
            [
                'key' => 'oil_painting',
                'name' => '油画',
                'name_en' => 'Oil Painting',
                'prompt' => 'oil painting style, thick brushstrokes, classical art, rich colors, canvas texture, masterpiece quality, museum artwork, traditional painting technique',
                'sort' => 6,
            ],
            [
                'key' => 'watercolor',
                'name' => '水彩画',
                'name_en' => 'Watercolor',
                'prompt' => 'watercolor painting, soft edges, flowing colors, paper texture, delicate, artistic, transparent layers, wet-on-wet technique, gentle and dreamy',
                'sort' => 7,
            ],
            [
                'key' => 'sketch',
                'name' => '素描',
                'name_en' => 'Sketch',
                'prompt' => 'pencil sketch, hand-drawn, detailed lines, graphite, artistic drawing, black and white, shading technique, fine art quality',
                'sort' => 8,
            ],
            [
                'key' => 'pixel_art',
                'name' => '像素艺术',
                'name_en' => 'Pixel Art',
                'prompt' => 'pixel art style, 16-bit retro game, nostalgic, low resolution aesthetic, vibrant colors, clean pixels, video game art, 8-bit inspired',
                'sort' => 9,
            ],
            [
                'key' => 'impressionist',
                'name' => '印象派',
                'name_en' => 'Impressionist',
                'prompt' => 'impressionist painting style, Monet inspired, visible brushstrokes, light and color focus, outdoor scenes, atmospheric, soft edges, artistic interpretation',
                'sort' => 10,
            ],
            [
                'key' => 'chinese_ink',
                'name' => '国风水墨',
                'name_en' => 'Chinese Ink',
                'prompt' => 'Chinese ink wash painting, traditional Chinese art style, elegant brushwork, minimalist, zen atmosphere, rice paper texture, black ink with subtle colors, poetic and serene',
                'sort' => 11,
            ],
            [
                'key' => 'pop_art',
                'name' => '波普艺术',
                'name_en' => 'Pop Art',
                'prompt' => 'pop art style, Andy Warhol inspired, bold colors, comic book dots, high contrast, vibrant and eye-catching, graphic design aesthetic, modern art',
                'sort' => 12,
            ],
            [
                'key' => 'ghibli_watercolor',
                'name' => '吉卜力水彩',
                'name_en' => 'Ghibli Watercolor',
                'prompt' => 'Studio Ghibli style, hand-painted watercolor medium, heavy watercolor texture, fresh and natural atmosphere, soft warm lighting, transparent watercolor tones, delicate brushstrokes, visible paper texture, wet-on-wet technique, healing and serene, high quality art, anime style, keep original composition, faithful to original content',
                'sort' => 13,
            ],
        ];
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
