<?php

namespace app\process;

use app\model\BatchJob;
use app\utils\RedisServer;
use app\utils\SeedDream4;
use support\Log;
use Workerman\Crontab\Crontab;

/**
 * BatchWorker - LaLaMan 2.0
 * 
 * Background process that consumes batch generation queue
 */
class BatchWorker
{
    // Redis queue key
    const QUEUE_KEY = 'batch:job:queue';

    // Max concurrent generations
    const MAX_CONCURRENT = 4;

    // Running jobs counter
    private static $runningCount = 0;

    public function onWorkerStart(): void
    {
        Log::channel('identity')->info('BatchWorker started');

        // Check queue every 2 seconds
        new Crontab('*/2 * * * * *', function () {
            self::processQueue();
        });
    }

    /**
     * Process pending jobs from queue
     */
    public static function processQueue(): void
    {
        // Skip if at max concurrency
        if (self::$runningCount >= self::MAX_CONCURRENT) {
            return;
        }

        $redis = RedisServer::app();
        $data = $redis->lpop(self::QUEUE_KEY);

        if (!$data) {
            return;
        }

        try {
            $jobData = json_decode($data, true);

            if (!$jobData || !isset($jobData['job_id'])) {
                Log::channel('identity')->error('Invalid job data', ['data' => $data]);
                return;
            }

            $job = BatchJob::find($jobData['job_id']);

            if (!$job) {
                Log::channel('identity')->error('Job not found', ['job_id' => $jobData['job_id']]);
                return;
            }

            // Skip if already processed or cancelled
            if ($job->isFinished()) {
                return;
            }

            // Mark as running
            $job->markRunning();
            self::$runningCount++;

            Log::channel('identity')->info('Processing batch job', [
                'job_id' => $job->id,
                'style_key' => $jobData['style_key'],
                'count' => $jobData['count'],
            ]);

            // Process each emotion
            $emotions = $jobData['emotions'] ?? [];
            $identityImage = $jobData['identity_image'] ?? null;
            $styleKey = $jobData['style_key'];

            foreach ($emotions as $emotion) {
                // Check if job was cancelled
                $job = BatchJob::find($jobData['job_id']);
                if ($job->status === BatchJob::STATUS_CANCELLED) {
                    Log::channel('identity')->info('Job cancelled, stopping', ['job_id' => $job->id]);
                    break;
                }

                try {
                    // Build emotion-specific prompt
                    $emotionPrompt = self::getEmotionPrompt($emotion);

                    // Generate with or without identity
                    if ($identityImage) {
                        $result = SeedDream4::generateWithIdentity(
                            $identityImage,
                            $styleKey,
                            $emotionPrompt
                        );
                    } else {
                        $result = SeedDream4::generateWithStyle(
                            [], // No reference image
                            $styleKey,
                            $emotionPrompt
                        );
                    }

                    // Check result
                    if (isset($result['data'][0]['url'])) {
                        $job->addOutput($result['data'][0]['url'], $emotion);
                        Log::channel('identity')->info('Sticker generated', [
                            'job_id' => $job->id,
                            'emotion' => $emotion,
                        ]);
                    } else {
                        $job->incrementFailed();
                        Log::channel('identity')->warning('Sticker generation failed', [
                            'job_id' => $job->id,
                            'emotion' => $emotion,
                            'result' => $result,
                        ]);
                    }

                } catch (\Exception $e) {
                    $job->incrementFailed();
                    Log::channel('identity')->error('Sticker generation error', [
                        'job_id' => $job->id,
                        'emotion' => $emotion,
                        'error' => $e->getMessage(),
                    ]);
                }

                // Brief delay between generations to avoid rate limiting
                usleep(500000); // 0.5 seconds
            }

            // Mark completed
            $job = BatchJob::find($jobData['job_id']);
            if ($job->status !== BatchJob::STATUS_CANCELLED) {
                if ($job->completed_count > 0) {
                    $job->markCompleted();
                } else {
                    $job->markFailed('所有生成均失败');
                }
            }

            Log::channel('identity')->info('Batch job finished', [
                'job_id' => $job->id,
                'completed' => $job->completed_count,
                'failed' => $job->failed_count,
            ]);

        } catch (\Exception $e) {
            Log::channel('identity')->error('BatchWorker error', ['error' => $e->getMessage()]);

            // Try to mark job as failed
            if (isset($jobData['job_id'])) {
                $job = BatchJob::find($jobData['job_id']);
                if ($job) {
                    $job->markFailed($e->getMessage());
                }
            }
        } finally {
            self::$runningCount--;
        }
    }

    /**
     * Get emotion-specific prompt
     */
    private static function getEmotionPrompt(string $emotion): string
    {
        $prompts = [
            'happy' => 'A character showing a happy, joyful expression with a bright smile',
            'laugh' => 'A character laughing out loud, showing great amusement',
            'excited' => 'A character showing extreme excitement and enthusiasm',
            'celebrate' => 'A character celebrating with party vibes',
            'sad' => 'A character showing a sad, melancholy expression',
            'cry' => 'A character crying with tears',
            'speechless' => 'A character looking speechless and stunned',
            'shocked' => 'A character showing extreme shock and surprise',
            'angry' => 'A character showing anger with furrowed brows',
            'annoyed' => 'A character showing annoyance and frustration',
            'begging' => 'A character begging with pleading eyes',
            'please' => 'A character saying please with hopeful expression',
            'love' => 'A character showing love with hearts around',
            'heart_eyes' => 'A character with heart-shaped eyes showing adoration',
            'kiss' => 'A character blowing a kiss',
            'hug' => 'A character with arms open for a hug',
            'thinking' => 'A character in deep thought with hand on chin',
            'confused' => 'A character looking confused with question marks',
            'okay' => 'A character showing OK gesture',
            'thumbs_up' => 'A character giving a thumbs up',
            'sleepy' => 'A character looking very sleepy with droopy eyes',
            'goodnight' => 'A character waving goodnight',
            'hungry' => 'A character looking hungry thinking about food',
            'rotting' => 'A character melting or rotting dramatically in despair',
        ];

        return $prompts[$emotion] ?? "A character showing {$emotion} expression";
    }
}
