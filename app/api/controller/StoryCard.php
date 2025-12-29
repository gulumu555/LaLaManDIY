<?php
namespace app\api\controller;

use support\Request;
use support\Cache;
use app\utils\SeedDream4;
use app\utils\SeedDreamStyles;

/**
 * 故事图卡片控制器 - LaLaMan 2.0
 * 
 * 功能：
 * - 获取模板列表
 * - 生成一格/多格故事图
 * - AI生成文案
 */
class StoryCard
{
    /**
     * 获取故事模板列表（首页用）
     * GET /api/StoryCard/templates
     */
    public function templates(Request $request)
    {
        $cacheKey = 'story_templates';
        $templates = Cache::get($cacheKey);

        if (!$templates) {
            // 默认模板数据（后续可从数据库加载）
            $templates = [
                [
                    'id' => 1,
                    'title' => '成都之旅',
                    'location' => 'CHENGDU · TAIKOO LI',
                    'time' => date('Y.m.d'),
                    'caption' => '这一格，是我们在成都留下的。',
                    'imageUrl' => 'https://p3-sign.toutiaoimg.com/tos-cn-i-qvj2lq49k0/example1.jpg',
                    'intent' => 'memory',
                    'style' => 'ghibli_watercolor'
                ],
                [
                    'id' => 2,
                    'title' => '日常记录',
                    'location' => 'SOMEWHERE',
                    'time' => 'TODAY',
                    'caption' => '有些日子，值得被记住。',
                    'imageUrl' => 'https://p3-sign.toutiaoimg.com/tos-cn-i-qvj2lq49k0/example2.jpg',
                    'intent' => 'moment',
                    'style' => 'jimmy'
                ],
                [
                    'id' => 3,
                    'title' => '四格漫画',
                    'location' => 'MY LIFE',
                    'time' => 'EVERYDAY',
                    'caption' => '生活的小确幸。',
                    'imageUrl' => 'https://p3-sign.toutiaoimg.com/tos-cn-i-qvj2lq49k0/example3.jpg',
                    'intent' => 'story',
                    'style' => 'disney',
                    'panels' => 4
                ],
            ];

            Cache::set($cacheKey, $templates, 3600);
        }

        return json(['code' => 1, 'data' => $templates, 'msg' => 'success']);
    }

