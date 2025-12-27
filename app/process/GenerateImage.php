<?php

namespace app\process;

use app\common\logic\UserLogic;
use app\common\model\PhotoOrderModel;
use app\common\model\PhotoStyleModel;
use app\common\model\ProductModel;
use app\utils\HuoShanArk;
use app\utils\LibLibAi;
use app\utils\RedisServer;
use support\Log;
use think\facade\Db;
use Workerman\Crontab\Crontab;

class GenerateImage
{
    const GENERATING_KEY = "photo:order:queue:generating";
    const LOCK_EXPIRE = 1800; // 30分钟过期时间

    public function onWorkerStart(): void
    {
        new Crontab('* * * * * *', function(){
            self::generateImage();
        });
    }

    /**
     * 生成图片
     * @return void
     */
    private static function generateImage(): void
    {
        $redis = RedisServer::app();

        // 尝试获取锁，确保只有一个任务在执行
        if (!$redis->set(self::GENERATING_KEY, 1, 'EX', self::LOCK_EXPIRE, 'NX')) {
            return; // 获取锁失败，说明有其他任务在执行
        }

        $redis_data = null;
        try {
            $redis_data = $redis->lpop('photo:order:queue');
            
            if ($redis_data) {
                $data = json_decode($redis_data, true);
                $style_param = $data['style_param']['style_param'];

                $return = LibLibAi::createTask($style_param, $data['url'], $data['prompt']);
                if (isset($return['data']['generateUuid'])) {
                    $data['generateUuid'] = $return['data']['generateUuid'];
                    $data['time'] = time();

                    $json_data = json_encode($data);
                    $redis->rpush("photo:order:task", $json_data);

                    Log::channel('image')->info('push_task:' . $json_data);
                } else {
                    Log::channel("fail")->error('转绘失败：' . json_encode($return) . "_data:" . $redis_data);

                    if (isset($return['code']) && $return['code'] === 100054) {
                        $redis->rpush("photo:order:queue", $redis_data);
                    }else {
                        self::imageGenerateError($data);

                    }
                }
            }
        } catch (\Exception $e) {
            Log::channel('fail')->error('generate:' . $e->getMessage(), $style_param ?? []);
            
            // 异常情况下，如果还有数据，重新放回队列
            if ($redis_data) {
                $redis->rpush('photo:order:queue', $redis_data);
            }
        } finally {
            // 无论成功还是失败，都要释放锁
            $redis->del(self::GENERATING_KEY);
        }
    }

    public static function imageGenerateError($data)
    {
        $obj = PhotoOrderModel::find($data['id']);

        $deduct = $obj->order_type == 1 ? (PhotoStyleModel::find($obj['photo_style_id'])['deduct'] ?? 0) : (
          ProductModel::find($obj['product_id'])['deduct'] ?? 0
        );

        UserLogic::balanceUpdate([
            'id' => $obj->user_id,
            'num_balance' => Db::raw('num_balance + ' . $deduct),
        ]);

        PhotoOrderModel::update([
            'id' => $obj->id,
            'status' => 3
        ]);
    }
}