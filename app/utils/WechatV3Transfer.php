<?php

namespace app\utils;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use InvalidArgumentException;
use support\Log;
use UnexpectedValueException;

class WechatV3Transfer
{
    protected const BASE_URL = 'https://api.mch.weixin.qq.com';
    public static function transfer($openid, $amount, $out_bill_no)
    {
        try {

            $url = '/v3/fund-app/mch-transfer/transfer-bills';

            $payload = [
                'appid' => config('superadminx.wechat_xiaochengxu.AppID'),
                'out_bill_no' => $out_bill_no,
                //转账场景ID 1000现金营销
                'transfer_scene_id' => '1000',
                'openid' => $openid,
                'transfer_amount' => intval($amount * 100),
                'transfer_remark' => '现金奖励提现',
                'notify_url' => config('superadminx.url') . '/api/WithdrawOrder/notify',
                'transfer_scene_report_infos' => [
                    [
                        'info_type' => '活动名称',
                        'info_content' => '现金营销'
                    ],
                    [
                        'info_type' => '奖励说明',
                        'info_content' => '用户市场推广奖励'
                    ]
                ]
            ];

            $headers = [
                'Authorization' => self::generateAuthHeader('post', $url, $payload),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ];

            $client = new Client();

            $response = $client->post(self::BASE_URL . $url, [
                'headers' => $headers,
                'json' => $payload
            ]);

            $responseBody = $response->getBody()->getContents();

            Log::channel('transfer')->info('转账返回：' . json_encode($responseBody));
            return $responseBody;
        }catch (\Exception $e){
            Log::channel('transfer')->info('转账异常：' . $e->getMessage());

            abort($e->getResponse()->getBody());
        }
    }

    public static function search($out_bill_no)
    {
        try {
            $url = "/v3/fund-app/mch-transfer/transfer-bills/out-bill-no/{$out_bill_no}";

            $headers = [
                'Authorization' => self::generateAuthHeader('get', $url),
                'Accept' => 'application/json',
            ];

            $client = new Client();

            $response = $client->get(self::BASE_URL . $url, [
                'headers' => $headers,
            ]);

            return json_decode($response->getBody()->getContents(), true);
        }catch (\Exception $e){

            abort($e->getResponse()->getBody());
        }
    }

    private static function generateAuthHeader(string $method, string $url, array $payload = []): string
    {
        $config = config('superadminx.wechat_pay');
        return WechatV3Signature::generateAuthorization(
            $method,
            $url,
            time(),
            uniqid(),
            $payload ? json_encode($payload) : '',
            $config['mch_id'],
            $config['serial_no'],
            config_path('wechat_cert/apiclient_key.pem')
        );
    }
}