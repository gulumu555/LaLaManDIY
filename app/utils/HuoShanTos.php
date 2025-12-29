<?php

namespace app\utils;

use support\Log;
use Tos\Model\Enum;
use Tos\Model\PutObjectInput;
use Tos\TosClient;


class HuoShanTos
{

    public static $tosClient;

    public static function initClient(): TosClient
    {

        //        if (self::$tosClient) {
//            return self::$tosClient;
//        }

        return self::$tosClient = new TosClient(config('tos.client'));
    }

    /**
     * 上传文件到TOS
     * @return string
     * @throws \Exception
     */
    public static function upload($file, $name): string
    {
        try {
            $client = self::initClient();
            $date = date('Ymd');

            $name = $name ?: substr($file, strrpos($file, '/') + 1);
            $object_key = "upload/" . $date . "/" . $name;

            // 判断是否为远程URL
            $isRemoteUrl = filter_var($file, FILTER_VALIDATE_URL);

            if ($isRemoteUrl) {
                // 对于远程URL，先下载到本地临时文件
                $tempFile = tempnam(sys_get_temp_dir(), 'remote_img_');
                $context = stream_context_create([
                    'http' => ['timeout' => 30],  // 设置30秒超时
                    'https' => ['timeout' => 30]
                ]);

                $remoteContent = @file_get_contents($file, false, $context);
                if ($remoteContent === false) {
                    throw new \Exception("无法下载远程图片: " . error_get_last()['message']);
                }

                file_put_contents($tempFile, $remoteContent);
                $fileToUpload = $tempFile;
            } else {
                $fileToUpload = $file;
            }

            $input = new PutObjectInput(config('tos.bucket'), $object_key);
            $input->setContent(fopen($fileToUpload, 'r'));
            $input->setACL(Enum::ACLPublicRead);

            $client->putObject($input);

            // 如果是临时文件，删除它
            if ($isRemoteUrl && file_exists($fileToUpload)) {
                unlink($fileToUpload);
            }
            // 如果是本地文件且存在，删除它
            elseif (!$isRemoteUrl && file_exists($file)) {
                unlink($file);
            }

            return '/' . $object_key;
        } catch (\Exception $e) {
            Log::channel('fail')->error("upload_error:" . $e->getMessage() . " file:" . $file);
            abort($e->getMessage());
        }
    }

    /**
     * 上传文件到TOS
     * @return string
     * @throws \Exception
     */
    public static function codeUpload($file, $name): string
    {
        try {
            $client = self::initClient();

            $name = $name ?: substr($file, strrpos($file, '/') + 1);
            $object_key = "upload/qrcode/" . $name;

            $input = new PutObjectInput(config('tos.bucket'), $object_key);
            $input->setContent(fopen($file, 'r'));
            $input->setACL(Enum::ACLPublicRead);

            $client->putObject($input);

            if (file_exists($file)) {
                unlink($file);
            }
            return '/' . $object_key;
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
    }

    /**
     * Upload binary data directly to TOS
     * LaLaMan 2.0 - For ExportService
     * 
     * @param string $data Binary data to upload
     * @param string $name Filename
     * @return string Object URL path
     * @throws \Exception
     */
    public static function uploadFromData(string $data, string $name): string
    {
        try {
            $client = self::initClient();
            $date = date('Ymd');

            $object_key = "export/" . $date . "/" . $name;

            $input = new PutObjectInput(config('tos.bucket'), $object_key);

            // Create memory stream from data
            $stream = fopen('php://memory', 'r+');
            fwrite($stream, $data);
            rewind($stream);

            $input->setContent($stream);
            $input->setACL(Enum::ACLPublicRead);

            $client->putObject($input);

            fclose($stream);

            // Return full URL
            $endpoint = config('tos.client.endpoint');
            $bucket = config('tos.bucket');
            return "https://{$bucket}.{$endpoint}/{$object_key}";

        } catch (\Exception $e) {
            Log::channel('fail')->error("uploadFromData error: " . $e->getMessage());
            throw $e;
        }
    }
}