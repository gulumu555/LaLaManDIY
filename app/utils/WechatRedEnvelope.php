<?php

namespace app\utils;

use DOMDocument;
use GuzzleHttp\Client;

/**
 * 微信红包工具类
 * Class WechatRedEnvelope
 * @package app\utils
 */
class WechatRedEnvelope
{

    public static function withdraw($openid, $amount)
    {
        try {
            $url='https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';

            $nonce_str = uniqid();
            $payload = [
                'nonce_str' => $nonce_str,
                'mch_billno' => get_order_no(),
                'mch_id' => config('superadminx.wechat_pay.mch_id'),
                'wxappid' => config('superadminx.wechat_xiaochengxu.AppID'),
                'send_name' => '拉拉漫',
                're_openid' => $openid,
                'total_amount' => intval($amount * 100),
                'total_num' => 1,
                'wishing' => '提现成功',
                'client_ip' => request()->getLocalIp(),
                'act_name' => '提现红包',
                'remark' => '提现红包',
                'scene_id' => 'PRODUCT_3'
            ];

            $signature = WechatV3Signature::generateAuthorization(
                'POST',
                '/mmpaymkttransfers/sendredpack',
                time(),
                $nonce_str,
                json_encode($payload),
                config('superadminx.wechat_pay.mch_id'),
                config('superadminx.wechat_pay.serial_no'),
                config_path('wechat_cert/apiclient_key.pem')
            );


            // 将签名插入到第二位
            $payload = array_merge(
                ['nonce_str' => $payload['nonce_str']],
                ['sign' => $signature],
                array_slice($payload, 1)
            );

            $payload = self::cleanRequestParams($payload);

            $xml = self::arrayToXml($payload);


            $response = self::postXmlCurl($xml, $url, true, 30);

            // 解析返回结果
            $result = self::xmlToArray($response);

            if ($result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS') {
                return ['status' => true, 'data' => $result];
            } else {
                $errorMsg = $result['err_code_des'] ?? $result['return_msg'];
                return ['status' => false, 'message' => $errorMsg, 'data' => $result];
            }

        }catch (\Exception $e){
            abort($e->getMessage());
        }
    }

    /**
     * 清理请求参数
     * @param array $params 原始参数
     * @return array 清理后的参数
     */
    private static function cleanRequestParams($params) {
        $cleaned = [];

        foreach ($params as $key => $value) {
            if (is_string($value)) {
                // 去除首尾空格
                $value = trim($value);
                // 替换连续空格为单个空格（根据需求可选）
                $value = preg_replace('/\s+/', ' ', $value);
            }
            $cleaned[$key] = $value;
        }

        return $cleaned;
    }
    /**
     * 数组转XML
     * @param array $data 数组数据
     * @return string
     */
    private static function arrayToXml($data) {
        $xml = '<xml>';
        foreach ($data as $key => $val) {
            if (is_numeric($val)) {
                $xml .= '<' . $key . '>' . $val . '</' . $key . '>';
            } else {
                // 直接使用CDATA包裹，不进行编码转换
                $xml .= '<' . $key . '><![CDATA[' . $val . ']]></' . $key . '>';
            }
        }
        $xml .= '</xml>';
        return $xml;
    }

    /**
     * 以POST方式提交XML到对应的接口url（使用GuzzleHttp实现）
     * @param string $xml 需要post的xml数据
     * @param string $url url
     * @param bool $useCert 是否需要证书，默认需要
     * @param int $second url执行超时时间，默认30s
     * @return string
     * @throws \Exception
     */
    private static function postXmlCurl($xml, $url, $useCert = true, $second = 30) {
        $options = [
            'timeout' => $second,
            'headers' => [
                'Content-Type' => 'application/xml'
            ],
            'body' => $xml,
            'verify' => true, // 验证SSL证书
            'http_errors' => false // 不抛出HTTP错误异常
        ];

        // 如果需要使用证书
        if ($useCert) {
            $cert_path = config_path('wechat_cert/apiclient_cert.pem');
            $key_path = config_path('wechat_cert/apiclient_key.pem');
            if (!file_exists($cert_path) || !file_exists($key_path)) {
                throw new \Exception('证书文件不存在');
            }

            $options['cert'] = $cert_path;
            $options['ssl_key'] = $key_path;
        }

        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post($url, $options);

            if ($response->getStatusCode() == 200) {
                return (string)$response->getBody();
            } else {
                throw new \Exception("HTTP请求失败，状态码: " . $response->getStatusCode());
            }
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            throw new \Exception("Guzzle请求异常: " . $e->getMessage());
        } catch (\Exception $e) {
            throw new \Exception("发生错误: " . $e->getMessage());
        }
    }

    /**
     * XML转数组（使用DOMDocument）
     * @param string $xml XML字符串
     * @return array
     * @throws Exception
     */
    private static function xmlToArray($xml) {
        $doc = new DOMDocument();

        // 禁用外部实体加载（兼容所有PHP版本）
        $oldValue = null;
        if (PHP_VERSION_ID < 80000) {
            $oldValue = libxml_disable_entity_loader(true);
        }

        // 加载XML
        $loaded = $doc->loadXML($xml, LIBXML_NOCDATA | LIBXML_NOENT);

        // 恢复原始设置（仅PHP 8.0以下）
        if (PHP_VERSION_ID < 80000 && $oldValue !== null) {
            libxml_disable_entity_loader($oldValue);
        }

        if (!$loaded) {
            throw new \Exception('XML解析失败');
        }

        // 转换为数组
        $result = self::domToArray($doc->documentElement);

        return $result ?: [];
    }

    /**
     * 将DOM节点转换为数组
     * @param DOMNode $node
     * @return array|string
     */
    private static function domToArray($node) {
        $output = [];

        switch ($node->nodeType) {
            case XML_CDATA_SECTION_NODE:
            case XML_TEXT_NODE:
                $output = trim($node->textContent);
                break;

            case XML_ELEMENT_NODE:
                foreach ($node->childNodes as $child) {
                    $value = self::domToArray($child);

                    if (isset($child->tagName)) {
                        $tag = $child->tagName;

                        if (!isset($output[$tag])) {
                            $output[$tag] = [];
                        }

                        $output[$tag][] = $value;
                    } elseif ($value !== '') {
                        $output = (string)$value;
                    }
                }

                if ($node->attributes->length && !is_array($output)) {
                    $output = ['@content' => $output];
                }

                if (is_array($output)) {
                    foreach ($node->attributes as $attrName => $attrNode) {
                        $output['@attributes'][$attrName] = (string)$attrNode->value;
                    }
                }
                break;
        }

        return $output;
    }
}