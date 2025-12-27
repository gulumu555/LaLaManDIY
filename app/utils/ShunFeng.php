<?php

namespace app\utils;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use support\Log;
use think\Collection;

class ShunFeng
{
//    public const BASE_RUL = 'https://sfapi-sbox.sf-express.com';

    public const BASE_RUL = 'https://bspgw.sf-express.com';
    public const PARENT_ID = 'LLMSZICMO1JC';
    public const SECRET = 'BK6CgJw2TUlIq2p0Gvm4bcJuMnYZH8nC';

    public const OP_CODE = [
        10 => "运送中",
        11 => "运送中",
        14 => "运送中",
        15 => "运送中",
        16 => "运送中",
        17 => "运送中",
        18 => "运送中",
        30 => "运送中",
        31 => "运送中",
        33 => "待取件",
        34 => "返送中",
        35 => "运送中",
        43 => "已揽收",
        44 => "返送中",
        46 => "已揽收",
        50 => "已揽收",
        51 => "已揽收",
        54 => "已揽收",
        64 => "运送中",
        65 => "运送中",
        70 => "已取消",
        72 => "运送中",
        75 => "运送中",
        77 => "已作废",
        80 => "已签收",
        86 => "运送中",
        87 => "运送中",
        88 => "运送中",
        89 => "运送中",
        90 => "运送中",
        91 => "已退回",
        92 => "已转寄",
        93 => "运送中",
        94 => "运送中",
        95 => "运送中",
        96 => "运送中",
        97 => "运送中",
        98 => "运送中",
        99 => "待派送",
        100 => "运送中",
        123 => "派送中",
        125 => "待取件",
        126 => "待取件",
        127 => "待接收",
        128 => "已接收",
        129 => "已接收",
        131 => "已取消",
        135 => "已接收",
        136 => "返送中",
        137 => "返送中",
        138 => "待接收",
        140 => "返送中",
        141 => "已接收",
        147 => "返送中",
        151 => "派送中",
        152 => "派送中",
        153 => "派送中",
        154 => "派送中",
        186 => "返送中",
        187 => "返送中",
        188 => "已揽收",
        193 => "返送中",
        195 => "返送中",
        197 => "返送中",
        201 => "仓库处理中",
        202 => "待接收",
        204 => "派送中",
        205 => "仓库处理中",
        206 => "仓库处理中",
        207 => "已取消",
        208 => "返送中",
        211 => "派送中",
        218 => "待取件",
        220 => "返送中",
        221 => "返送中",
        229 => "派送中",
        230 => "返送中",
        231 => "返送中",
        302 => "返送中",
        306 => "返送中",
        405 => "返送中",
        406 => "返送中",
        407 => "返送中",
        408 => "返送中",
        570 => "返送中",
        571 => "返送中",
        604 => "返送中",
        605 => "返送中",
        606 => "返送中",
        607 => "已揽收",
        610 => "返送中",
        611 => "返送中",
        612 => "返送中",
        614 => "运送中",
        616 => "运送中",
        619 => "运送中",
        620 => "运送中",
        621 => "运送中",
        626 => "运送中",
        627 => "已转寄",
        630 => "运送中",
        631 => "已退回",
        632 => "待取件",
        634 => "运送中",
        642 => "待取件",
        646 => "仓库处理中",
        647 => "待揽收",
        648 => "运送中",
        649 => "运送中",
        651 => "待揽收",
        655 => "待揽收",
        656 => "运送中",
        657 => "待取件",
        658 => "已签收",
        660 => "已取消",
        681 => "待取件",
        701 => "已签收",
        900 => "运送中",
        901 => "运送中",
        930 => "运送中",
        931 => "运送中",
        932 => "已转寄",
        933 => "运送中",
        934 => "待派送",
        935 => "已签收",
        1105 => "运送中",
        1106 => "运送中",
        1635 => "运送中",
        8000 => "已签收",
        950 => "已揽收",
        980 => "已签收",
    ];

    /**
     * @throws GuzzleException
     */
    public static function send($number, $phone)
    {

        try {
            $access_token = self::getAccessToken();

            $msg_data = [
                'trackingType' => 1,
                'trackingNumber' => $number,
                'checkPhoneNo' => substr($phone,  -4)
            ];
            $params = [
                'partnerID' => self::PARENT_ID,
                'requestID' => uniqid(),
                'serviceCode' => 'EXP_RECE_SEARCH_ROUTES',
                'timestamp' => time(),
                'accessToken' => $access_token,
                'msgData' => json_encode($msg_data),
            ];

            $response = (new Client())->post(self::BASE_RUL . '/std/service', [
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ],
                'form_params' => $params,
            ]);

            $result = json_decode(json_decode($response->getBody()->getContents(), true)['apiResultData'], true);

            $filter_info = $result['msgData']['routeResps'];

            $route_info = reset($filter_info)['routes'];


            $collection = new Collection($route_info);

            return array_values($collection->sort(function ($a, $b){
                return $b['secondaryStatusCode'] <=> $a['secondaryStatusCode'];
            })->toArray());

            /*return array_map(function ($item) {
                $item['operationName'] =  $item['firstStatusName'];
                return $item;
            }, $list);*/
        }catch (\Exception $e){
            abort($e->getMessage());
        }
    }

    /**
     * 获取访问令牌
     * @return array|string 请求结果
     * @throws GuzzleException
     */
    public static function getAccessToken(): array|string
    {
        try {
            $response = (new Client())->request('POST', self::BASE_RUL . '/oauth2/accessToken', [
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ],
                'form_params' => [
                    'partnerID' => self::PARENT_ID,
                    'secret' => self::SECRET,
                    'grantType' => 'password',
                ],
            ]);

            return json_decode($response->getBody()->getContents(), true)['accessToken'];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ];
        }
    }
}
