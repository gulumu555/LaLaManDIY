<?php
namespace app\process;

use support\Log;
use Workerman\Crontab\Crontab;

/**
 * 定时任务，清理tmp_file中的文件
 * 
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 */
class TmpFile
{
    public function onWorkerStart()
    {
        // 每天的3点10执行一次，删除excel文件夹里面超过一天的文件
        new Crontab('10 3 * * *', function ()
        {
            try {
                $path  = './public/tmp_file';
                $files = array_diff(scandir($path), array('.', '..'));
                foreach ($files as $v) {
                    $time = filectime("{$path}/{$v}");
                    if (time() - $time > 86400) {
                        @unlink("{$path}/{$v}");
                    }
                }

                $temp_path  = public_path('temp');
                if (!is_dir($temp_path)) {
                    return;
                }
                $temp_files = array_diff(scandir($temp_path), array('.', '..'));
                foreach ($temp_files as $v) {
                    $filePath = "{$temp_path}/{$v}";
                    // 只处理文件，不处理目录
                    if (is_file($filePath)) {
                        $time = filectime($filePath);
                        // 删除超过1小时的文件
                        if (time() - $time > 3600) {
                            @unlink($filePath);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error($e->getMessage(), []);
            }
        });
    }
}