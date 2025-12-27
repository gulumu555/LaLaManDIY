<?php

namespace app\process;

use app\common\model\OrderItemsModel;
use app\utils\HuoShanTos;
use app\utils\ImgUrlTool;
use app\utils\RedisServer;
use app\utils\SeedDream4;
use support\Log;
use Workerman\Crontab\Crontab;

class PrecisionEnhancement
{
    // 新增版本标识属性
    private static $version = '1.0.0';

    public function onWorkerStart()
    {

        //Log::info("PrecisionEnhancement进程启动，版本号：" . self::$version);

        new Crontab('* * * * *', function () {
            self::generate();
        });
    }

    public static function generate(): void
    {
        $redis = RedisServer::app();
        $redis_key = 'poster_precision_enhancement';
        try {
            $redis_data = $redis->lpop($redis_key);
            if (!$redis_data) {
                return;
            }

            $data = json_decode($redis_data, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error("PrecisionEnhancement JSON解析失败: " . json_last_error_msg());
                return;
            }

            // 验证必要字段
            if (!isset($data['result_image']) || !isset($data['id'])) {
                Log::error("PrecisionEnhancement数据缺失: " . $redis_data);
                return;
            }

            $filename = "velimagex_{$data['id']}_" . time() . ".png";
            $upload_url = HuoShanTos::upload($data['result_image'], $filename);

            OrderItemsModel::update([
                'id' => $data['id'],
                'multi_face' => [ImgUrlTool::deletePrefix($upload_url)]
            ]);

        } catch (\Exception $e) {
            Log::error("PrecisionEnhancement进程异常：" . $e->getMessage(), [
                'exception' => $e
            ]);
        }
    }

}