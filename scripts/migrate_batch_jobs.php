<?php
/**
 * Migration: Create app_batch_jobs table
 * LaLaMan 2.0 - Phase 2 Batch Generation
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use think\facade\Db;

echo "Creating app_batch_jobs table...\n";

$sql = "CREATE TABLE IF NOT EXISTS `app_batch_jobs` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'User ID',
    `style_key` VARCHAR(100) NOT NULL COMMENT 'Style key to apply',
    `identity_image` VARCHAR(500) DEFAULT NULL COMMENT 'Selfie URL for identity mode',
    `status` ENUM('queued', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'queued' COMMENT 'Job status',
    `total_count` INT UNSIGNED NOT NULL DEFAULT 24 COMMENT 'Total stickers to generate',
    `completed_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Completed count',
    `failed_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Failed count',
    `outputs` JSON DEFAULT NULL COMMENT 'Array of generated asset URLs',
    `error_message` VARCHAR(500) DEFAULT NULL COMMENT 'Error message if failed',
    `started_at` DATETIME DEFAULT NULL COMMENT 'Processing start time',
    `completed_at` DATETIME DEFAULT NULL COMMENT 'Processing complete time',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='LaLaMan 2.0 Batch Generation Jobs'";

try {
    Db::execute($sql);
    echo "✅ Table 'app_batch_jobs' created successfully!\n";
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
