<?php

namespace app\utils;

use GuzzleHttp\Client;
use support\Log;
use Volc\Service\ImageX\V2\Imagex;

class SeedDream4
{
    private const BASE_URL = 'https://ark.cn-beijing.volces.com';

    // Seedream 4.5 模型 ID
    private const MODEL_ID = 'doubao-seedream-4-5-251128';

    private static $instance = null;

    private const QUEQUE_ID = '69114106e631582bc67863f2';

    private const SERVICE_ID = 'pjip7c9xwg';

    public static function send($image)
    {
        $client = new Client();

        $prompt = base64_decode(getenv('MULTI_FACE_PROMPT'));

        try {
            $response = $client->post(self::BASE_URL . '/api/v3/images/generations', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . config('tos.ark_api_key'),
                ],
                'json' => [
                    'model' => self::MODEL_ID,
                    'prompt' => $prompt,
                    'image' => $image,
                    'sequential_image_generation' => 'auto',   // 先注释掉
                    'sequential_image_generation_options' => [
                        'max_images' => 4,
                    ],
                    'response_format' => 'url',
                    'size' => '2k',   // 改成标准格式
                    'stream' => false,       // 先去掉
                    'watermark' => false,
                ],
            ]);

            // 获取响应内容
            $body = $response->getBody()->getContents();
            return json_decode($body, true);

        } catch (\Exception $e) {
            Log::channel('multi')->error($image . " " . $e->getMessage());
            abort("请求失败: " . $e->getMessage());
        }
    }

    public static function singleSend($image, $prompt = '')
    {
        $client = new Client();

        $prompt = $prompt ?: base64_decode(getenv('IMAGE_ENLARGE_PROMPT'));
        try {
            $response = $client->post(self::BASE_URL . '/api/v3/images/generations', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . config('tos.ark_api_key'),
                ],
                'json' => [
                    'model' => self::MODEL_ID,
                    'prompt' => $prompt,
                    //'image' => 'https://ark-auto-2107415805-cn-beijing-default.tos-cn-beijing.volces.com/upload/20250703/pexels-mostafasanadd-868113.jpg',
                    'image' => $image,
                    'size' => '4k',   // 改成标准格式
                    'watermark' => false,
                    'response_format' => 'url',
                    'seed' => -1
                ],
            ]);

            // 获取响应内容
            $body = $response->getBody()->getContents();
            return json_decode($body, true);

        } catch (\Exception $e) {
            abort("请求失败: " . $e->getMessage());
        }
    }

    /**
     * 使用预设风格生成图像
     * 
     * @param string $image 参考图片 URL
     * @param string $styleKey 风格 key (如 'cyberpunk', 'anime', 'oil_painting' 等)
     * @param string $userPrompt 用户自定义提示词（可选，会与风格提示词组合）
     * @param string $size 图像尺寸，默认 '2k'
     * @return array API 响应
     */
    public static function generateWithStyle(string $image, string $styleKey, string $userPrompt = '', string $size = '2k'): array
    {
        // 验证风格是否有效
        if (!SeedDreamStyles::isValidStyle($styleKey)) {
            abort("无效的风格: {$styleKey}");
        }

        $client = new Client();

        // 构建完整提示词
        $prompt = SeedDreamStyles::buildPrompt($styleKey, $userPrompt);

        try {
            $response = $client->post(self::BASE_URL . '/api/v3/images/generations', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . config('tos.ark_api_key'),
                ],
                'json' => [
                    'model' => self::MODEL_ID,
                    'prompt' => $prompt,
                    'image' => $image,
                    'size' => $size,
                    'watermark' => false,
                    'response_format' => 'url',
                ],
            ]);

            $body = $response->getBody()->getContents();
            return json_decode($body, true);

        } catch (\Exception $e) {
            abort("请求失败: " . $e->getMessage());
        }
    }

    /**
     * 获取所有可用风格列表
     * 
     * @return array 风格列表
     */
    public static function getAvailableStyles(): array
    {
        return SeedDreamStyles::getStyles();
    }


    public static function initImagex()
    {
        if (self::$instance === null) {
            $config = config('tos.client');

            $client = Imagex::getInstance();

            $client->setAccessKey($config['ak']);
            $client->setSecretKey($config['sk']);

            self::$instance = $client;
        }

        return self::$instance;
    }

    /**
     * 创建任务队列
     * @return mixed|void
     * @throws \Exception
     */
    public static function createQueue()
    {
        try {
            $client = self::initImagex();

            $body = [
                'Name' => 'super_resolution',
                'IsStart' => true,
                'Attribute' => 'super_resolution'
            ];

            $response = $client->request('CreateImageAIProcessQueue', ['json' => $body]);

            $result = json_decode($response->getBody()->getContents(), true);

            if (isset($result['Result']['QueueId'])) {
                return $result['Result']['QueueId'];
            } else {
                throw new \Exception(json_encode($result));
            }
        } catch (\Exception $e) {
            abort('queque error:' . $e->getMessage());
        }
    }

    public static function imageX2($image, $order_item_id)
    {
        try {
            $client = self::initImagex();

            $body = [
                "ServiceId" => self::SERVICE_ID,
                "WorkflowTemplateId" => "system_workflow_sr",
                "WorkflowParameter" => json_encode([
                    "SrParam" => [
                        "Mode" => 0,
                        "Multiple" => 5,
                        "ShortMin" => 16,
                        "ShortMax" => 1440,
                        "LongMin" => 16,
                        "LongMax" => 2160,
                        "Policy" => 0,
                        "SharpRatio" => 0.2,
                        "DenoiseRatio" => 0.3
                    ]
                ]),
                "DataType" => "url",
                "DataList" => [$image],
                "CallbackConf" => [
                    'Method' => 'HTTP',
                    'Endpoint' => config('superadminx.url') . '/api/ImageX/callback',
                    'DataFormat' => 'JSON',
                    'Args' => "order_item_id_{$order_item_id}"
                ],
                'QueueId' => self::QUEQUE_ID
            ];


            $response = $client->request('CreateImageAITask', ['json' => $body]);

            $result = json_decode($response->getBody()->getContents(), true);

            return $result;
        } catch (\Exception $e) {

            abort($e->getMessage());
        }
    }

    public static function concatUrl($uri)
    {
        if (strrpos($uri, '_png') !== false) {
            $uri = str_replace('_png', '.png', $uri);
        }
        return "http://imagexauth.lalaman.cn/{$uri}~tplv-pjip7c9xwg-imagex.png";
    }
}