<?php

namespace app\admin\controller;

use app\common\logic\OrdersLogic;
use app\utils\FileDownload;
use support\Request;
use support\Response;

/**
 * 打印订单 控制器
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Orders
{

    // 此控制器是否需要登录
    protected $onLogin = true;

    // 不需要登录的方法
    protected $noNeedLogin = [];


    /**
     * 列表
     * @method get
     * @param Request $request
     * @return Response
     */
    public function getList(Request $request): Response
    {
        $list = OrdersLogic::getList($request->get());
        return success($list);
    }


    /**
     * 获取数据
     * @method get
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function findData(Request $request): Response
    {
        $data = OrdersLogic::findData($request->get('id'));
        return success($data);
    }

    /**
     * @log 发货
     * @method post
     * @param Request $request
     * @return Response
     */
    public function updateShipping(Request $request): Response
    {
        $data = $request->post();
        $data['scene'] = 'shipping';
        $data['logistics_status'] = 2;
        $data['shipping_time'] = date('Y-m-d H:i:s');
        OrdersLogic::update($data);
        return success([], '修改成功');
    }


    public function download(Request $request)
    {
        $urls = $request->post('urls'); // 注意：应该是 urls 而不是 url
        $name = $request->post('name', 'download');

        // 验证参数
        if (empty($urls)) {
            return error('URL列表不能为空');
        }

        return success(self::createZipContent($urls, $name));
    }

    private function createZipContent(array $urls, string $zipName): string
    {
        // 创建临时目录
        $tempDir =  'storage/temp/' . uniqid();
        $publicPath = public_path("/" . $tempDir);
        if (!is_dir($publicPath)) {
            mkdir($publicPath, 0755, true);
        }

        // 下载文件
        $downloadedFiles = [];
        foreach ($urls as $index => $url) {
            $fileName = basename($url);
            $filePath = $publicPath . '/' . $fileName;

            // 下载文件
            $content = file_get_contents($url);
            if ($content !== false) {
                file_put_contents($filePath, $content);
                $downloadedFiles[] = $filePath;
            }
        }

        // 创建临时ZIP文件
        $tempZipPath = $publicPath . '/' . $zipName . '.zip';
        $zip = new \ZipArchive();
        if ($zip->open($tempZipPath, \ZipArchive::CREATE) === TRUE) {
            foreach ($downloadedFiles as $file) {
                $zip->addFile($file, basename($file));
            }
            $zip->close();
        }

        return $tempDir . '/' . $zipName . '.zip';
    }


}