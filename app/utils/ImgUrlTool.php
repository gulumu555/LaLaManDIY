<?php

namespace app\utils;

class ImgUrlTool
{
    public static function deletePrefix($url)
    {
        return is_array($url) ? array_map(function($item){
            return substr($item, strrpos($item, '/upload'));
        },$url) : substr($url, strrpos($url, '/upload'));
    }

    public static function addPrefix($url)
    {
        return $url ? (
            is_array($url) ? array_map(function($item){
                return $item ? (getenv('IMAGE_PREFIX') . $item) : $item;
            }, $url) : (getenv('IMAGE_PREFIX') . $url)
        ) : (string)$url;
    }
}