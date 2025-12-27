<?php

namespace app\utils;

use TencentCloud\Common\CommonClient;
use TencentCloud\Common\Exception\TencentCloudSDKException;
use TencentCloud\Common\Credential;
use TencentCloud\Common\Profile\ClientProfile;
use TencentCloud\Common\Profile\HttpProfile;


class HunYuan
{

    public static function createTask($front_image, $image_url)
    {
        try {
            $cred = new Credential(getenv("TENCENTCLOUD_SECRET_ID"), getenv("TENCENTCLOUD_SECRET_KEY"));

            $httpProfile = new HttpProfile();
            $httpProfile->setEndpoint("ai3d.tencentcloudapi.com");
            $clientProfile = new ClientProfile();
            $clientProfile->setHttpProfile($httpProfile);
            $client = new CommonClient("ai3d", "2025-05-13", $cred, "ap-guangzhou", $clientProfile);
            $params = json_encode([
                "ImageUrl" => $front_image,
                "MultiViewImages" => $image_url,
                "EnablePBR" => true
            ]);
            $resp = $client->callJson("SubmitHunyuanTo3DJob", json_decode($params));

            return $resp;
        }
        catch(TencentCloudSDKException $e) {
            abort($e->getMessage());
        }
    }

    public static function searchTask($job_id)
    {
        try {

            $cred = new Credential(getenv("TENCENTCLOUD_SECRET_ID"), getenv("TENCENTCLOUD_SECRET_KEY"));

            $httpProfile = new HttpProfile();
            $httpProfile->setEndpoint("ai3d.tencentcloudapi.com");
            $clientProfile = new ClientProfile();
            $clientProfile->setHttpProfile($httpProfile);
            $client = new CommonClient("ai3d", "2025-05-13", $cred, "ap-guangzhou", $clientProfile);

            $params = json_encode([
                "JobId" => $job_id
            ]);
            $resp = $client->callJson("QueryHunyuanTo3DJob", json_decode($params));

            return $resp;
        }
        catch(TencentCloudSDKException $e) {
            echo $e;
        }
    }
}