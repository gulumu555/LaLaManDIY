<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/support/bootstrap.php';

use GuzzleHttp\Client;

echo "Starting Identity Probe V2 (Advanced Parameters)...\n";

$selfieUrl = 'https://ark-auto-2107415805-cn-beijing-default.tos-cn-beijing.volces.com/upload/20250703/pexels-mostafasanadd-868113.jpg';
$styleUrl = 'https://p3-arcos.byteimg.com/tos-cn-i-qvj2lq49k0/7a2741982638402781b07222513Z2382~tplv-qvj2lq49k0-image.image';

$apiKey = config('tos.ark_api_key');
$modelId = 'doubao-seedream-4-5-251128';
$baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

function testPayload($name, $json)
{
    global $client, $baseUrl, $apiKey;
    echo "\nTesting: $name\n";
    try {
        $client = new Client();
        $response = $client->post($baseUrl, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey,
            ],
            'json' => $json,
        ]);
        $body = $response->getBody()->getContents();
        $result = json_decode($body, true);
        if (isset($result['data'][0]['url'])) {
            echo "SUCCESS: " . $result['data'][0]['url'] . "\n";
        } else {
            echo "FAILED.\n";
            // print_r($result);
        }
    } catch (\Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        if ($e instanceof \GuzzleHttp\Exception\RequestException && $e->hasResponse()) {
            // echo "Response: " . $e->getResponse()->getBody()->getContents() . "\n";
        }
    }
}

// 1. generate_config logic (seen in online docs for Doubao sometimes)
$json1 = [
    'model' => $modelId,
    'prompt' => "Studio Ghibli style, vibrant colors, anime style. A portrait of a girl.",
    'image_urls' => [$styleUrl, $selfieUrl],
    'generate_config' => [
        'reference_image_config' => [
            ['url' => $styleUrl, 'weight' => 1.0, 'mode' => 'style'],
            ['url' => $selfieUrl, 'weight' => 0.8, 'mode' => 'face'] // 'face' or 'id'
        ]
    ],
    'size' => '2k',
    'response_format' => 'url',
];
testPayload("Config Object (Hypothesis)", $json1);

// 2. Separate parameters
$json2 = [
    'model' => $modelId,
    'prompt' => "Studio Ghibli style, vibrant colors. A portrait of the person.",
    // image_urls for Structure/Face
    'image_urls' => [$selfieUrl],
    // sref_urls for Style (Hypothesis from Midjourney/Niji overlap)
    'sref_urls' => [$styleUrl],
    'style_strength' => 0.8,
    'size' => '2k',
    'response_format' => 'url',
];
testPayload("Separate SREF Param (Hypothesis)", $json2);

// 3. ControlNet style params
$json3 = [
    'model' => $modelId,
    'prompt' => "Studio Ghibli style. A portrait of the person.",
    'image_urls' => [$selfieUrl],
    'control_strength' => 0.6, // Trying to weaken the selfie influence
    'ref_strength' => 0.9,
    'size' => '2k',
    'response_format' => 'url',
];
testPayload("Strength Params (Hypothesis)", $json3);

?>