<?php

namespace app\api\controller;

use app\utils\SeedDream4;
use support\Request;
use support\Log;

/**
 * Identity Controller - LaLaMan 2.0
 * 
 * 处理身份保持风格化图像生成的API请求
 */
class Identity
{
    /**
     * 使用身份保持生成风格化图像
     * 
     * POST /api/Identity/generate
     * 
     * @param Request $request
     * @return \support\Response
     */
    public function generate(Request $request)
    {
        try {
            // 获取请求参数
            $identityImage = $request->post('identity_image');
            $styleKey = $request->post('style_key');
            $userPrompt = $request->post('prompt', '');
            $size = $request->post('size', '2k');
            $controlStrength = (float) $request->post('control_strength', 0.6);
            $refStrength = (float) $request->post('ref_strength', 0.9);

            // 参数验证
            if (empty($identityImage)) {
                return json(['code' => 400, 'msg' => '缺少身份图片参数 (identity_image)']);
            }
            if (empty($styleKey)) {
                return json(['code' => 400, 'msg' => '缺少风格参数 (style_key)']);
            }

            // 调用身份保持生成方法
            $result = SeedDream4::generateWithIdentity(
                $identityImage,
                $styleKey,
                $userPrompt,
                $size,
                $controlStrength,
                $refStrength
            );

            // 检查API响应
            if (isset($result['data'][0]['url'])) {
                return json([
                    'code' => 0,
                    'msg' => 'success',
                    'data' => [
                        'image_url' => $result['data'][0]['url'],
                        'style' => $styleKey,
                        'control_strength' => $controlStrength,
                        'ref_strength' => $refStrength,
                    ]
                ]);
            } else {
                Log::channel('identity')->error('Generation failed', ['result' => $result]);
                return json(['code' => 500, 'msg' => '图像生成失败', 'data' => $result]);
            }

        } catch (\Exception $e) {
            Log::channel('identity')->error('API Exception', ['error' => $e->getMessage()]);
            return json(['code' => 500, 'msg' => '服务异常: ' . $e->getMessage()]);
        }
    }

    /**
     * 获取可用风格列表
     * 
     * GET /api/Identity/styles
     * 
     * @return \support\Response
     */
    public function styles()
    {
        try {
            $styles = SeedDream4::getAvailableStyles();
            return json([
                'code' => 0,
                'msg' => 'success',
                'data' => $styles
            ]);
        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '获取风格列表失败: ' . $e->getMessage()]);
        }
    }
}
