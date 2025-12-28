<?php
/**
 * 测试 LibLib 工作流风格
 * 
 * 用法: php scripts/check_liblib_styles.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use app\utils\LibLibAi;
use app\utils\LibLibStyles;

echo "=== LibLib 风格测试 ===\n\n";

// 测试 1: 获取所有可用风格
echo "【1】获取可用风格列表:\n";
$styles = LibLibAi::getAvailableStyles();
foreach ($styles as $style) {
    echo "  - {$style['key']}: {$style['name']} ({$style['name_en']})\n";
    echo "    描述: {$style['description']}\n";
}
echo "\n";

// 测试 2: 获取单个风格详情
echo "【2】获取单个风格详情 (thick_paint_2d):\n";
$style = LibLibStyles::getStyleByKey('thick_paint_2d');
if ($style) {
    echo "  名称: {$style['name']}\n";
    echo "  工作流UUID: {$style['workflow_uuid']}\n";
    echo "  稳定参数:\n";
    foreach ($style['stable_params'] as $key => $value) {
        echo "    - {$key}: {$value}\n";
    }
}
echo "\n";

// 测试 3: 验证风格是否有效
echo "【3】风格验证测试:\n";
$testKeys = ['thick_paint_2d', 'korean_qversion', 'invalid_style'];
foreach ($testKeys as $key) {
    $valid = LibLibStyles::isValidStyle($key);
    echo "  - {$key}: " . ($valid ? "✅ 有效" : "❌ 无效") . "\n";
}
echo "\n";

// 测试 4: 尝试生成图像（需要配置工作流UUID后才能成功）
echo "【4】尝试风格生成 (需配置工作流UUID):\n";
$testImageUrl = "https://example.com/test.jpg";
$testStyleKey = "thick_paint_2d";

try {
    $result = LibLibAi::generateWithStyle($testImageUrl, $testStyleKey);
    echo "  生成成功!\n";
    echo "  generateUuid: " . ($result['data']['generateUuid'] ?? 'N/A') . "\n";
} catch (\Exception $e) {
    echo "  预期错误 (工作流UUID未配置): {$e->getMessage()}\n";
}

echo "\n=== 测试完成 ===\n";
