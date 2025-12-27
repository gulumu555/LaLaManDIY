<?php

namespace app\api\controller;

use app\common\model\OrderItemsModel;
use app\utils\HuoShanTos;
use app\utils\ImgUrlTool;
use app\utils\RedisServer;
use app\utils\SeedDream4;
use support\Log;
use support\Request;

class ImageX
{
    // 此控制器是否需要登录
    protected $onLogin = false;
    // 不需要登录的方法
    protected $noNeedLogin = [];

    public function callback(Request $request)
    {
        $outer = $request->all();

        try {
            //Log::info('imagex callback', $outer);
            $realJsonString = key($outer);


            $data = json_decode($realJsonString, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                abort('Invalid inner JSON');
            }
            $callbackArgs = $data['callback_args']; // "order_item_id_1121"

            if (preg_match('/order_item_id_(\d+)/', $callbackArgs, $matches)) {
                $orderId = $matches[1]; // "1121"
            } else {
                throw new \Exception('order_item_id not found');
            }

            $aiResultOutputStr = $data['entry_info']['ai_result']['output'];

            $aiResult = json_decode($aiResultOutputStr, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid ai_result.output JSON');
            }

            $objectKey = $aiResult['ObjectKey'];
            $url = SeedDream4::concatUrl($objectKey);

            $redis_data = json_encode([
                'id' => $orderId,
                'result_image' => $url,
            ]);
            RedisServer::app()->rpush("poster_precision_enhancement", $redis_data);
//            Log::info("ImageXresult", [
//                'object_key' => $objectKey,
//                'url' => $url,
//                'order_id' => $orderId,
//            ]);

        }catch (\Exception $e) {
            Log::error("imagex_error:" .$e->getMessage());
        }

        return success([
            'status' => 'completed'
        ], 200);

    }

}