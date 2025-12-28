<?php

namespace app\utils;

use GuzzleHttp\Client;
use support\Log;

class LibLibAi
{

    /**
     * 替换模板中的变量
     */
    public static function replaceTemplateVariables($template, $image_url, $prompt)
    {
        $prompt = preg_replace('/\s+/', '', $prompt);
        // 将模板转换为JSON字符串进行替换
        $templateJson = json_encode($template);
        $templateJson = str_replace('$image_url', $image_url, $templateJson);
        $templateJson = str_replace('$prompt', $prompt, $templateJson);

        return json_decode($templateJson, true);
    }

    public static function createTask($templateJson, $image_url, $prompt)
    {
        try {
            $url = "/api/generate/comfyui/app";

            $client = new Client();

            // 如果传入的是JSON字符串，先解码
            if (is_string($templateJson)) {
                $template = json_decode($templateJson, true);
            } else {
                $template = $templateJson;
            }
            // 替换变量
            $generateParams = self::replaceTemplateVariables($template, $image_url, $prompt);

            $send_url = getenv("LIBLIB_BASE_URL") . $url . "?" . self::generateSign($url);


            $response = $client->post($send_url, [
                "headers" => [
                    "Content-Type" => "application/json",
                ],
                "json" => [
                    "generateParams" => $generateParams
                ]
            ]);

            $result = $response->getBody()->getContents();

            return json_decode($result, true);
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
    }


    public static function selectTask($generateUuid)
    {
        try {
            $url = "/api/generate/comfy/status";

            $client = new Client();

            $response = $client->post(getenv("LIBLIB_BASE_URL") . $url . "?" . self::generateSign($url), [
                "headers" => [
                    "Content-Type" => "application/json",
                ],
                "json" => [
                    "generateUuid" => $generateUuid,
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
    }


    private static function generateSign($url): string
    {
        $timestamp = round(microtime(true) * 1000);

        $signature_nonce = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);

        $content = "{$url}&{$timestamp}&{$signature_nonce}";

        $hash = hash_hmac('sha1', $content, getenv("LIBLIB_SECRET_KEY"), true);

        // Base64 URL 安全编码（Java里的 Base64.encodeBase64URLSafeString）
        $signature = rtrim(strtr(base64_encode($hash), '+/', '-_'), '=');

        $access_key = getenv("LIBLIB_ACCESS_KEY");
        return "AccessKey={$access_key}&Signature={$signature}&Timestamp={$timestamp}&SignatureNonce={$signature_nonce}";
    }

    public static function enlarge($param)
    {
        try {
            $url = "/api/generate/comfyui/app";

            $client = new Client();

            $send_url = getenv("LIBLIB_BASE_URL") . $url . "?" . self::generateSign($url);

            $response = $client->post($send_url, [
                "headers" => [
                    "Content-Type" => "application/json",
                ],
                "json" => [
                    "generateParams" => [
                        "workflowUuid" => "c0cd3b795a8a447f8a1b9ed864ecd586",
                        "48" => [
                            "class_type" => "LoadImage",
                            "inputs" => [
                                "image" => $param["url"]
                            ]
                        ],
                        "21" => [
                            "class_type" => "UltimateSDUpscale",
                            "inputs" => [
                                "upscale_by" => 10,
                                "denoise" => 0.25
                            ]
                        ]
                    ]
                ]
            ]);

            $result = $response->getBody()->getContents();

            return json_decode($result, true);
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
    }

    /**
     * 使用 LibLib 预设风格生成图像（图生图）
     * 
     * @param string $imageUrl 输入图片 URL
     * @param string $styleKey 风格 key (如 'thick_paint_2d', 'korean_qversion' 等)
     * @param string $prompt 额外的提示词（可选）
     * @return array API 响应，包含 generateUuid
     */
    public static function generateWithStyle(string $imageUrl, string $styleKey, string $prompt = ''): array
    {
        // 验证风格是否有效
        if (!LibLibStyles::isValidStyle($styleKey)) {
            abort("无效的风格: {$styleKey}");
        }

        $style = LibLibStyles::getStyleByKey($styleKey);
        $workflowUuid = $style['workflow_uuid'];
        $stableParams = $style['stable_params'];

        // 检查是否已配置工作流 UUID
        if ($workflowUuid === 'YOUR_WORKFLOW_UUID_HERE') {
            abort("风格 {$styleKey} 的工作流 UUID 尚未配置，请在 LibLibStyles.php 中设置");
        }

        try {
            $url = "/api/generate/comfyui/app";
            $client = new \GuzzleHttp\Client();
            $sendUrl = getenv("LIBLIB_BASE_URL") . $url . "?" . self::generateSign($url);

            // 构建生成参数，使用稳定参数确保输出一致性
            $generateParams = [
                'workflowUuid' => $workflowUuid,
                // 输入图片节点 - 具体节点 ID 需要根据实际工作流调整
                'input_image' => [
                    'class_type' => 'LoadImage',
                    'inputs' => [
                        'image' => $imageUrl,
                    ]
                ],
                // 稳定参数 - 确保可复现的输出
                'sampler' => [
                    'class_type' => 'KSampler',
                    'inputs' => [
                        'seed' => $stableParams['seed'],
                        'steps' => $stableParams['steps'],
                        'cfg' => $stableParams['cfg_scale'],
                        'sampler_name' => $stableParams['sampler'],
                        'denoise' => $stableParams['denoise'],
                    ]
                ],
            ];

            // 如果有额外提示词，添加到参数中
            if (!empty($prompt)) {
                $generateParams['prompt_text'] = [
                    'class_type' => 'CLIPTextEncode',
                    'inputs' => [
                        'text' => $prompt,
                    ]
                ];
            }

            $response = $client->post($sendUrl, [
                "headers" => [
                    "Content-Type" => "application/json",
                ],
                "json" => [
                    "generateParams" => $generateParams
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            // 添加使用的风格信息到返回结果
            $result['style_used'] = [
                'key' => $styleKey,
                'name' => $style['name'],
            ];

            return $result;

        } catch (\Exception $e) {
            abort("LibLib 风格生成失败: " . $e->getMessage());
        }
    }

    /**
     * 获取所有可用的 LibLib 风格列表
     * 
     * @return array 风格列表
     */
    public static function getAvailableStyles(): array
    {
        return LibLibStyles::getStyleList();
    }
}