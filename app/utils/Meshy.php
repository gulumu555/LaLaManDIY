<?php

namespace app\utils;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class Meshy
{

    private const API_BASE_URL = 'https://api.meshy.ai/openapi/v1/';
    private const API_KEY = 'msy_dummy_api_key_for_test_mode_12345678';


    private static function sendRequest($endpoint, $options)
    {
        try {
            $options['headers'] = [
                'Authorization' => 'Bearer '. self::API_KEY,
                'Content-Type' => 'application/json'
            ];

            $response = (new Client())->post(self::API_BASE_URL . $endpoint, $options);

            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (GuzzleException $e) {

            abort($e->getMessage());
        }
    }

    public static function to3DTask($image_url)
    {
        $options = [
            'json' => [
                'image_url' => $image_url,
                'ai_model' => 'meshy-4',
                'enable_pbr' => true, // 生成PBR贴图（金属度、粗糙度、法线）以及基础色。
                'should_remesh' => true, // 重新网格化模型，以获得更好的精度。
                'should_texture' => true, //是否生成贴图
                //'texture_prompt' => '', //提供文本提示以引导贴图生成。最多600字符。
                'texture_image_url' => $image_url, //贴图  texture_prompt 二选一
            ]
        ];

        return self::sendRequest('image-to-3d', $options);
    }

    public static function getTask($task_id)
    {

        $response = (new Client())->get(self::API_BASE_URL . 'image-to-3d/' . $task_id, [
            'headers' => [
                'Authorization' => 'Bearer '. self::API_KEY,
            ]
        ]);

        return json_decode($response->getBody()->getContents(), true) ?? [];
    }

}