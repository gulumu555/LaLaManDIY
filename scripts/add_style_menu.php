<?php
/**
 * Add AI Style menu entry to admin panel
 * Run: php scripts/add_style_menu.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use think\facade\Db;

echo "Adding AI Style menu entry...\n";

try {
    // Find the parent menu (产品管理 or similar)
    $parentMenus = Db::table('la_admin_menu')
        ->where('name', 'like', '%产品%')
        ->orWhere('name', 'like', '%商品%')
        ->select();

    echo "Found parent menus:\n";
    foreach ($parentMenus as $menu) {
        echo "  - ID: {$menu['id']}, Name: {$menu['name']}, Path: " . ($menu['path'] ?? 'null') . "\n";
    }

    // Check if AI Style menu already exists
    $exists = Db::table('la_admin_menu')
        ->where('path', '/products/seedDreamStyle')
        ->find();

    if ($exists) {
        echo "\nAI Style menu already exists (ID: {$exists['id']})\n";
    } else {
        // Get the products parent ID (or use a fallback)
        $parentId = 0;
        foreach ($parentMenus as $menu) {
            if (isset($menu['path']) && strpos($menu['path'], '/products') !== false) {
                $parentId = $menu['id'];
                break;
            }
            if ($menu['name'] === '产品管理') {
                $parentId = $menu['id'];
                break;
            }
        }

        // If no parent found, find any top-level menu
        if ($parentId === 0) {
            $topMenu = Db::table('la_admin_menu')
                ->where('pid', 0)
                ->order('sort desc')
                ->find();
            if ($topMenu) {
                $parentId = $topMenu['id'];
                echo "Using fallback parent: {$topMenu['name']} (ID: {$parentId})\n";
            }
        }

        // Get max sort order
        $maxSort = Db::table('la_admin_menu')
            ->where('pid', $parentId)
            ->max('sort') ?? 0;

        // Insert new menu
        $menuId = Db::table('la_admin_menu')->insertGetId([
            'pid' => $parentId,
            'name' => 'AI风格配置',
            'path' => '/products/seedDreamStyle',
            'type' => 1,
            'icon' => 'BgColorsOutlined',
            'sort' => $maxSort + 1,
            'is_show' => 1,
            'status' => 1,
            'create_time' => date('Y-m-d H:i:s'),
            'update_time' => date('Y-m-d H:i:s'),
        ]);

        echo "\nAdded AI Style menu (ID: {$menuId}) under parent ID: {$parentId}\n";

        // Add sub-permissions
        $permissions = [
            ['name' => 'AI风格列表', 'path' => 'seedDreamStyleGetList', 'type' => 2],
            ['name' => 'AI风格新增', 'path' => 'seedDreamStyleCreate', 'type' => 2],
            ['name' => 'AI风格编辑', 'path' => 'seedDreamStyleUpdate', 'type' => 2],
            ['name' => 'AI风格删除', 'path' => 'seedDreamStyleDelete', 'type' => 2],
            ['name' => 'AI风格状态', 'path' => 'seedDreamStyleUpdateStatus', 'type' => 2],
        ];

        foreach ($permissions as $perm) {
            Db::table('la_admin_menu')->insert([
                'pid' => $menuId,
                'name' => $perm['name'],
                'path' => $perm['path'],
                'type' => $perm['type'],
                'is_show' => 0,
                'status' => 1,
                'create_time' => date('Y-m-d H:i:s'),
                'update_time' => date('Y-m-d H:i:s'),
            ]);
            echo "  Added permission: {$perm['name']}\n";
        }
    }

    echo "\nMenu setup completed!\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
