<?php

namespace app\utils;

class WechatV3Signature
{
    /**
     * 生成微信支付 V3 的 Authorization 签名
     * @param string $method 请求方法，如 GET, POST 等
     * @param string $url_path 请求路径，如 /v3/pay/transactions/jsapi
     * @param string $timestamp 当前时间戳
     * @param string $nonce_str 随机字符串
     * @param string $body 请求体，无请求体时为空字符串
     * @param string $merchant_id 商户号
     * @param string $serial_no 证书序列号
     * @param string $private_key_path 私钥文件路径
     * @return string Authorization 签名
     */
    public static function generateAuthorization(
        string $method,
        string $url_path,
        string $timestamp,
        string $nonce_str,
        string $body,
        string $merchant_id,
        string $serial_no,
        string $private_key_path
    ) {
        // 构造签名串
        $message = self::buildSignatureMessage($method, $url_path, $timestamp, $nonce_str, $body);

        // 使用私钥签名
        $signature = self::signWithPrivateKey($message, $private_key_path);

        // 构造 Authorization 头
        return self::buildAuthorizationHeader($merchant_id, $serial_no, $timestamp, $nonce_str, $signature);
    }

    /**
     * 构造签名串
     */
    private static function buildSignatureMessage(
        string $method,
        string $url_path,
        string $timestamp,
        string $nonce_str,
        string $body
    ) {
        // 获取请求的绝对URL，去除域名部分
        $canonical_url = parse_url($url_path, PHP_URL_PATH);
        if (parse_url($url_path, PHP_URL_QUERY)) {
            $canonical_url .= '?' . parse_url($url_path, PHP_URL_QUERY);
        }

        // 按照规范构造签名串，每行以\n结束，包括最后一行
        return implode("\n", [
            strtoupper($method),
            $canonical_url,
            $timestamp,
            $nonce_str,
            $body,
            ""
        ]);
    }

    /**
     * 使用私钥签名
     */
    private static function signWithPrivateKey(string $message, string $private_key_path) {
        $private_key = openssl_pkey_get_private(file_get_contents($private_key_path));
        if (!$private_key) {
            throw new \Exception('Unable to load private key file');
        }

        $signature = '';
        openssl_sign($message, $signature, $private_key, OPENSSL_ALGO_SHA256);

        return base64_encode($signature);
    }

    /**
     * 构造 Authorization 头
     */
    private static function buildAuthorizationHeader(
        string $merchant_id,
        string $serial_no,
        string $timestamp,
        string $nonce_str,
        string $signature
    ) {
        return "WECHATPAY2-SHA256-RSA2048 mchid=\"{$merchant_id}\",nonce_str=\"{$nonce_str}\",signature=\"{$signature}\",timestamp=\"{$timestamp}\",serial_no=\"{$serial_no}\"";
    }
}