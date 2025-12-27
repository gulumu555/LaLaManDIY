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

    public static function createTask($templateJson, $image_url,$prompt)
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
}