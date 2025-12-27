<?php

namespace app\utils;


class RequestHandle
{
    /**
     * 防重复请求限制
     * @param string $key
     * @param int $ttl
     * @return bool
     * */
    public static function preventRepeat(string $key, int $ttl= 10): bool
    {
        $nx = RedisServer::app()->setnx($key, 232224);

        if ($nx) {
            RedisServer::app()->expire($key,$ttl);
        }

        return $nx;
    }
}