<?php

namespace app\utils;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use support\Log;
use support\Request;
use think\Exception;

class RunningHubAi
{
    private const API_BASE_URL = 'https://www.runninghub.cn/task/openapi/';
    private const API_KEY = '867cabf7be4249748e663c950b5322f4';

    private const WORKFLOW_ID = '1942149154724593666';


    private static function sendRequest($endpoint, $options)
    {
        try {
            $response = (new Client())->post(self::API_BASE_URL . $endpoint, $options);
            return json_decode($response->getBody()->getContents(), true)['data'] ?? [];
        } catch (GuzzleException $e) {

            abort($e->getMessage());
        }
    }

    public static function upload($url)
    {
        $multipart = [
            ['name' => 'apiKey', 'contents' => self::API_KEY],
            ['name' => 'file', 'contents' => fopen($url, 'r')],
            ['name' => 'fileType', 'contents' => 'image']
        ];

        return self::sendRequest('upload', [
            'headers' => ['Host' => 'www.runninghub.cn'],
            'multipart' => $multipart
        ]);
    }

    public static function createTask($params)
    {

        $json = [
            'apiKey' => self::API_KEY,
            'workflowId' => $params['workflow_id'],
            'nodeInfoList' => $params['node_info_list'],
            'webhookUrl' => config('superadminx.url') . '/api/PhotoOrder/notify'
        ];

        return self::sendRequest('create', [
            'headers' => ['Host' => 'www.runninghub.cn', 'Content-Type' => 'application/json'],
            'json' => $json
        ]);
    }

    public static function notify($response)
    {
        //$response = request()->post();
        try {


            if (!isset($response['taskId'])) throw new Exception('taskId not found');

            $eventData = is_string($response['eventData']) ? json_decode($response['eventData'], true) : $response['eventData'];
            if (!isset($eventData['code']) || $eventData['code'] != 0) throw new Exception(json_encode($eventData));

            $task_id = $response['taskId'];

            $redis = RedisServer::app();
            $redis_key = 'photo_order_notify_task_id_' . $task_id;
            $task_order = $redis->get($redis_key);

            if (!$task_order) throw new \Exception('订单id不存在');
            $task_order = json_decode($task_order, true);

            Log::channel('image')->info('回调订单:' . $task_id, $task_order);

            if (count($eventData['data']) == 1) {
                $file_url = end($eventData['data']);
            } else {
                $image_node_id = $task_order['style_param']['image_node_id'] ?? 210;

                $filter_url = array_filter($eventData['data'], function ($item) use($image_node_id){
                    return $item['nodeId'] == $image_node_id;
                });


                $file_url = $filter_url ? end($filter_url) : ['fileUrl' => ''];
            }



            return [
                $task_id,
                $file_url['fileUrl'],
                $task_order
            ];
        }catch (Exception $e) {
            Log::channel('image')->error('hub_notify_error:' . $e->getMessage());

            abort($e->getMessage());

        }
    }
    public static function statusTask($taskId)
    {
        $json = [
            'apiKey' => self::API_KEY,
            'taskId' => $taskId
        ];

        return self::sendRequest('status', [
            'headers' => ['Host' => 'www.runninghub.cn', 'Content-Type' => 'application/json'],
            'json' => $json
        ]);
    }

    public static function outputsTask($taskId)
    {
        $json = ['apiKey' => self::API_KEY, 'taskId' => $taskId];

        return self::sendRequest('outputs', [
            'headers' => ['Host' => 'www.runninghub.cn', 'Content-Type' => 'application/json'],
            'json' => $json
        ]);
    }
}