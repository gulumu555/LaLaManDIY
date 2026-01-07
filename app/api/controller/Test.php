<?php

namespace app\api\controller;

use app\api\logic\PhotoOrderLogic;
use app\common\model\PhotoOrderModel;
use app\process\AiModelSearch;
use app\process\ConfirmReceiving;
use app\process\FreezeBalance;
use app\process\OrderUpdate;
use app\process\PrecisionEnhancement;
use app\process\TaskImage;
use app\utils\Banana;
use app\utils\HunYuan;
use app\utils\HuoShanArk;
use app\utils\HuoShanTos;
use app\utils\LibLibAi;
use app\utils\Meshy;
use app\utils\Pays;
use app\utils\RedisServer;
use app\utils\RunningHubAi;
use app\utils\SeedDream4;
use app\utils\ShunFeng;
use app\utils\TencentLocation;
use app\utils\WechatRedEnvelope;
use app\utils\WechatV3Signature;
use app\utils\WechatV3Transfer;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use support\Log;
use support\Request;
use support\Response;

class Test
{
    // 此控制器是否需要登录
    protected $onLogin = false;
    // 不需要登录的方法
    protected $noNeedLogin = [];

    public function img(Request $request): Response
    {
        return success(RunningHubAi::upload($request->post('url')));
    }

    public function task(Request $request): Response
    {

        return success(RunningHubAi::createTask($request->post()));
    }

    public function status(Request $request): Response
    {
        return success(RunningHubAi::statusTask($request->post('taskId')));
    }

    public function outputs(Request $request): Response
    {
        return success(RunningHubAi::outputsTask($request->post('taskId')));
    }

    public function tos(Request $request): Response
    {
        $file = $request->file('file');


        return success(HuoShanTos::upload($request->post('url'), $request->post('name')));
    }

    public function modelTask(Request $request): Response
    {
        return success(Meshy::to3DTask($request->post('url')));
    }

    public function getTask(Request $request): Response
    {

        return success(Meshy::getTask($request->get('taskId')));
    }


    public function getMap(Request $request): Response
    {
        return success(TencentLocation::getLocation($request->get('lat'), $request->get('lng')));
    }

    public function hunYuan(Request $request): Response
    {
        return success(HunYuan::createTask($request->post('url')));
    }

    public function searchHunYuan(Request $request): Response
    {
        return success(HunYuan::searchTask($request->post('job_id')));
    }


    public function miniPay(Request $request): Response
    {
        return success(Pays::wechatMiniPay($request->post()));
    }


    public function pay(Request $request): Response
    {

        // 初始化 Guzzle 客户端
        $client = new Client();

        $base_url = 'https://api.mch.weixin.qq.com';
        // 请求 URL
        $url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';

        $params = $request->post();

        $config = config('superadminx');
        $wechat_pay = $config['wechat_pay'];
        $wechat_xiaochengxu = $config['wechat_xiaochengxu'];

        // 请求体数据
//        $payload = [
//            "appid" => $wechat_xiaochengxu['AppID'],
//            "mchid" => $wechat_pay['mch_id'],
//            "description" => $params['description'],
//            "out_trade_no" => $params['out_trade_no'],
//            "notify_url" => "https://lalaman.novsoft.cn/api/Orders/notify",
//            "amount" => [
//                "total" => $params['amount']['total'],
//                "currency" => "CNY"
//            ],
//            "payer" => [
//                "openid" => $params['payer']['openid'],
//            ],
//        ];

        $url = '/v3/fund-app/mch-transfer/transfer-bills';

        $openid = 'oXbVM47ISqHzpimi8CbkQBGInOuQ';
        $amount = '0.1';
        $payload = [
            'appid' => config('superadminx.wechat_xiaochengxu.AppID'),
            'out_bill_no' => get_order_no('T'),
            //转账场景ID 1000现金营销
            'transfer_scene_id' => '1000',
            'openid' => $openid,
            'transfer_amount' => intval($amount * 100),
            'transfer_remark' => '账户提现',
            'notify_url' => config('superadminx.url') . '/admin/WithdrawOrder/notify',
            'transfer_scene_report_infos' => [
                [
                    'info_type' => '账户提现',
                    'info_content' => '用户发起提现'
                ],
                [
                    'info_type' => '推荐用户发起充值',
                    'info_content' => '用户获得奖励，发起提现'
                ]
            ]
        ];


        $authorization = WechatV3Signature::generateAuthorization(
            'post',
            $url,
            time(),
            uniqid(),
            json_encode($payload),
            $wechat_pay['mch_id'],
            $wechat_pay['serial_no'],
            config_path('wechat_cert/apiclient_key.pem')
        );

        // 请求头信息
        $headers = [
            'Authorization' => $authorization,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ];

        try {
            // 发送 POST 请求
            $response = $client->post($base_url . $url, [
                'headers' => $headers,
                'json' => $payload
            ]);

            // 获取响应状态码
            $statusCode = $response->getStatusCode();
            // 获取响应内容
            $responseBody = $response->getBody()->getContents();

        } catch (GuzzleException $e) {
            // 处理请求异常
            abort('request_error:' . $e->getMessage());
            if ($e->hasResponse()) {
                $errorResponse = $e->getResponse();
                $errorBody = $errorResponse->getBody()->getContents();
                abort("response_error: {$errorBody}");
            }
        }

        return success($responseBody);
    }

