<?php

namespace app\model;

use think\Model;

/**
 * BatchJob Model - LaLaMan 2.0
 * 
 * Handles batch sticker generation jobs
 */
class BatchJob extends Model
{
    // Table name
    protected $table = 'app_batch_jobs';

    // Auto write timestamp
    protected $autoWriteTimestamp = true;

    // JSON fields to cast
    protected $json = ['outputs'];

    // Cast JSON to array
    protected $jsonAssoc = true;

    // Status constants
    const STATUS_QUEUED = 'queued';
    const STATUS_RUNNING = 'running';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Create a new batch job
     */
    public static function createJob(int $userId, string $styleKey, ?string $identityImage = null, int $totalCount = 24): self
    {
        $job = new self();
        $job->user_id = $userId;
        $job->style_key = $styleKey;
        $job->identity_image = $identityImage;
        $job->total_count = $totalCount;
        $job->status = self::STATUS_QUEUED;
        $job->outputs = [];
        $job->save();

        return $job;
    }

    /**
     * Mark job as running
     */
    public function markRunning(): void
    {
        $this->status = self::STATUS_RUNNING;
        $this->started_at = date('Y-m-d H:i:s');
        $this->save();
    }

    /**
     * Mark job as completed
     */
    public function markCompleted(): void
    {
        $this->status = self::STATUS_COMPLETED;
        $this->completed_at = date('Y-m-d H:i:s');
        $this->save();
    }

    /**
     * Mark job as failed
     */
    public function markFailed(string $errorMessage): void
    {
        $this->status = self::STATUS_FAILED;
        $this->error_message = $errorMessage;
        $this->completed_at = date('Y-m-d H:i:s');
        $this->save();
    }

    /**
     * Add a completed output
     */
    public function addOutput(string $url, string $emotion): void
    {
        $outputs = $this->outputs ?: [];
        $outputs[] = [
            'url' => $url,
            'emotion' => $emotion,
            'created_at' => date('Y-m-d H:i:s'),
        ];
        $this->outputs = $outputs;
        $this->completed_count = count($outputs);
        $this->save();
    }

    /**
     * Increment failed count
     */
    public function incrementFailed(): void
    {
        $this->failed_count++;
        $this->save();
    }

    /**
     * Check if job is finished (completed or failed)
     */
    public function isFinished(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_FAILED, self::STATUS_CANCELLED]);
    }

    /**
     * Get progress percentage
     */
    public function getProgress(): float
    {
        if ($this->total_count == 0)
            return 0;
        return round(($this->completed_count + $this->failed_count) / $this->total_count * 100, 2);
    }
}
