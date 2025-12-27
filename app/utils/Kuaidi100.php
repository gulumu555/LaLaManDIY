<?php

namespace app\utils;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class Kuaidi100
{

    /**
     * 查询快递信息
     * @param string $com 快递公司编码
     * @param string $num 快递单号
     * @param string $phone 手机号(可选)
     * @param string $from 出发地城市(可选)
     * @param string $to 目的地城市(可选)
     * @param bool $resultv2 是否开启行政区域解析
     * @return array 返回包含状态和数据的数组
     */
    public static function query($num, $phone = '', $from = '', $to = '', $resultv2 = true)
    {
        $url = 'http://poll.kuaidi100.com/poll/query.do';

        $param = [
            'com' => 'shunfeng',
            'num' => $num,
            'phone' => $phone,
            'from' => $from,
            'to' => $to,
            'resultv2' => $resultv2 ? '1' : '0'
        ];

        $customer = 'D56B5DB072A041E5D628C4710D22B684';
        $key = 'ceKHGqpZ8737';
        $post_data = [
            'customer' => $customer,
            'param' => json_encode($param)
        ];

        $sign = md5($post_data["param"] . $key . $post_data["customer"]);
        $post_data["sign"] = strtoupper($sign);

        try {
            $response = (new Client())->post($url, [
                'form_params' => $post_data,
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded'
                ],
                'timeout' => 5 // 设置5秒超时
            ]);

            $result = $response->getBody()->getContents();
            $data = json_decode($result, true);

            return [
                'status' => true,
                'data' => $data
            ];

        } catch (RequestException $e) {
            return [
                'status' => false,
                'error' => $e->getMessage(),
                'response' => $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : null
            ];
        }
    }
}
