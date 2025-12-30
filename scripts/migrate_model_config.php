<?php
/**
 * 数据库迁移脚本 - 创建 AI模型配置表
 * 
 * 使用方法: php scripts/migrate_model_config.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use support\Db;

echo "=== AI模型配置表迁移 ===\n";
echo "时间: " . date('Y-m-d H:i:s') . "\n\n";

try {
    // 检查表是否存在
    $tableExists = Db::select("SHOW TABLES LIKE 'app_model_config'");

    if (!empty($tableExists)) {
        echo "⏭ app_model_config 表已存在，跳过创建\n";
    } else {
        echo "创建 app_model_config 表...\n";

        Db::statement("
            CREATE TABLE app_model_config (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `key` VARCHAR(50) NOT NULL UNIQUE COMMENT '模型标识',
                name VARCHAR(100) NOT NULL COMMENT '模型名称',
                version VARCHAR(20) DEFAULT '' COMMENT '版本号',
                provider VARCHAR(50) DEFAULT 'volcengine' COMMENT '服务商',
                description TEXT COMMENT '模型描述',
                params JSON COMMENT '模型参数配置',
                api_endpoint VARCHAR(255) COMMENT 'API端点',
                is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
                is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认',
                sort INT DEFAULT 0 COMMENT '排序',
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_key (`key`),
                INDEX idx_active (is_active),
                INDEX idx_default (is_default)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表'
        ");

        echo "✓ 表创建成功\n\n";

        // 插入默认数据
        echo "插入默认模型配置...\n";

        Db::table('app_model_config')->insert([
            [
                'key' => 'seedream_4_5',
                'name' => 'Seedream 4.5',
                'version' => '4.5',
                'provider' => 'volcengine',
                'description' => '火山引擎 Seedream 4.5，当前主力模型，效果最佳',
                'params' => json_encode([
                    'model' => 'seedream-4.5',
                    'max_images' => 4,
                    'supports_identity' => true
                ]),
                'is_active' => 1,
                'is_default' => 1,
                'sort' => 100
            ],
            [
                'key' => 'seedream_4_0',
                'name' => 'Seedream 4.0',
                'version' => '4.0',
                'provider' => 'volcengine',
                'description' => '火山引擎 Seedream 4.0，备用模型',
                'params' => json_encode([
                    'model' => 'seedream-4.0',
                    'max_images' => 4,
                    'supports_identity' => true
                ]),
                'is_active' => 1,
                'is_default' => 0,
                'sort' => 90
            ],
            [
                'key' => 'flux_1_1',
                'name' => 'FLUX 1.1',
                'version' => '1.1',
                'provider' => 'other',
                'description' => 'FLUX模型（预留）',
                'params' => json_encode([
                    'model' => 'flux-1.1',
                    'max_images' => 1,
                    'supports_identity' => false
                ]),
                'is_active' => 0,
                'is_default' => 0,
                'sort' => 50
            ]
        ]);

        echo "✓ 默认数据插入成功\n";
    }

    echo "\n=== 迁移完成 ===\n";

} catch (Exception $e) {
    echo "❌ 迁移失败: " . $e->getMessage() . "\n";
    exit(1);
}
