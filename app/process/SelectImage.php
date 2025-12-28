<?php

namespace app\process;

use app\common\model\PhotoOrderModel;
use app\utils\HuoShanTos;
use app\utils\LibLibAi;
use app\utils\RedisServer;
use support\Log;
use Workerman\Crontab\Crontab;

class SelectImage
{
    // 新增版本标识属性
    private static $version = '1.2.0';

    public function onWorkerStart(): void
    {
        // 增加版本检查日志
        //Log::info("SelectImage进程启动，版本号：" . self::$version);
        new Crontab('* * * * * *', function () {
            self::taskImage();
        });
    }

    public static function taskImage()
    {
        $redis = RedisServer::app();

        $redis_key = 'photo:order:task';
        $redis_data = $redis->lpop($redis_key);
        if (!$redis_data)
            return;

        try {
            $data = json_decode($redis_data, true);


            if (time() - $data['time'] < 30) {
                $redis->rpush($redis_key, $redis_data);
                return;
            }

            $return = LibLibAi::selectTask($data['generateUuid']);

            //Log::channel('test')->error("2:", $return);
            if (!isset($return['data']['images'])) {
                $redis->rpush($redis_key, $redis_data);
                return;
            }

            $filename = 'photo_order_ai_img_' . $data['id'] . '_' . $data['generateUuid'] . '.png';

            $nodeId = $data['style_param']['nodeId'] ?? 0;
            $filter_image = array_filter($return['data']['images'], function ($item) use ($nodeId) {
                return $item['auditStatus'] == 3 && (!$nodeId || ($nodeId == $item['nodeId']));
            });
            $images = reset($filter_image);

            $image_url = $images['imageUrl'] ?? '';

            //Log::channel('test')->error("3:" . $image_url);
            if (!$image_url) {
                $redis->rpush($redis_key, $redis_data);
                return;
            }

            Log::channel('image')->info("task:", [
                'ai_original_img' => $image_url,
                'id' => $data['id'],
                'filename' => $filename,
            ]);


            $url = HuoShanTos::upload($image_url, $filename);
            if (!$url) {
                $redis->rpush($redis_key, $redis_data);
                return;
            }
            PhotoOrderModel::update([
                'id' => $data['id'],
                'status' => 2,
                'ai_original_img' => $url,
            ]);

        } catch (\Exception $e) {
            Log::channel('fail')->error("task:" . $e->getMessage());
            abort($e->getMessage());
        }
    }

}