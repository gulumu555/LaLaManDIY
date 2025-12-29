<?php

namespace app\api\controller;

use app\model\BatchJob;
use app\utils\ExportService;
use support\Request;
use support\Log;

/**
 * Export Controller - LaLaMan 2.0
 * 
 * Handles multi-platform export formatting
 */
class Export
{
    /**
     * Export image for WeChat sticker format
     * 
     * POST /api/Export/wechat
     *
     * @param Request $request
     * @return \support\Response
     */
    public function wechat(Request $request)
    {
        try {
            $imageUrl = $request->post('image_url');

            if (empty($imageUrl)) {
                return json(['code' => 400, 'msg' => '缺少图片URL (image_url)']);
            }

            $result = ExportService::formatForWeChat($imageUrl);

            if ($result['success']) {
                return json([
                    'code' => 0,
                    'msg' => 'success',
                    'data' => $result
                ]);
            } else {
                return json(['code' => 500, 'msg' => $result['error'] ?? '导出失败']);
            }

        } catch (\Exception $e) {
            Log::channel('identity')->error('WeChat export error', ['error' => $e->getMessage()]);
            return json(['code' => 500, 'msg' => '导出失败: ' . $e->getMessage()]);
        }
    }

    /**
     * Export image for Telegram sticker format
     * 
     * POST /api/Export/telegram
     *
     * @param Request $request
     * @return \support\Response
     */
    public function telegram(Request $request)
    {
        try {
            $imageUrl = $request->post('image_url');

            if (empty($imageUrl)) {
                return json(['code' => 400, 'msg' => '缺少图片URL (image_url)']);
            }

            $result = ExportService::formatForTelegram($imageUrl);

            if ($result['success']) {
                return json([
                    'code' => 0,
                    'msg' => 'success',
                    'data' => $result
                ]);
            } else {
                return json(['code' => 500, 'msg' => $result['error'] ?? '导出失败']);
            }

        } catch (\Exception $e) {
            Log::channel('identity')->error('Telegram export error', ['error' => $e->getMessage()]);
            return json(['code' => 500, 'msg' => '导出失败: ' . $e->getMessage()]);
        }
    }

    /**
     * Export batch job as ZIP package
     * 
     * GET /api/Export/zip?job_id=xxx
     *
     * @param Request $request
     * @return \support\Response
     */
    public function zip(Request $request)
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

            if ($job->status !== BatchJob::STATUS_COMPLETED) {
                return json(['code' => 400, 'msg' => '任务未完成，无法导出']);
            }

            $assets = $job->outputs ?: [];

            if (empty($assets)) {
                return json(['code' => 400, 'msg' => '没有可导出的图片']);
            }

            $result = ExportService::packageZip($assets, [
                'job_id' => $job->id,
                'style_key' => $job->style_key,
            ]);

            if ($result['success']) {
                return json([
                    'code' => 0,
                    'msg' => 'success',
                    'data' => $result
                ]);
            } else {
                return json(['code' => 500, 'msg' => $result['error'] ?? '打包失败']);
            }

        } catch (\Exception $e) {
            Log::channel('identity')->error('ZIP export error', ['error' => $e->getMessage()]);
            return json(['code' => 500, 'msg' => '打包失败: ' . $e->getMessage()]);
        }
    }

    /**
     * Get quality score for an image
     * 
     * POST /api/Export/qc
     *
     * @param Request $request
     * @return \support\Response
     */
    public function qc(Request $request)
    {
        try {
            $imageUrl = $request->post('image_url');

            if (empty($imageUrl)) {
                return json(['code' => 400, 'msg' => '缺少图片URL (image_url)']);
            }

            $score = ExportService::scoreQuality($imageUrl);
            $shouldRetry = ExportService::shouldRetry($imageUrl);
            $tooLow = ExportService::isTooLowQuality($imageUrl);

            return json([
                'code' => 0,
                'msg' => 'success',
                'data' => [
                    'score' => $score,
                    'should_retry' => $shouldRetry,
                    'is_too_low' => $tooLow,
                    'threshold_retry' => ExportService::QC_THRESHOLD_RETRY,
                    'threshold_fail' => ExportService::QC_THRESHOLD_FAIL,
                ]
            ]);

        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '质量检测失败: ' . $e->getMessage()]);
        }
    }
}
