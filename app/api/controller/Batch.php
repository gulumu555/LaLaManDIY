<?php

namespace app\api\controller;

use app\model\BatchJob;
use app\utils\RedisServer;
use app\utils\SeedDream4;
use support\Request;
use support\Log;

/**
 * Batch Controller - LaLaMan 2.0
 * 
 * Handles 24-sticker batch generation jobs
 */
class Batch
{
    // Redis queue key
    const QUEUE_KEY = 'batch:job:queue';

    // Default emotion set for 24 stickers
    const EMOTION_SET = [
        'happy',
        'laugh',
        'excited',
        'celebrate',
        'sad',
        'cry',
        'speechless',
        'shocked',
        'angry',
        'annoyed',
        'begging',
        'please',
        'love',
        'heart_eyes',
        'kiss',
        'hug',
        'thinking',
        'confused',
        'okay',
        'thumbs_up',
        'sleepy',
        'goodnight',
        'hungry',
        'rotting'
    ];

    /**
     * Create a new batch generation job
     * 
     * POST /api/Batch/create
     *
     * @param Request $request
     * @return \support\Response
     */
    public function create(Request $request)
    {
        try {
            // Get parameters
            $userId = $request->post('user_id', 0);
            $styleKey = $request->post('style_key');
            $identityImage = $request->post('identity_image');
            $count = (int) $request->post('count', 24);

            // Validate
            if (empty($styleKey)) {
                return json(['code' => 400, 'msg' => '缺少风格参数 (style_key)']);
            }

            // Limit count to 24
            $count = min($count, 24);

            // Create job record
            $job = BatchJob::createJob($userId, $styleKey, $identityImage, $count);

            // Add to Redis queue
            $redis = RedisServer::app();
            $redis->rpush(self::QUEUE_KEY, json_encode([
                'job_id' => $job->id,
                'style_key' => $styleKey,
                'identity_image' => $identityImage,
                'count' => $count,
                'emotions' => array_slice(self::EMOTION_SET, 0, $count),
                'created_at' => time(),
            ]));

            Log::channel('identity')->info('Batch job created', [
                'job_id' => $job->id,
                'style_key' => $styleKey,
                'count' => $count,
            ]);

            return json([
                'code' => 0,
                'msg' => 'success',
                'data' => [
                    'job_id' => $job->id,
                    'status' => $job->status,
                    'total_count' => $job->total_count,
                ]
            ]);

        } catch (\Exception $e) {
            Log::channel('identity')->error('Batch create failed', ['error' => $e->getMessage()]);
            return json(['code' => 500, 'msg' => '创建批量任务失败: ' . $e->getMessage()]);
        }
    }

    /**
     * Get batch job status
     * 
     * GET /api/Batch/status?job_id=xxx
     *
     * @param Request $request
     * @return \support\Response
     */
    public function status(Request $request)
    {
        try {
            $jobId = $request->get('job_id');

            if (empty($jobId)) {
                return json(['code' => 400, 'msg' => '缺少任务ID (job_id)']);
            }

            $job = BatchJob::find($jobId);

            if (!$job) {
                return json(['code' => 404, 'msg' => '任务不存在']);
            }

            return json([
                'code' => 0,
                'msg' => 'success',
                'data' => [
                    'job_id' => $job->id,
                    'status' => $job->status,
                    'progress' => $job->getProgress(),
                    'total_count' => $job->total_count,
                    'completed_count' => $job->completed_count,
                    'failed_count' => $job->failed_count,
                    'outputs' => $job->outputs ?: [],
                    'error_message' => $job->error_message,
                    'started_at' => $job->started_at,
                    'completed_at' => $job->completed_at,
                ]
            ]);

        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '获取任务状态失败: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel a batch job
     * 
     * POST /api/Batch/cancel
     *
     * @param Request $request
     * @return \support\Response
     */
    public function cancel(Request $request)
    {
        try {
            $jobId = $request->post('job_id');

            if (empty($jobId)) {
                return json(['code' => 400, 'msg' => '缺少任务ID (job_id)']);
            }

            $job = BatchJob::find($jobId);

            if (!$job) {
                return json(['code' => 404, 'msg' => '任务不存在']);
            }

            if ($job->isFinished()) {
                return json(['code' => 400, 'msg' => '任务已完成，无法取消']);
            }

            $job->status = BatchJob::STATUS_CANCELLED;
            $job->save();

            return json([
                'code' => 0,
                'msg' => '任务已取消',
                'data' => ['job_id' => $job->id]
            ]);

        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '取消任务失败: ' . $e->getMessage()]);
        }
    }

    /**
     * Get available emotion set
     * 
     * GET /api/Batch/emotions
     *
     * @return \support\Response
     */
    public function emotions()
    {
        return json([
            'code' => 0,
            'msg' => 'success',
            'data' => self::EMOTION_SET
        ]);
    }
}
