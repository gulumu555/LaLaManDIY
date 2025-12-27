<?php

namespace app\utils;

use GuzzleHttp\Client;
use support\Log;

class HuoShanArk
{
    public const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';


    public static function create($data)
    {
        try {
            $client = new Client();

            $config = config('tos');
            $response = $client->post(self::BASE_URL, [
               'headers' => [
                   'Content-Type' => 'application/json',
                   'Authorization' => 'Bearer '. $config['ark_api_key'],
               ],
                'json' => [
                    'model' => $config['ark_model_id'],
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => "{$data['prompt']} --duration 10",
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => $data['url'],
                            ]
                        ]
                    ],
                    'callback_url' => config('superadminx.url') . '/api/PhotoOrder/arkNotify',
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true)['id'];
        }catch (\Exception $e) {
            Log::channel('ark')->error('创建ark任务失败:' . $e->getMessage(), $data);
            abort($e->getMessage());
        }
    }

    public static function task($id)
    {
        try {
            $client = new Client();

            $response = $client->get(self::BASE_URL . '/' . $id, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer '. config('tos')['ark_api_key'],
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }
}