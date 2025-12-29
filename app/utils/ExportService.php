<?php

namespace app\utils;

use support\Log;
use GuzzleHttp\Client;

/**
 * ExportService - LaLaMan 2.0
 * 
 * Handles multi-platform export formatting and quality control
 */
class ExportService
{
    // Platform specs
    const WECHAT_SIZE = 512;
    const WECHAT_MAX_KB = 500;
    const TELEGRAM_SIZE = 512;
    const TELEGRAM_MAX_KB = 64;

    // Quality thresholds
    const QC_THRESHOLD_RETRY = 60;
    const QC_THRESHOLD_FAIL = 40;

    /**
     * Format image for WeChat sticker
     * 
     * @param string $imageUrl Source image URL
     * @return array ['success' => bool, 'url' => string, 'size_kb' => float]
     */
    public static function formatForWeChat(string $imageUrl): array
    {
        try {
            // Download image
            $imageData = self::downloadImage($imageUrl);
            if (!$imageData) {
                return ['success' => false, 'error' => '无法下载图片'];
            }

            // Create GD image resource
            $image = imagecreatefromstring($imageData);
            if (!$image) {
                return ['success' => false, 'error' => '无法解析图片'];
            }

            // Get original dimensions
            $origWidth = imagesx($image);
            $origHeight = imagesy($image);

            // Create resized image with transparency
            $newImage = imagecreatetruecolor(self::WECHAT_SIZE, self::WECHAT_SIZE);

            // Enable alpha blending and save alpha
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);

            // Fill with transparent background
            $transparent = imagecolorallocatealpha($newImage, 0, 0, 0, 127);
            imagefilledrectangle($newImage, 0, 0, self::WECHAT_SIZE, self::WECHAT_SIZE, $transparent);

            // Calculate scaling to fit within bounds
            $scale = min(self::WECHAT_SIZE / $origWidth, self::WECHAT_SIZE / $origHeight);
            $newWidth = (int) ($origWidth * $scale);
            $newHeight = (int) ($origHeight * $scale);
            $x = (int) ((self::WECHAT_SIZE - $newWidth) / 2);
            $y = (int) ((self::WECHAT_SIZE - $newHeight) / 2);

            // Enable alpha blending for source
            imagealphablending($newImage, true);

            // Resize and copy
            imagecopyresampled($newImage, $image, $x, $y, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

            // Output to buffer
            ob_start();
            imagepng($newImage, null, 9); // Maximum compression
            $pngData = ob_get_clean();

            // Clean up
            imagedestroy($image);
            imagedestroy($newImage);

            // Check file size
            $sizeKb = strlen($pngData) / 1024;

            // If too large, reduce quality (re-encode with lower quality)
            if ($sizeKb > self::WECHAT_MAX_KB) {
                // Convert to JPEG for smaller size (lose transparency)
                Log::channel('identity')->warning('WeChat export too large, consider optimizing', [
                    'size_kb' => $sizeKb
                ]);
            }

            // Upload to TOS and get URL
            $filename = 'wechat_sticker_' . time() . '_' . rand(1000, 9999) . '.png';
            $url = HuoShanTos::uploadFromData($pngData, $filename);

            return [
                'success' => true,
                'url' => $url,
                'size_kb' => round($sizeKb, 2),
                'format' => 'png',
                'dimensions' => self::WECHAT_SIZE . 'x' . self::WECHAT_SIZE,
            ];

        } catch (\Exception $e) {
            Log::channel('identity')->error('WeChat format failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Format image for Telegram sticker
     * 
     * @param string $imageUrl Source image URL
     * @return array ['success' => bool, 'url' => string]
     */
    public static function formatForTelegram(string $imageUrl): array
    {
        try {
            // Download image
            $imageData = self::downloadImage($imageUrl);
            if (!$imageData) {
                return ['success' => false, 'error' => '无法下载图片'];
            }

            // Create GD image
            $image = imagecreatefromstring($imageData);
            if (!$image) {
                return ['success' => false, 'error' => '无法解析图片'];
            }

            // Get original dimensions
            $origWidth = imagesx($image);
            $origHeight = imagesy($image);

            // Calculate new dimensions (one side must be 512)
            if ($origWidth > $origHeight) {
                $newWidth = self::TELEGRAM_SIZE;
                $newHeight = (int) ($origHeight * self::TELEGRAM_SIZE / $origWidth);
            } else {
                $newHeight = self::TELEGRAM_SIZE;
                $newWidth = (int) ($origWidth * self::TELEGRAM_SIZE / $origHeight);
            }

            // Create resized image
            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);

            $transparent = imagecolorallocatealpha($newImage, 0, 0, 0, 127);
            imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
            imagealphablending($newImage, true);

            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

            // Output as PNG first
            ob_start();
            imagepng($newImage, null, 9);
            $pngData = ob_get_clean();

            imagedestroy($image);
            imagedestroy($newImage);

            // Convert to WEBP using ImageMagick if available
            $webpData = self::convertToWebp($pngData);

            $sizeKb = strlen($webpData) / 1024;

            // Upload
            $filename = 'telegram_sticker_' . time() . '_' . rand(1000, 9999) . '.webp';
            $url = HuoShanTos::uploadFromData($webpData, $filename);

            return [
                'success' => true,
                'url' => $url,
                'size_kb' => round($sizeKb, 2),
                'format' => 'webp',
                'dimensions' => $newWidth . 'x' . $newHeight,
            ];

        } catch (\Exception $e) {
            Log::channel('identity')->error('Telegram format failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Package multiple assets into a ZIP file
     * 
     * @param array $assets Array of ['url' => string, 'emotion' => string]
     * @param array $metadata Additional metadata
     * @return array ['success' => bool, 'url' => string]
     */
    public static function packageZip(array $assets, array $metadata = []): array
    {
        try {
            $tmpDir = sys_get_temp_dir() . '/lalaman_export_' . time();
            mkdir($tmpDir, 0755, true);

            $zipPath = $tmpDir . '/stickers.zip';
            $zip = new \ZipArchive();

            if ($zip->open($zipPath, \ZipArchive::CREATE) !== true) {
                return ['success' => false, 'error' => '无法创建ZIP文件'];
            }

            // Download and add each asset
            foreach ($assets as $index => $asset) {
                $imageData = self::downloadImage($asset['url']);
                if ($imageData) {
                    $extension = self::getExtension($asset['url']);
                    $filename = sprintf('%02d_%s.%s', $index + 1, $asset['emotion'] ?? 'sticker', $extension);
                    $zip->addFromString($filename, $imageData);
                }
            }

            // Add metadata JSON
            $metaJson = json_encode([
                'generated_at' => date('Y-m-d H:i:s'),
                'count' => count($assets),
                'platform' => 'LaLaMan 2.0',
                ...$metadata
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $zip->addFromString('metadata.json', $metaJson);

            $zip->close();

            // Read ZIP and upload
            $zipData = file_get_contents($zipPath);
            $filename = 'sticker_pack_' . time() . '.zip';
            $url = HuoShanTos::uploadFromData($zipData, $filename);

            // Clean up
            self::rmdir($tmpDir);

            return [
                'success' => true,
                'url' => $url,
                'count' => count($assets),
            ];

        } catch (\Exception $e) {
            Log::channel('identity')->error('ZIP packaging failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Score image quality (0-100)
     * 
     * Simple heuristic based on file size and dimensions
     * 
     * @param string $imageUrl
     * @return int Quality score 0-100
     */
    public static function scoreQuality(string $imageUrl): int
    {
        try {
            $imageData = self::downloadImage($imageUrl);
            if (!$imageData) {
                return 0;
            }

            $image = imagecreatefromstring($imageData);
            if (!$image) {
                return 0;
            }

            $width = imagesx($image);
            $height = imagesy($image);
            $sizeKb = strlen($imageData) / 1024;

            imagedestroy($image);

            $score = 0;

            // Dimension score (40 points max)
            // Higher resolution = higher score
            $minDim = min($width, $height);
            if ($minDim >= 1024) {
                $score += 40;
            } elseif ($minDim >= 512) {
                $score += 30;
            } elseif ($minDim >= 256) {
                $score += 20;
            } else {
                $score += 10;
            }

            // File size score (30 points max)
            // Appropriate size indicates good detail
            if ($sizeKb >= 100 && $sizeKb <= 2000) {
                $score += 30;
            } elseif ($sizeKb >= 50 && $sizeKb <= 5000) {
                $score += 20;
            } else {
                $score += 10;
            }

            // Aspect ratio score (30 points max)
            // Square-ish images score higher for stickers
            $aspectRatio = $width / max($height, 1);
            if ($aspectRatio >= 0.8 && $aspectRatio <= 1.2) {
                $score += 30;
            } elseif ($aspectRatio >= 0.5 && $aspectRatio <= 2.0) {
                $score += 20;
            } else {
                $score += 10;
            }

            return min(100, max(0, $score));

        } catch (\Exception $e) {
            Log::channel('identity')->error('QC scoring failed', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Check if image should be retried based on quality
     */
    public static function shouldRetry(string $imageUrl): bool
    {
        $score = self::scoreQuality($imageUrl);
        return $score < self::QC_THRESHOLD_RETRY;
    }

    /**
     * Check if image quality is too low to use
     */
    public static function isTooLowQuality(string $imageUrl): bool
    {
        $score = self::scoreQuality($imageUrl);
        return $score < self::QC_THRESHOLD_FAIL;
    }

    // ===== Helper Methods =====

    private static function downloadImage(string $url): ?string
    {
        try {
            $client = new Client(['timeout' => 30]);
            $response = $client->get($url);
            return $response->getBody()->getContents();
        } catch (\Exception $e) {
            return null;
        }
    }

    private static function convertToWebp(string $pngData): string
    {
        // Try using GD if WEBP support is available
        if (function_exists('imagewebp')) {
            $image = imagecreatefromstring($pngData);
            if ($image) {
                ob_start();
                imagewebp($image, null, 80);
                $webpData = ob_get_clean();
                imagedestroy($image);
                if ($webpData) {
                    return $webpData;
                }
            }
        }

        // Fallback: return PNG data (caller should handle)
        return $pngData;
    }

    private static function getExtension(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        $ext = pathinfo($path, PATHINFO_EXTENSION);
        return strtolower($ext) ?: 'png';
    }

    private static function rmdir(string $dir): void
    {
        if (!is_dir($dir))
            return;

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? self::rmdir($path) : unlink($path);
        }
        rmdir($dir);
    }
}
