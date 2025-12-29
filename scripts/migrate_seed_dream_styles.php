<?php
/**
 * Database migration script for app_seed_dream_styles table
 * Run: php scripts/migrate_seed_dream_styles.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use think\facade\Db;

echo "Starting migration for app_seed_dream_styles table...\n";

try {
    // Check if table already exists
    $tables = Db::query("SHOW TABLES LIKE 'app_seed_dream_styles'");

    if (!empty($tables)) {
        echo "Table app_seed_dream_styles already exists.\n";

        // Check if we need to add any missing columns
        $columns = Db::query("SHOW COLUMNS FROM app_seed_dream_styles");
        $columnNames = array_column($columns, 'Field');

        $requiredColumns = [
            'id',
            'key',
            'name',
            'category',
            'prompt',
            'reference_images',
            'cover_image',
            'params',
            'sort',
            'is_active',
            'is_new',
            'description'
        ];

        foreach ($requiredColumns as $col) {
            if (!in_array($col, $columnNames)) {
                echo "Adding missing column: {$col}\n";
                // Add column based on type
                switch ($col) {
                    case 'cover_image':
                        Db::execute("ALTER TABLE app_seed_dream_styles ADD COLUMN cover_image varchar(500) COMMENT '封面图片'");
                        break;
                    case 'is_new':
                        Db::execute("ALTER TABLE app_seed_dream_styles ADD COLUMN is_new tinyint(1) DEFAULT 0 COMMENT '是否新品'");
                        break;
                    case 'description':
                        Db::execute("ALTER TABLE app_seed_dream_styles ADD COLUMN description text COMMENT '风格描述'");
                        break;
                }
            }
        }

        echo "Table schema is up to date.\n";
    } else {
        // Create the table
        $sql = "CREATE TABLE `app_seed_dream_styles` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `key` varchar(50) NOT NULL COMMENT '风格唯一标识',
            `name` varchar(100) NOT NULL COMMENT '风格名称',
            `category` varchar(50) DEFAULT 'general' COMMENT '分类: anime/painting/mixed',
            `prompt` text COMMENT '风格提示词',
            `reference_images` json COMMENT '参考图片URL数组',
            `cover_image` varchar(500) COMMENT '封面图片 (前端展示)',
            `params` json COMMENT '其他参数',
            `sort` int(11) DEFAULT 0 COMMENT '排序',
            `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
            `is_new` tinyint(1) DEFAULT 0 COMMENT '是否新品',
            `description` text COMMENT '风格描述',
            `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
            `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uk_key` (`key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Seedream风格配置表'";

        Db::execute($sql);
        echo "Table app_seed_dream_styles created successfully!\n";

        // Insert some default styles
        $defaultStyles = [
            [
                'key' => 'ghibli',
                'name' => '吉卜力',
                'category' => 'anime',
                'prompt' => 'Studio Ghibli anime style, soft watercolor aesthetic, warm nostalgic atmosphere, hand-drawn animation look',
                'reference_images' => json_encode([]),
                'cover_image' => '/images/styles/ghibli.png',
                'sort' => 100,
                'is_active' => 1,
            ],
            [
                'key' => 'ghibli_watercolor',
                'name' => '吉卜力水彩',
                'category' => 'anime',
                'prompt' => 'Studio Ghibli watercolor painting style, delicate brushstrokes, pastel colors, dreamy atmosphere',
                'reference_images' => json_encode([]),
                'cover_image' => '/images/styles/ghibli.png',
                'sort' => 99,
                'is_active' => 1,
                'is_new' => 1,
            ],
            [
                'key' => 'jimmy',
                'name' => '几米',
                'category' => 'anime',
                'prompt' => 'Jimmy Liao illustration style, whimsical storybook art, soft colors, emotional atmosphere, poetic imagery',
                'reference_images' => json_encode([]),
                'cover_image' => '/images/styles/jimmy.png',
                'sort' => 98,
                'is_active' => 1,
                'is_new' => 1,
            ],
            [
                'key' => 'art_toy',
                'name' => '手办 Art Toy',
                'category' => 'mixed',
                'prompt' => 'Art toy figurine style, 3D rendered collectible figure, vinyl toy aesthetic, designer toy look, clean studio lighting',
                'reference_images' => json_encode([]),
                'cover_image' => '/images/styles/art_toy.png',
                'sort' => 97,
                'is_active' => 1,
                'is_new' => 1,
            ],
        ];

        foreach ($defaultStyles as $style) {
            Db::table('app_seed_dream_styles')->insert($style);
            echo "Inserted default style: {$style['name']}\n";
        }
    }

    echo "\nMigration completed successfully!\n";

} catch (\Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
