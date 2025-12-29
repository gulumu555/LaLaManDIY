<?php
/**
 * 数据库迁移脚本 - 添加AI模型配置字段到 photo_style 表
 * 
 * 使用方法: 在服务器上运行 php scripts/migrate_photo_style_upgrade.php
 * 
 * 新增字段:
 * - model: AI模型选择 (varchar)
 * - reference_images: 参考图数组 (json/text)
 * - style_strength: 风格强度 (decimal)
 * - identity_strength: 身份保持强度 (decimal)
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use support\Db;

echo "=== LaLaMan 1.3 Photo Style 升级迁移 ===\n";
echo "开始时间: " . date('Y-m-d H:i:s') . "\n\n";

try {
    // 检查表是否存在
    $tableExists = Db::select("SHOW TABLES LIKE 'app_photo_style'");
    if (empty($tableExists)) {
        echo "❌ 错误: app_photo_style 表不存在\n";
        exit(1);
    }

    echo "✓ 找到 app_photo_style 表\n";

    // 获取现有列
    $columns = Db::select("SHOW COLUMNS FROM app_photo_style");
    $existingColumns = array_column($columns, 'Field');

    echo "现有列: " . implode(', ', $existingColumns) . "\n\n";

    // 添加 model 字段
    if (!in_array('model', $existingColumns)) {
        echo "添加 model 字段...\n";
        Db::statement("ALTER TABLE app_photo_style ADD COLUMN model VARCHAR(50) DEFAULT 'seedream_4_5' COMMENT 'AI模型选择' AFTER descript");
        echo "✓ model 字段添加成功\n";
    } else {
        echo "⏭ model 字段已存在，跳过\n";
    }

    // 添加 reference_images 字段
    if (!in_array('reference_images', $existingColumns)) {
        echo "添加 reference_images 字段...\n";
        Db::statement("ALTER TABLE app_photo_style ADD COLUMN reference_images TEXT COMMENT 'AI参考图数组(JSON)' AFTER style_img");
        echo "✓ reference_images 字段添加成功\n";
    } else {
        echo "⏭ reference_images 字段已存在，跳过\n";
    }

    // 添加 style_strength 字段
    if (!in_array('style_strength', $existingColumns)) {
        echo "添加 style_strength 字段...\n";
        Db::statement("ALTER TABLE app_photo_style ADD COLUMN style_strength DECIMAL(3,2) DEFAULT 0.70 COMMENT '风格强度 0.1-1.0' AFTER reference_images");
        echo "✓ style_strength 字段添加成功\n";
    } else {
        echo "⏭ style_strength 字段已存在，跳过\n";
    }

    // 添加 identity_strength 字段
    if (!in_array('identity_strength', $existingColumns)) {
        echo "添加 identity_strength 字段...\n";
        Db::statement("ALTER TABLE app_photo_style ADD COLUMN identity_strength DECIMAL(3,2) DEFAULT 0.80 COMMENT '身份保持强度 0.1-1.0' AFTER style_strength");
        echo "✓ identity_strength 字段添加成功\n";
    } else {
        echo "⏭ identity_strength 字段已存在，跳过\n";
    }

    echo "\n=== 迁移完成 ===\n";
    echo "结束时间: " . date('Y-m-d H:i:s') . "\n";

    // 显示更新后的表结构
    echo "\n更新后的表结构:\n";
    $updatedColumns = Db::select("SHOW COLUMNS FROM app_photo_style");
    foreach ($updatedColumns as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }

} catch (Exception $e) {
    echo "❌ 迁移失败: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
