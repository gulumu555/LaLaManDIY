<?php

namespace app\utils;

use GuzzleHttp\Client;
use support\Log;

class TencentLocation
{
    public const API_BASE_URL = 'https://apis.map.qq.com';

    /**
     * 根据经纬度获取地址信息
     * @param $location
     * @return mixed
     */
    public static function getLocation($lat,$lng)
    {
        try {
            $request = (new Client());

            $key = getenv('TENCENT_MAP_API_KEY');
            $response = $request->get(self::API_BASE_URL. "/ws/geocoder/v1/?location={$lat},{$lng}&key={$key}");

            $response = json_decode($response->getBody()->getContents(), true);

            if ($response['status'] == 0) {
                return [
                    'address' => $response['result']['address'],
                    'address_component' => $response['result']['address_component'],
                    'address_reference' => $response['result']['address_reference'],
                ];
            }
            return [
                'address' => '',
                'address_component' => [],
                'address_reference' => []
            ];
        }catch (\Exception $e){
            abort($e->getMessage());
        }
    }
}