    /**
     * 生成故事图
     * POST /api/StoryCard/generate
     * 
     * @param string styleKey 风格标识
     * @param string intent 表达意图 (moment/story/memory/series)
     * @param int panelCount 格数 (1/2/3/4/6/9)
     * @param string identityImage 用户照片URL（可选）
     * @param string location 位置文本
     * @param float latitude 纬度
     * @param float longitude 经度
     */
    public function generate(Request $request)
    {
        $styleKey = $request->post('styleKey', 'ghibli_watercolor');
        $intent = $request->post('intent', 'memory');
        $panelCount = intval($request->post('panelCount', 1));
        $identityImage = $request->post('identityImage', '');
        $location = $request->post('location', '');
        $latitude = floatval($request->post('latitude', 0));
        $longitude = floatval($request->post('longitude', 0));

        // 验证格数
        $validPanels = [1, 2, 3, 4, 6, 9];
        if (!in_array($panelCount, $validPanels)) {
            $panelCount = 1;
        }

        try {
            // 获取风格配置
            $stylePrompt = SeedDreamStyles::getStylePrompt($styleKey);
            if (!$stylePrompt) {
                $stylePrompt = 'Studio Ghibli watercolor style, soft pastel colors, warm lighting';
            }

            // 获取风格的参考图片
            $styleData = SeedDreamStyles::getStyleByKey($styleKey);
            $referenceImages = $styleData ? ($styleData['reference_images'] ?? []) : [];

            // 根据意图生成基础提示词
            $basePrompt = $this->getIntentPrompt($intent, $panelCount);
            $fullPrompt = $basePrompt . ', ' . $stylePrompt;

            // 生成图片
            $images = [];
            $seedDream = new SeedDream4();

            for ($i = 0; $i < $panelCount; $i++) {
                // 如果有身份照片，使用身份保持生成
                if ($identityImage) {
                    $result = $seedDream->generateWithIdentity(
                        $fullPrompt,
                        $identityImage,
                        $referenceImages
                    );
                } else {
                    $result = $seedDream->generateWithStyle(
                        $fullPrompt,
                        $styleKey
                    );
                }

                if ($result && isset($result['imageUrl'])) {
                    $images[] = $result['imageUrl'];
                }
            }

            if (empty($images)) {
                throw new \Exception('图片生成失败');
            }

            // 如果多格，需要拼接图片
            $finalImageUrl = $images[0];
            if ($panelCount > 1 && count($images) >= $panelCount) {
                $finalImageUrl = $this->composePanelImage($images, $panelCount);
            }

            // 生成唯一ID
            $resultId = uniqid('story_');

            // 缓存结果
            Cache::set('story_result_' . $resultId, [
                'id' => $resultId,
                'imageUrl' => $finalImageUrl,
                'images' => $images,
                'panelCount' => $panelCount,
                'style' => $styleKey,
                'intent' => $intent,
                'location' => $location,
                'createdAt' => date('Y-m-d H:i:s')
            ], 86400);

            return json([
                'code' => 1,
                'data' => [
                    'id' => $resultId,
                    'imageUrl' => $finalImageUrl,
                    'images' => $images,
                    'panelCount' => $panelCount
                ],
                'msg' => 'success'
            ]);

        } catch (\Exception $e) {
            return json([
                'code' => 0,
                'msg' => '生成失败: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 生成/刷新一句话文案
     * POST /api/StoryCard/caption
     * 
     * @param string city 城市
     * @param string time 时间
     * @param string relation 关系 (self/couple/family)
     * @param string emotion 情绪 (happy/sad/memory/calm)
     */
    public function caption(Request $request)
    {
        $city = $request->post('city', '');
        $time = $request->post('time', '');
        $relation = $request->post('relation', 'self');
        $emotion = $request->post('emotion', 'memory');

        // 文案模板库
        $captions = $this->getCaptionTemplates($relation, $emotion);

        // 随机选择一个
        $caption = $captions[array_rand($captions)];

        // 替换变量
        $caption = str_replace('{city}', $city, $caption);
        $caption = str_replace('{time}', $time, $caption);

        return json([
            'code' => 1,
            'data' => ['caption' => $caption],
            'msg' => 'success'
        ]);
    }

    /**
     * 根据意图获取提示词
     */
    private function getIntentPrompt(string $intent, int $panelCount): string
    {
        $prompts = [
            'moment' => 'A single moment captured, peaceful scene, one person in a cozy setting',
            'story' => 'Comic panel style, sequential storytelling, expressive characters',
            'memory' => 'Nostalgic photograph style, warm memory, soft dreamy atmosphere',
            'series' => 'Series of connected scenes, photo collection style, cohesive theme'
        ];

        $base = $prompts[$intent] ?? $prompts['memory'];

        // 根据格数调整提示词
        if ($panelCount == 1) {
            $base .= ', single panel artwork, centered composition';
        } elseif ($panelCount <= 4) {
            $base .= ', manga style panels, clear panel division';
        } else {
            $base .= ', photo grid style, consistent color palette';
        }

        return $base;
    }

    /**
     * 获取文案模板
     */
    private function getCaptionTemplates(string $relation, string $emotion): array
    {
        $templates = [
            'self' => [
                'memory' => [
                    '这一格，是我留给自己的。',
                    '这一刻，没有什么需要解释。',
                    '那天其实很普通，但我记住了。',
                    '有些画面，值得被留住。',
                    '在{city}，时间慢了一点。',
                    '不是每个瞬间都会被记住，但这个会。',
                    '走过的路，都会变成故事。',
                    '{time}，我在这里。'
                ],
                'happy' => [
                    '今天心情不错！',
                    '生活偶尔也会给点甜。',
                    '这一刻，很值得。',
                    '快乐的时候就要记录下来。'
                ],
                'calm' => [
                    '安静的日子也很好。',
                    '不说话也挺好的。',
                    '发呆也是一种生活方式。',
                    '慢下来，看看风景。'
                ]
            ],
            'couple' => [
                'memory' => [
                    '这一格，是我们在{city}留下的。',
                    '和你在一起的每一天，都值得记录。',
                    '我们的故事，从这里开始。',
                    '有你的日子，都是好日子。',
                    '在{city}，想起和你的第一次。'
                ]
            ],
            'family' => [
                'memory' => [
                    '家人在的地方，就是家。',
                    '这一格，属于我们全家。',
                    '记录这平凡又幸福的一刻。',
                    '有家人的陪伴，哪里都是风景。'
                ]
            ]
        ];

        $relationTemplates = $templates[$relation] ?? $templates['self'];
        $emotionTemplates = $relationTemplates[$emotion] ?? $relationTemplates['memory'];

        return $emotionTemplates;
    }

    /**
     * 拼接多格图片
     * TODO: 实现图片拼接逻辑
     */
    private function composePanelImage(array $images, int $panelCount): string
    {
        // 暂时返回第一张图片
        // TODO: 使用GD库或Imagick拼接图片
        return $images[0];
    }
}
