<?php
/**
 * Run batch generation for all 13 styles
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/support/bootstrap.php';

use app\utils\SeedDream4;
use app\utils\SeedDreamStyles;
use app\utils\HuoShanTos;

// User's image path
$imagePath = __DIR__ . '/batch_test_image.jpg';

if (!file_exists($imagePath)) {
    echo "Error: Image file not found at $imagePath\n";
    exit(1);
}

// 1. Copy to temp file
$tempFile = __DIR__ . '/temp_batch_upload.jpg';
copy($imagePath, $tempFile);

echo "Step 1: Uploading image to TOS...\n";
try {
    // 2. Upload
    $path = HuoShanTos::upload($tempFile, 'batch_test.jpg');

    // 3. Construct URL
    $bucket = config('tos.bucket');
    $endpoint = config('tos.client.endpoint');
    if (strpos($endpoint, 'http') !== 0) {
        $endpoint = 'https://' . $endpoint;
    }
    $endpointHost = preg_replace('#^https?://#', '', $endpoint);
    $imageUrl = "https://{$bucket}.{$endpointHost}{$path}";

    echo "Image uploaded successfully: $imageUrl\n";

    // 4. Get all styles
    $styles = SeedDreamStyles::getStyles();
    echo "Found " . count($styles) . " styles.\n";

    $results = [];

    foreach ($styles as $styleConfig) {
        $styleKey = $styleConfig['key'];
        $styleName = $styleConfig['name'];
        echo "\n------------------------------------------------\n";
        echo "Generating [$styleName] ($styleKey)...\n";

        // Use consistent strength
        $strength = 0.5;

        try {
            $result = SeedDream4::generateWithStyle($imageUrl, $styleKey, '', '2k', $strength);

            if (isset($result['data'][0]['url'])) {
                $genUrl = $result['data'][0]['url'];
                echo "SUCCESS: $genUrl\n";
                $results[] = [
                    'name' => $styleName,
                    'key' => $styleKey,
                    'url' => $genUrl
                ];
            } else {
                echo "FAILED: No URL returned\n";
                print_r($result);
            }
        } catch (\Exception $e) {
            echo "ERROR: " . $e->getMessage() . "\n";
        }

        // Small delay to be nice to API?
        sleep(1);
    }

    echo "\n================================================\n";
    echo "SUMMARY:\n";
    foreach ($results as $res) {
        echo "- [{$res['name']}]: {$res['url']}\n";
    }

} catch (\Exception $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
