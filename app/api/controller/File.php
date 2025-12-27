<?php
namespace app\api\controller;

use PHPUnit\Exception;
use support\Request;
use support\Response;
use app\utils\File as FileUtils;
use Volc\Service\Sts;

/**
 * 文件
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class File
{
    // 此控制器是否需要登录
    protected $onLogin = true;
    // 不需要登录的方法
    protected $noNeedLogin = ['download'];

    /**
     * 上传文件
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function upload(Request $request) : Response
    {
        $result = FileUtils::upload();
        
        if (is_array($result) && $result) {
            return result($result, 1, '上传成功', false);
        } else {
            return result([], -1, '没有文件被上传', false);
        }
    }

    /**
     * 下载文件
     * @method get
     * @param string $fileName
     * @param string $filePath
     * @return Response
     */
    public function download(string $fileName, string $filePath) : Response
    {
        try {
            if (! file_exists("{$filePath}")) {
                $filePath = public_path() . $filePath;
            }
            return response()->download($filePath, $fileName);
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
    }

    /**
     * 获取tos临时访问授权
     * @return Response
     */
    public function certification()
    {
        try {
            $client = Sts::getInstance();
            $config = config('tos.client');

            $client->setAccessKey($config['ak']);
            $client->setSecretKey($config['sk']);

            $query = [
                "query" => [
                    "DurationSeconds" => "900",
                    "RoleSessionName" => "getAssumeRoleSession",
//                    "RoleTrn" => "trn:iam::2104996752:role/tos_role",
                    "RoleTrn" => "trn:iam::2107415805:role/tos_role",
                ]
            ];

            $response = $client->assumeRole($query);

            $response = json_decode($response->getContents(), true);
            $response['bucket'] = getenv("TOS_BUCKET");
            $response['region'] = getenv("TOS_REGION");
            $response['endpoint'] = getenv("TOS_END_POINT");
            return success($response);
        }catch (Exception $e) {
            abort($e->getMessage());
        }
    }
}
