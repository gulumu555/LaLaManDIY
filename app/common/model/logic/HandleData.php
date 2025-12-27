<?php

namespace app\common\model\logic;

use app\utils\ImgUrlTool;

class HandleData
{

    /**
     * 更新模型前处理图片url
     * @param array $data
     * @return array
     * @author yangtao
     * @date 2025/06/13 11:30
     */
    public static function beforeUpdate(array$data): array
    {
        $url_names = config('think-orm.delete_image_prefix');

        foreach ($data as $key => &$value) {
            if (!in_array($key, $url_names)) continue;

            $value = ImgUrlTool::deletePrefix($value);
        }

        return $data;
    }
}