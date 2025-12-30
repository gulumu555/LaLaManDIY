<?php
/**
 * 数据库迁移脚本 - 创建 AI模型配置表
 * 
 * 使用方法: php scripts/migrate_model_config.php
 */

// 读取数据库配置
$dbHost = getenv('DB_HOST') ?: 'mysql';
$dbName = getenv('DB_DATABASE') ?: 'db_lalaman';
$dbUser = getenv('DB_USERNAME') ?: 'root';
$dbPass = getenv('DB_PASSWORD') ?: 'XbC13v)R';

echo "=== AI模型配置表迁移 ===\n";
echo "时间: " . date('Y-m-d H:i:s') . "\n\n";

try {
    // 连接数据库
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ 数据库连接成功\n\n";

    // 检查表是否存在
    $tableExists = $pdo->query("SHOW TABLES LIKE 'app_model_config'")->fetch();

    if ($tableExists) {
        echo "⏭ app_model_config 表已存在，跳过创建\n";
    } else {
        echo "创建 app_model_config 表...\n";

        $pdo->exec("
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

        $stmt = $pdo->prepare("
            INSERT INTO app_model_config (`key`, name, version, provider, description, params, is_active, is_default, sort)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        // Seedream 4.5 (默认)
        $stmt->execute([
            'seedream_4_5',
            'Seedream 4.5',
            '4.5',
            'volcengine',
            '火山引擎 Seedream 4.5，当前主力模型，效果最佳',
            json_encode(['model' => 'seedream-4.5', 'max_images' => 4, 'supports_identity' => true]),
            1,
            1,
            100
        ]);
        echo "  ✓ Seedream 4.5 (默认)\n";

        // Seedream 4.0
        $stmt->execute([
            'seedream_4_0',
            'Seedream 4.0',
            '4.0',
            'volcengine',
            '火山引擎 Seedream 4.0，备用模型',
            json_encode(['model' => 'seedream-4.0', 'max_images' => 4, 'supports_identity' => true]),
            1,
            0,
            90
        ]);
        echo "  ✓ Seedream 4.0\n";

        echo "\n✓ 默认数据插入成功\n";
    }

    echo "\n=== 迁移完成 ===\n";

} catch (Exception $e) {
    echo "❌ 迁移失败: " . $e->getMessage() . "\n";
    exit(1);
}
