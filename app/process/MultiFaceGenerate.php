<?php

namespace app\process;

use app\common\model\OrderItemsModel;
use app\common\model\PhotoOrderModel;
use app\utils\HunYuan;
use app\utils\HuoShanTos;
use app\utils\ImgUrlTool;
use app\utils\RedisServer;
use app\utils\RequestHandle;
use app\utils\SeedDream4;
use support\Log;
use Workerman\Crontab\Crontab;

/**
 * 定时任务：消费队列，生成多面图和3D混元模型并保存
 *
 * @author acvic yang
 */
class MultiFaceGenerate
{
    private const VERSION = '1.0.1';

    private const LOCK_KEY = 'lock:multi_face_generate';

    public function onWorkerStart(): void
    {
        new Crontab('* * * * *', function () {
            //Log::info("[MultiFace] 进程启动，版本号：" . self::VERSION);

            try {
                $this->processTask();
            } catch (\Throwable $e) {
                Log::channel('multi')->error("任务处理异常: " . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]);
            }
        });
    }

    /**
     * 处理队列任务
     */
    protected function processTask(): void
    {
        $redis = RedisServer::app();

        if (!$redis->set(self::LOCK_KEY, 1, 'nx', 'ex', 1200)) {
            return; // 获取锁失败
        }

        try {
            $redis_data = $redis->lpop('multi_face_queue');

            if (!$redis_data) {
                return;
            }

            $this->generate($redis_data);
        } finally {
            // 直接释放锁，不再使用Lua脚本
            $redis->del(self::LOCK_KEY);
        }
    }

    /**
     * 生成多面图和3D模型主流程
     *
     * @param string $redis_data Redis队列数据
     * @throws \Exception
     */
    protected function generate(string $redis_data): void
    {
        $task = json_decode($redis_data, true);

        $item_id = (int)$task['id'];
        $source_image_url = $task['result_image'];
        Log::channel('multi')->info("1.图像开始生成 [ID:{$item_id}]", [
            'source_image_url' => $source_image_url
        ]);

        // 1. 生成多面图
        $image_data = $this->generateMultiFaceImages($source_image_url, $item_id);

        // 2. 上传图像
        $uploaded_images = $this->uploadMultiFaceImages($image_data, $item_id);
        Log::channel('multi')->info("2.多面图上传完成 [ID:{$item_id}]", [
            'uploaded_images' => $uploaded_images
        ]);

        // 3. 生成3D模型并轮询状态
        $prefix = getenv("IMAGE_PREFIX");
        $front_image = $prefix . $uploaded_images[0]['ViewImageUrl'];
        $other_images = array_map(function ($item) use ($prefix) {
            $item['ViewImageUrl'] = $prefix . $item['ViewImageUrl'];
            return $item;
        }, array_slice($uploaded_images, 1));
        $model_url = $this->generateAndPoll3DModel($front_image, $other_images, $item_id);


        // 4. 保存结果
        $this->saveResults($item_id, $uploaded_images, $model_url, $source_image_url);
    }

    protected function getOriginImage($id)
    {
        $result_image = OrderItemsModel::where('id', $id)->find()->result_image;
        preg_match('/photo_order_ai_img_(\d+)/', $result_image, $matches);

        $match_id = $matches[1] ?? 0;
        if (!$match_id) {
            throw new \Exception("无法获取原始图片ID：" . $id);
        }

        return PhotoOrderModel::where('id', $match_id)->find()->original_image;
    }

    /**
     * 生成多面图
     *
     * @param string $source_image_url 源图像URL
     * @param int $item_id 项目ID
     * @return array AI响应的图像数据
     * @throws \Exception 当AI返回数据异常时抛出异常
     */
    protected function generateMultiFaceImages(string $source_image_url, int $item_id): array
    {
        $ai_response = SeedDream4::send($source_image_url);
        Log::channel('multi')->info("AI 响应 [ID:{$item_id}]", $ai_response);

        if (empty($ai_response['data']) || count($ai_response['data']) !== 4) {
            throw new \Exception("AI 返回图像数量不正确， [ID:{$item_id}] 期望4个，实际" . count($ai_response['data'] ?? []));
        }

        return $ai_response['data'];
    }

    /**
     * 上传多面图到存储服务
     *
     * @param array $image_data 图像数据
     * @param int $item_id 项目ID
     * @return array 上传后的图像信息数组
     * @throws \Exception
     */
    protected function uploadMultiFaceImages(array $image_data, int $item_id): array
    {
        $uploaded_images = [
            ['ViewType' => 'front', 'ViewImageUrl' => ''],
            ['ViewType' => 'left', 'ViewImageUrl' => ''],
            ['ViewType' => 'right', 'ViewImageUrl' => ''],
            ['ViewType' => 'back', 'ViewImageUrl' => '']
        ];

        foreach ($image_data as $index => $image_info) {
            $image_name = "multi_image_{$item_id}_{$index}.png";
            $upload_result = HuoShanTos::upload($image_info['url'], $image_name);
            $uploaded_images[$index]['ViewImageUrl'] = $upload_result;
        }

        sleep(1);
        return $uploaded_images;
    }

    /**
     * 生成3D模型并轮询任务状态
     *
     * @param string $front_image 正面图像URL
     * @param array $other_images 其他视角图像URL数组
     * @param int $item_id 项目ID
     * @return string 3D模型文件URL
     * @throws \Exception 当任务创建失败或超时时抛出异常
     */
    protected function generateAndPoll3DModel(string $front_image, array $other_images, int $item_id): string
    {
        $hunyuan_task = HunYuan::createTask($front_image, $other_images);
        sleep(1);

        if (!isset($hunyuan_task['JobId'])) {
            throw new \Exception("创建3D模型任务失败");
        }

        return $this->pollTaskStatus($hunyuan_task['JobId'], $item_id);
    }

    /**
     * 轮询任务状态直到完成或超时
     *
     * @param string $job_id 任务ID
     * @param int $item_id 项目ID
     * @return string 3D模型文件URL
     * @throws \Exception 当任务状态异常或超时时抛出异常
     */
    protected function pollTaskStatus(string $job_id, int $item_id): string
    {
        $max_wait_time = 600; // 最大等待时间600秒(10分钟)
        $start_time = time();

        while ((time() - $start_time) < $max_wait_time) {
            $task_status = HunYuan::searchTask($job_id);

            if (!isset($task_status['Status'])) {
                Log::error("无法获取任务状态 [JobID:{$job_id}]");
                throw new \Exception("无法获取任务状态");
            }

            switch ($task_status['Status']) {
                case 'DONE':
                    // 任务完成，上传模型文件
                    $result = reset($task_status['ResultFile3Ds']);
                    $filename = "3d_model_{$item_id}";
                    Log::channel('multi')->info("3.3D模型生成完成 [ID:{$item_id}]", $result);
                    return HuoShanTos::upload($result['Url'], $filename . ".zip");

                case 'WAIT':
                case 'RUN':
                    // 任务仍在执行中，等待后继续查询
                    sleep(5);
                    continue 2;

                default:
                    // 异常状态
                    Log::error("任务状态异常 [JobID:{$job_id}]: " . $task_status['Status']);
                    throw new \Exception("任务状态异常: " . $task_status['Status']);
            }
        }

        throw new \Exception("3D模型生成超时 [JobID:{$job_id}]");
    }

    /**
     * 保存处理结果到数据库
     *
     * @param int $item_id 项目ID
     * @param array $uploaded_images 上传的图像信息
     * @param string $model_url 3D模型URL
     */
    protected function saveResults(int $item_id, array $uploaded_images, string $model_url, string $source_image_url): void
    {
        OrderItemsModel::update([
            'id' => $item_id,
            'ai_model' => $model_url,
            'original_image' => ImgUrlTool::deletePrefix($source_image_url),
            'multi_face' => array_map(function ($item) {
                return $item['ViewImageUrl'];
            }, $uploaded_images)
        ]);
    }
}