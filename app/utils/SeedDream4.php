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
    public static function generateWithStyle($image, string $styleKey, string $userPrompt = '', string $size = '2k', float $strength = 0.6): array
    {
        // 验证风格是否有效
        $styleConfig = SeedDreamStyles::getStyleByKey($styleKey);
        if (!$styleConfig) {
            abort("无效的风格: {$styleKey}");
        }

        $client = new Client();

        // 基础提示词构建
        $finalPrompt = SeedDreamStyles::buildPrompt($styleKey, $userPrompt);

        // 构建图片集合
        $imageInput = [];

        // 1. 用户上传的图（Structure Reference）
        if (is_array($image)) {
            $imageInput = array_merge($imageInput, $image);
        } else {
            $imageInput[] = $image;
        }

        // 2. 风格参考图（Style Reference）
        if (isset($styleConfig['reference_images']) && is_array($styleConfig['reference_images'])) {
            $refImages = $styleConfig['reference_images'];
            if (!empty($refImages)) {
                // 将参考图加入输入列表
                $imageInput = array_merge($imageInput, $refImages);

                // 动态构建提示词前缀，明确图片角色
                // Image 1 (index 0) = Structure
                // Image 2..N = Style
                $structureRefIndex = 1;
                $styleRefStart = 2;
                $styleRefEnd = count($imageInput);

                $roleInstruction = "Image {$structureRefIndex} is the reference for composition and structure. Images {$styleRefStart} to {$styleRefEnd} are references for the artistic style.";
                $finalPrompt = $roleInstruction . " " . $finalPrompt;
            }
        }

        try {
            $json = [
                'model' => self::MODEL_ID,
                'prompt' => $finalPrompt,
                'size' => $size,
                'strength' => $strength,
                'watermark' => false,
                'response_format' => 'url',
            ];

            // 总是使用 image_urls (数组形式)
            $json['image_urls'] = $imageInput;

            $response = $client->post(self::BASE_URL . '/api/v3/images/generations', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . config('tos.ark_api_key'),
                ],
                'json' => $json,
            ]);

            $body = $response->getBody()->getContents();
            return json_decode($body, true);

        } catch (\Exception $e) {
            abort("请求失败: " . $e->getMessage());
        }
    }

    /**
     * 使用身份保持生成风格化图像 (LaLaMan 2.0)
     * 
     * 该方法在应用艺术风格的同时保持用户面部特征的一致性。
     * 
     * @param string $identityImage 用户自拍/人脸图片 URL (用于保持身份)
     * @param string $styleKey 风格 key (如 'ghibli', 'anime' 等)
     * @param string $userPrompt 用户自定义提示词（可选）
     * @param string $size 图像尺寸，默认 '2k'
     * @param float $controlStrength 身份保持强度 (0.0-1.0)，默认 0.6
     * @param float $refStrength 风格参考强度 (0.0-1.0)，默认 0.9
     * @return array API 响应
     */
    public static function generateWithIdentity(
        string $identityImage,
        string $styleKey,
        string $userPrompt = '',
        string $size = '2k',
        float $controlStrength = 0.6,
        float $refStrength = 0.9
    ): array {
        // 验证风格是否有效
        $styleConfig = SeedDreamStyles::getStyleByKey($styleKey);
        if (!$styleConfig) {
            abort("无效的风格: {$styleKey}");
        }

        $client = new Client();

        // 构建提示词
        $basePrompt = SeedDreamStyles::buildPrompt($styleKey, $userPrompt);

        // 添加身份保持指令
        $identityInstruction = "Maintain the facial features and identity of the person in Image 1. ";
        $finalPrompt = $identityInstruction . $basePrompt;

        // 构建图片输入数组
        // Image 1: Identity Reference (用户自拍)
        // Image 2+: Style Reference (风格参考图)
        $imageInput = [$identityImage];

        if (isset($styleConfig['reference_images']) && is_array($styleConfig['reference_images'])) {
            $refImages = $styleConfig['reference_images'];
            if (!empty($refImages)) {
                $imageInput = array_merge($imageInput, $refImages);

                $styleRefStart = 2;
                $styleRefEnd = count($imageInput);
                $roleInstruction = "Image 1 is the identity reference (keep face consistent). Images {$styleRefStart} to {$styleRefEnd} are style references. ";
                $finalPrompt = $roleInstruction . $finalPrompt;
            }
        }

        try {
            $json = [
                'model' => self::MODEL_ID,
                'prompt' => $finalPrompt,
                'image_urls' => $imageInput,
                'size' => $size,
                'control_strength' => $controlStrength,  // 身份保持强度
                'ref_strength' => $refStrength,          // 风格参考强度
                'watermark' => false,
                'response_format' => 'url',
            ];

            Log::channel('identity')->info('Identity Generation Request', [
                'style' => $styleKey,
                'identity_image' => $identityImage,
                'control_strength' => $controlStrength,
                'ref_strength' => $refStrength,
            ]);

            $response = $client->post(self::BASE_URL . '/api/v3/images/generations', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . config('tos.ark_api_key'),
                ],
                'json' => $json,
            ]);

            $body = $response->getBody()->getContents();
            $result = json_decode($body, true);

            Log::channel('identity')->info('Identity Generation Response', [
                'success' => isset($result['data'][0]['url']),
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::channel('identity')->error('Identity Generation Failed', [
                'error' => $e->getMessage(),
            ]);
            abort("身份保持生成失败: " . $e->getMessage());
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