    public static function transfer(Request $request): Response
    {
        return success(WechatV3Transfer::transfer($request->post('openid'), $request->post('amount')));
    }


    public function withdraw(Request $request): Response
    {
        return success(WechatRedEnvelope::withdraw($request->post('openid'), $request->post('amount')));
    }

    public function ImgDimensions(Request $request): Response
    {
        return success(PhotoOrderLogic::getImageDimensions($request->post('url')));
    }

    public function shunFeng(Request $request): Response
    {
        return success(ShunFeng::send($request->post('num'), $request->post('phone')));
    }

    public function huoCreate(Request $request): Response
    {
        return success(HuoShanArk::create($request->post()));
    }

    public function huoTask(Request $request): Response
    {
        return success(HuoShanArk::task($request->post('taskId')));
    }

    public function shouhuo(Request $request): Response
    {
        OrderUpdate::closeOrder();
        return success();
    }

    public function freeze(Request $request): Response
    {
        FreezeBalance::freezeBalance();
        return success();
    }

    public function liblib(Request $request): Response
    {
        return success(LibLibAi::createTask($request->post('style_param'), $request->post('url'), $request->post('prompt')));
    }

    public function liblibTask(Request $request): Response
    {
        return success(LibLibAi::selectTask($request->get('taskId')));
    }

    public function cronliblibTask(Request $request): Response
    {
        TaskImage::taskImage();
        return success();
    }

    public function cronliblibLarge(Request $request): Response
    {

        return success(LibLibAi::enlarge($request->post()));
    }

    public function g()
    {
        $redis = RedisServer::app();

        if ($redis->get("3d:model:running")) {
            return;
        }
        $redis_data = $redis->lpop('ai:model:generate');

        try {
            if (!$redis_data)
                return;

            $data = json_decode($redis_data, true);

            $task = HunYuan::createTask($data['original_image']);

            $redis->setex("ai:model:running", 10800, 1);
            Log::channel('test')->info("2.{$task['JobId']}");
            if (isset($task['JobId'])) {
                RedisServer::app()->rpush("ai:model:search", json_encode([
                    'id' => $data['id'],
                    'job_id' => $task['JobId'],
                    'time' => time()
                ]));
            }

            return success($task);
        } catch (\Exception $e) {

            Log::channel('test')->error("2." . $e->getMessage());
            abort($e->getMessage());
        }

    }

    public function banana(Request $request): Response
    {
        $response = Banana::createTask($request->post('url'));

        return success($response);
    }

    public function seedDream(Request $request): Response
    {
        $response = SeedDream4::send($request->post('image'));

        return success($response);
    }

    public function seedDreamLeft(Request $request): Response
    {
        $response = SeedDream4::singleSend($request->post('image'), $request->post('prompt'));

        return success($response);
    }

    public function imagex(Request $request)
    {
        return success(SeedDream4::imageX($request->post('image'), $request->post('name')));
    }

    public function imagex2(Request $request)
    {
        return success(SeedDream4::imageX2($request->post('image'), $request->post('id')));
    }

    public function imageTask(Request $request)
    {
        return success(SeedDream4::selectTask($request->get('queue_id'), $request->get('task_id')));
    }

    /**
     * 获取所有可用的 Seedream 风格列表
     * GET /api/Test/seedDreamStyles
     */
    public function seedDreamStyles(): Response
    {
        return success(SeedDream4::getAvailableStyles());
    }

    /**
     * 测试 Seedream 风格图像生成（带身份保持）
     * POST /api/Test/seedDreamWithStyle
     * 参数:
     *   - image: 用户照片 URL 或 base64
     *   - style: 风格 key (如 'ghibli', 'shinkai', 'oil_painting' 等)
     *   - prompt: 可选，用户自定义提示词
     *   - size: 可选，图像尺寸，默认 '2k'
     *   - control_strength: 可选，身份保持强度 (0.1-1.0)，默认 0.7
     *   - ref_strength: 可选，风格参考强度 (0.1-1.0)，默认 0.8
     */
    public function seedDreamWithStyle(Request $request): Response
    {
        $image = $request->post('image');
        $style = $request->post('style');
        $prompt = $request->post('prompt', '');
        $size = $request->post('size', '2k');
        $controlStrength = floatval($request->post('control_strength', 0.7));
        $refStrength = floatval($request->post('ref_strength', 0.8));

        if (!$image || !$style) {
            abort('参数错误: image 和 style 是必填项');
        }

        // 使用 generateWithIdentity 方法来保持人物身份
        $response = SeedDream4::generateWithIdentity(
            $image,
            $style,
            $prompt,
            $size,
            $controlStrength,
            $refStrength
        );

        return success($response);
    }
}