<?php

namespace app\api\logic;

use app\api\validate\PhotoOrderValidate;
use app\common\logic\BalanceLogic;
use app\common\logic\UserLogic;
use app\common\model\PhotoOrderModel;
use app\common\model\UserModel;
use app\utils\HuoShanTos;
use app\utils\RedisServer;
use app\utils\RunningHubAi;
use support\Log;
use taoser\Validate;
use think\facade\Db;

class PhotoOrderLogic
{
    /**
     * 创建订单
     * @param array $params
     * @return PhotoOrderModel
     * @throws \Exception
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            $is_photo_style = $params['order_type'] == 1;
            Validate(PhotoOrderValidate::class)->scene($is_photo_style ? 'style': 'product')->check($params);

            $params['status'] = 1;

            $obj = PhotoOrderModel::create($params);

            global $PhotoOrderParam;

            UserLogic::balanceUpdate([
                'id' => $params['user_id'],
                'num_balance' => Db::raw('num_balance - ' . $PhotoOrderParam['deduct']),
            ]);

            Db::commit();


            $width = $is_photo_style && $params['is_strength'] ? 10000 : ($params['width'] ?? 0);
            $height = $is_photo_style && $params['is_strength'] ? 10000 : ($params['height'] ?? 0);

            $style_param = $PhotoOrderParam['style_param'] ?? [];
            $description = !$is_photo_style ? 'description' : 'descript';

            $json_data = [
                'id' => $obj->id,
                'url' => $params['original_img'],
                'style_param' => $style_param,
                'prompt' => $PhotoOrderParam[$description] ?? '',
                'style_cate' => $is_photo_style ? $PhotoOrderParam['style_cate'] : 1,
                'width' => $width,
                'height' => $height,
                'is_strength' => $params['is_strength']
            ];

            RedisServer::app()->rpush('photo:order:queue', json_encode($json_data));


            return $obj;
        }catch (\Exception $e) {
            Db::rollback();

            $code = request()->user->num_balance > 0 ? -1 : -3;
            abort($e->getMessage(), $code);
        }
    }



    public static function findData($id)
    {
        $obj = (new PhotoOrderModel())->findOrEmpty($id)->toArray();

        //$redis_image = RedisServer::app()->get("photo:order:result_id_" . $id);

        //$generated_img = $redis_image || $obj['status'] == 2;
        //$obj['ai_original_img'] = $obj['ai_original_img'] ?: $redis_image;
        //$obj['status'] = $generated_img ? 2 : $obj['status'];
        return $obj;
    }

    public static function update(array $params)
    {
        try {
            Validate(PhotoOrderValidate::class)->scene('update')->check($params);

            PhotoOrderModel::update($params);

            return true;
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }


    public static function notify($post_data)
    {
        try {
            list($task_id, $file_url, $task_order) = RunningHubAi::notify($post_data);

            //精度增强
            if ($task_order['is_strength']) {
                $image_info = self::getImageDimensions($file_url);
                if (!is_array($image_info)) throw new \Exception('图片获取失败');

                if ($image_info['width'] < $task_order['width'] || $image_info['height'] < $task_order['height']) {

                    $task_order['url'] = $file_url;
                    (RedisServer::app())->lpush('photo:order:queue', json_encode($task_order));

                    return true;
                }
            }

            $order_id = $task_order['id'];
            $order = PhotoOrderModel::find($order_id);
            if (!$order) throw new \Exception('订单不存在');

            $filename = 'photo_order_ai_img_'. $order->user_id . '_' . $order_id . '_' . $task_id . '.png';

            self::notifyUpdatePhotoOrder($order_id, $file_url, $filename);
        }catch (\Exception $e) {
            Log::channel('image')->info('notify_error:' . $e->getMessage());

            abort($e->getMessage());
        }
    }

    /**
     * 获取图片的宽度和高度
     * @param string $imagePath 图片路径
     * @return array|false 成功返回包含宽度和高度的数组，失败返回false
     */
    public static function getImageDimensions(string $imagePath): bool|array
    {

        // 检查URL是否有效
        if (!filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return false;
        }

        // 设置超时时间（秒）
        $context = stream_context_create([
            'http' => ['timeout' => 10]
        ]);

        // 使用getimagesize读取远程图片
        $dimensions = @getimagesize($imagePath, $context);


        if ($dimensions === false) {
            return false;
        }

        return [
            'width' => $dimensions[0],
            'height' => $dimensions[1]
        ];
    }

    /**
     * 火山方舟回调
     * @param $params
     * @throws \Exception
     */
    public static function arkNotify($params)
    {
        try {
            if ($params['status'] != 'succeeded') return true;

            $task_id = $params['id'];
            $redis = RedisServer::app();
            $redis_key = 'photo_order_notify_task_id_' . $task_id;
            $task_order = $redis->get($redis_key);
            if (!$task_order) throw new \Exception('任务订单不存在');
            $task_order = json_decode($task_order, true);

            $order_id = $task_order['id'];
            $order = PhotoOrderModel::find($order_id);
            if (!$order) throw new \Exception('订单不存在');

            $filename = 'photo_order_ai_video_'. $order->user_id . '_' . $order_id . '_' . $task_id . '.mp4';
            $file = $params['content']['video_url'];

            self::notifyUpdatePhotoOrder($order_id, $file, $filename);
            return true;
        }catch (\Exception $e) {
            Log::channel('ark')->error('回调失败:' . $e->getMessage(), $params);
            abort($e->getMessage());
        }
    }

    public static function notifyUpdatePhotoOrder($order_id, $file_url, $filename)
    {
        $url = HuoShanTos::upload($file_url, $filename);


        Log::channel('test')->info("uploaded:" . $url);
        return PhotoOrderModel::update([
            'id' => $order_id,
            'status' => 2,
            'ai_original_img' => $url,
        ]);
    }
}