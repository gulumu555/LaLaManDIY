<?php

namespace app\utils;

class Strs
{
    /**
     * 唯一字符串
     * @param int $length
     * @return string
     * @throws \Exception
     */
    public static function uniqueStr(int $length = 20): string
    {
        $characters = 'ABCDEFGHIJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        $charactersLength = strlen($characters);
        $uniqueString = '';

        // 使用 random_bytes 函数生成随机字节
        for ($i = 0; $i < $length; $i++) {
            $randomByte = random_bytes(1);
            $randomCharacter = $characters[ord($randomByte) % $charactersLength];
            $uniqueString .= $randomCharacter;
        }

        return $uniqueString. time();
    }

    /**
     * 生成订单号
     * @param string $prefix  前缀
     * @return string
     * */
    public static function orderNo(string $prefix = "SN") : string {
        return $prefix.date("YmdHis").rand(1000,9999);
    }
}