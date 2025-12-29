<?php
/**
 * SeedDreamStyle API Test Page
 * Access via: http://localhost:8111/public/seed_style_admin.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use app\common\logic\SeedDreamStyleLogic;

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>

<head>
    <title>AI 风格配置测试</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            background: #1a1a2e;
            color: #eee;
            padding: 20px;
        }

        h1 {
            color: #4ecca3;
        }

        .card {
            background: #16213e;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #333;
        }

        th {
            background: #0f3460;
        }

        .success {
            color: #4ecca3;
        }

        .error {
            color: #ff6b6b;
        }

        .btn {
            background: #4ecca3;
            color: #1a1a2e;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }

        .btn:hover {
            background: #3aa888;
        }

        .btn-danger {
            background: #ff6b6b;
        }

        img {
            max-width: 60px;
            max-height: 60px;
            border-radius: 4px;
        }

        .tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin: 2px;
        }

        .tag-active {
            background: #4ecca3;
            color: #000;
        }

        .tag-inactive {
            background: #666;
        }

        .tag-new {
            background: #ff6b6b;
            color: #fff;
        }

        code {
            background: #333;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>

<body>
    <h1>🎨 AI 风格配置测试</h1>

    <div class="card">
        <h2>数据库连接测试</h2>
        <?php
        try {
            $styles = SeedDreamStyleLogic::getActiveStyles();
            echo '<p class="success">✅ 数据库连接成功</p>';
        } catch (Exception $e) {
            echo '<p class="error">❌ 数据库连接失败: ' . htmlspecialchars($e->getMessage()) . '</p>';
            $styles = [];
        }
        ?>
    </div>

    <div class="card">
        <h2>风格列表 (共 <?php echo count($styles); ?> 个启用)</h2>
        <?php if (empty($styles)): ?>
            <p>暂无风格数据，点击下方按钮添加测试风格</p>
        <?php else: ?>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Key</th>
                    <th>名称</th>
                    <th>分类</th>
                    <th>参考图</th>
                    <th>状态</th>
                </tr>
                <?php foreach ($styles as $style): ?>
                    <tr>
                        <td><?php echo $style['id']; ?></td>
                        <td><code><?php echo htmlspecialchars($style['key']); ?></code></td>
                        <td><?php echo htmlspecialchars($style['name']); ?></td>
                        <td><?php echo htmlspecialchars($style['category'] ?? 'general'); ?></td>
                        <td>
                            <?php
                            $refCount = is_array($style['reference_images']) ? count($style['reference_images']) : 0;
                            echo $refCount . ' 张';
                            ?>
                        </td>
                        <td>
                            <span class="tag tag-active">启用</span>
                            <?php if (!empty($style['is_new'])): ?>
                                <span class="tag tag-new">新品</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php endif; ?>
    </div>

    <div class="card">
        <h2>快速操作</h2>
        <form method="POST" style="display: inline;">
            <input type="hidden" name="action" value="add">
            <button type="submit" class="btn">+ 添加测试风格</button>
        </form>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $action = $_POST['action'] ?? '';

            if ($action === 'add') {
                try {
                    SeedDreamStyleLogic::create([
                        'key' => 'demo_style_' . time(),
                        'name' => '演示风格 ' . date('H:i:s'),
                        'category' => 'mixed',
                        'prompt' => 'A demo style for testing the admin system',
                        'is_active' => 1,
                        'is_new' => 1,
                        'sort' => 100,
                    ]);
                    echo '<p class="success">✅ 测试风格添加成功！<a href="" style="color:#4ecca3">刷新页面</a>查看</p>';
                } catch (Exception $e) {
                    echo '<p class="error">❌ 添加失败: ' . htmlspecialchars($e->getMessage()) . '</p>';
                }
            }
        }
        ?>
    </div>

    <div class="card">
        <h2>后端 API 端点</h2>
        <ul>
            <li><code>GET /admin/SeedDreamStyle/getList</code> - 获取风格列表</li>
            <li><code>GET /admin/SeedDreamStyle/getCategories</code> - 获取分类</li>
            <li><code>POST /admin/SeedDreamStyle/create</code> - 添加风格</li>
            <li><code>POST /admin/SeedDreamStyle/update</code> - 更新风格</li>
            <li><code>POST /admin/SeedDreamStyle/delete</code> - 删除风格</li>
            <li><code>POST /admin/SeedDreamStyle/updateStatus</code> - 更新状态</li>
        </ul>
        <p style="color: #888; font-size: 12px;">注意: 上述API需要JWT Token认证</p>
    </div>
</body>

</html>