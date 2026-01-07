<?php
namespace app\api\controller;

use support\Request;
use support\Response;
use app\common\logic\SeedDreamStyleLogic;
use app\common\model\SeedDreamStyleModel;

class DebugStyle
{
    public function index(Request $request): Response
    {
        $action = $request->post('action', '');
        $message = '';

        if ($request->method() === 'POST') {
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
                    $message = '<p class="success">✅ 测试风格添加成功！<a href="" style="color:#4ecca3">刷新页面</a></p>';
                } catch (\Exception $e) {
                    $message = '<p class="error">❌ 添加失败: ' . htmlspecialchars($e->getMessage()) . '</p>';
                }
            } elseif ($action === 'update') {
                try {
                    $refImages = [];
                    $rawRefImages = $request->post('reference_images', '');
                    if (!empty($rawRefImages)) {
                        $lines = explode("\n", $rawRefImages);
                        foreach ($lines as $line) {
                            $line = trim($line);
                            if ($line)
                                $refImages[] = $line;
                        }
                    }

                    $updateData = [
                        'id' => $request->post('id'),
                        'style_strength' => $request->post('style_strength'),
                        'identity_strength' => $request->post('identity_strength'),
                        'model' => $request->post('model'),
                        'category' => $request->post('category'),
                        'reference_images' => $refImages
                    ];
                    SeedDreamStyleLogic::update($updateData);
                    $message = '<p class="success">✅ 风格 ID ' . $request->post('id') . ' 更新成功！<a href="" style="color:#4ecca3">刷新查看</a></p>';
                } catch (\Exception $e) {
                    $message = '<p class="error">❌ 更新失败: ' . htmlspecialchars($e->getMessage()) . '</p>';
                }
            }
        }

        // Get Data
        $styles = SeedDreamStyleModel::order('id', 'desc')->select()->toArray();
        $stylesHtml = '';

        foreach ($styles as $style) {
            $refCount = is_array($style['reference_images']) ? count($style['reference_images']) : 0;
            $refContent = '';
            if (!empty($style['reference_images']) && is_array($style['reference_images'])) {
                $refContent = implode("\n", $style['reference_images']);
            }

            $catOptions = '';
            $cats = ['anime' => '动漫', 'painting' => '绘画', 'mixed' => '混合', 'general' => '通用'];
            foreach ($cats as $k => $v) {
                $sel = ($style['category'] ?? 'anime') == $k ? 'selected' : '';
                $catOptions .= "<option value='$k' $sel>$v</option>";
            }

            $modelOptions = '';
            $models = ['seedream_4_5' => 'Seedream 4.5', 'seedream_4_0' => 'Seedream 4.0', 'flux_1_1' => 'FLUX 1.1'];
            foreach ($models as $k => $v) {
                $sel = ($style['model'] ?? 'seedream_4_5') == $k ? 'selected' : '';
                $modelOptions .= "<option value='$k' $sel>$v</option>";
            }

            $styleStrength = $style['style_strength'] ?? 0.7;
            $identityStrength = $style['identity_strength'] ?? 0.8;

            $stylesHtml .= <<<TR
                <tr>
                    <form method="POST">
                        <input type="hidden" name="action" value="update">
                        <input type="hidden" name="id" value="{$style['id']}">
                        <td>{$style['id']}</td>
                        <td><code>{$style['key']}</code></td>
                        <td>{$style['name']}</td>
                        <td>
                            <select name="category" style="width: 80px;">
                                $catOptions
                            </select>
                        </td>
                        <td>
                            <select name="model" style="width: 120px;">
                                $modelOptions
                            </select>
                        </td>
                        <td>
                            <input type="number" step="0.01" min="0" max="1" name="style_strength" value="$styleStrength" style="width: 60px;">
                        </td>
                        <td>
                            <input type="number" step="0.01" min="0" max="1" name="identity_strength" value="$identityStrength" style="width: 60px;">
                        </td>
                        <td>
                            <details>
                                <summary>参考图 ($refCount)</summary>
                                <textarea name="reference_images" style="width: 100%; height: 60px;">$refContent</textarea>
                            </details>
                        </td>
                        <td>
                            <button type="submit" class="btn">💾 保存</button>
                        </td>
                    </form>
                </tr>
TR;
        }

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>AI 风格配置测试 (Controller版)</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1100px; margin: 20px auto; background: #1a1a2e; color: #eee; padding: 20px; }
        h1 { color: #4ecca3; }
        .card { background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
        th { background: #0f3460; }
        .success { color: #4ecca3; }
        .error { color: #ff6b6b; }
        .btn { background: #4ecca3; color: #1a1a2e; padding: 5px 15px; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #3aa888; }
        textarea { background: #333; color: #eee; border: 1px solid #555; font-size: 11px; }
        input, select { background: #333; color: #eee; border: 1px solid #555; padding: 4px; }
        details summary { cursor: pointer; font-size: 12px; color: #aaa; }
    </style>
</head>
<body>
    <h1>🎨 AI 风格配置测试 (Local Controller)</h1>
    <div class="card">
        $message
        <h2>风格列表 (共 <span style="color:#4ecca3">ok</span>)</h2>
        <table>
            <tr>
                <th>ID</th><th>Key</th><th>名称</th><th>分类</th><th>模型</th><th>风格权重</th><th>身份权重</th><th>参考图</th><th>操作</th>
            </tr>
            $stylesHtml
        </table>
    </div>
    <div class="card">
        <form method="POST" style="display: inline;">
            <input type="hidden" name="action" value="add">
            <button type="submit" class="btn">+ 添加测试风格</button>
        </form>
    </div>
</body>
</html>
HTML;

        return response($html);
    }

    /**
     * Test API - verify database data retrieval (no auth required)
     */
    public function testData(Request $request): Response
    {
        $data = [];

        try {
            // Test Category
            $categories = \app\common\model\CategoryModel::where('type', 2)->limit(5)->select()->toArray();
            $data['category_count'] = count($categories);
            $data['categories'] = $categories;

            // Test PhotoStyle
            $styles = \app\common\model\PhotoStyleModel::limit(5)->select()->toArray();
            $data['photo_style_count'] = count($styles);
            $data['photo_styles'] = $styles;

            // Test SeedDreamStyle
            $seedStyles = \app\common\model\SeedDreamStyleModel::limit(5)->select()->toArray();
            $data['seed_dream_style_count'] = count($seedStyles);
            $data['seed_dream_styles'] = $seedStyles;

            $data['status'] = 'success';
        } catch (\Exception $e) {
            $data['status'] = 'error';
            $data['error'] = $e->getMessage();
        }

        return json($data);
    }
}
