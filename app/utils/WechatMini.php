<?php
namespace app\utils;

use app\exception\CustomException;
use EasyWeChat\Kernel\Exceptions\InvalidArgumentException;
use EasyWeChat\MiniApp\Application;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use support\Log;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use think\Exception;

/**
 * 微信小程序操作
 * 
 * WechatMini::getToken() 获取小程序操作的token
 * WechatMini::getWxAcodeunLimit(string $page, string $scene = '', string $path = null, int $width = 280) 生成小程序二维码
 * WechatMini::getOpenid(string $code = '') 获取小程序openid
 * WechatMini::getPhoneNumber(string $code = '') 获取用户的手机号
 * 
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 */
class WechatMini
{
    private static $app;

    /**
     * @throws InvalidArgumentException
     */
    public static function initApp()
    {
        if (self::$app) {
            return self::$app;
        }
        $config = [
            'app_id'  => config('superadminx.wechat_xiaochengxu.AppID'),
            'secret'  => config('superadminx.wechat_xiaochengxu.AppSecret'),
            'token'   => 'easywechat',
            'aes_key' => '',

            /**
             * 接口请求相关配置，超时时间等，具体可用参数请参考：
             * https://github.com/symfony/symfony/blob/5.3/src/Symfony/Contracts/HttpClient/HttpClientInterface.php
             */
            'http'    => [
                'throw'   => true, // 状态码非 200、300 时是否抛出异常，默认为开启
                'timeout' => 5.0,
                'base_uri' => 'https://api.weixin.qq.com/', // 如果你在国外想要覆盖默认的 url 的时候才使用，根据不同的模块配置不同的 uri
                'retry'   => true, // 使用默认重试配置
            ],
        ];
        return self::$app = new Application($config);
    }

    /**
     * 获取小程序的token
     */
    public static function getToken() : string
    {
        $accessToken = self::initApp()->getAccessToken();
        return $accessToken->getToken(); // string
    }

    /**
     * 生成小程序码
     * @param string $page 小程序的url地址 pages/index/index
     * @param string $scene 参数，最大32个字符串，类似于： a=1&b=2
     * @param string $path 二维码保存的路劲 ./public/qrocde/111.png
     * @param int $width 二维码的宽度，最小280，最大1280
     */
    public static function getWxAcodeunLimit(string $page, string $scene = '',string $name = '',  int $width = 280, $user_id = 0)
    {
        try {
            $accessToken = self::getAccessToken();
            $response = self::initApp()->getClient()->postJson('/wxa/getwxacodeunlimit?access_token=' . $accessToken, [
                'scene'      => $scene,
                'page'       => $page,
                'width'      => $width,
                'check_path' => false,
            ]);

            if ($response->isFailed()) {
                throw new \Exception('获取小程序二维码错误');
            }

            // 如果没得path就直接把图片链接返回
            $url = $response->toDataUrl();
            if (! $name) {
                return $url;
            }

            $path = self::saveBase64Image($url, $name);

            // 如果有path就存为图片
            //$response->saveAs($path);
            return $path;
        } catch (\Exception $e) {
            Log::channel('login')->error('qrcode:' . $e->getMessage());
            abort("系统繁忙，请稍后再试");
        }
    }

    public static function saveBase64Image($base64Image, $filename) {
        if (strpos($base64Image, 'data:image/') !== 0) {
            return false; // 不是 Base64 图片
        }

        // 提取图片类型
        $imageType = explode('/', explode(';', $base64Image)[0])[1];

        // 移除 Base64 头部
        $base64Data = substr($base64Image, strpos($base64Image, ',') + 1);

        // 解码并保存
        $imageData = base64_decode($base64Data);
        //$filename = 'img_' . md5(uniqid()) . '.' . $imageType;

        $path = '/upload/' . date('Ymd') . '/';
        $uploadDir = public_path() . $path;
        $filePath = $uploadDir . $filename;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true); // 自动创建目录
        }

        file_put_contents($filePath, $imageData);

        $url = HuoShanTos::upload($filePath, $filename);

        return  ImgUrlTool::addPrefix($url);
    }
    /**
     * 用code换取openid
     * @param string $code 微信小程序login的code
     * @return [
     * 	'openid' => 'xxxxxx',
     *  'session_key' => 'xxxxxxx'
     * ]
     */
    public static function getOpenid(string $code) : array
    {
        try {
            $response = self::initApp()->getClient()->get('/sns/jscode2session', [
                'appid'      => config('superadminx.wechat_xiaochengxu.AppID'),
                'secret'     => config('superadminx.wechat_xiaochengxu.AppSecret'),
                'js_code'    => $code,
                'grant_type' => 'authorization_code',
            ]);
            $result   = $response->toArray();
            if (! isset($result['openid']) || ! $result['openid']) {
                throw new \Exception($response['errmsg'] ?? '获取用户openid错误');
            }
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
        return $result;
    }

    /**
     * 小程序获取手机号
     * @param string $code 用button》open-type="getPhoneNumber"》获取code换取手机号
     * $
     * @return array|void
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public static function getPhoneNumber(string $code)
    {
        try {
            if (!$code) throw new \Exception('code不能为空');

           // $accessToken = self::getAccessToken();
            $url = 'wxa/business/getuserphonenumber';
//            ?access_token=' . $accessToken
              $response = self::initApp()->getClient()->postJson($url, [
                  'code' => $code
              ]);
              $response = $response->toArray();

              if ($response['errcode'] == 0 && $response['errmsg'] == 'ok') {
                  return [
                      'tel' => $response['phone_info']['phoneNumber']
                  ];
              } else {
                  throw new \Exception($response ? json_encode($response): '小程序获取手机号错误');
              }
        } catch (\Exception $e) {
            Log::channel('login')->info('getPhoneNumber error：' . $e->getMessage());

            abort("系统繁忙，请稍后再试");
        }
    }


    public static function getAccessToken()
    {
        $redis = RedisServer::app();
        $key = 'wechat_access_token';


        // 1. 先读缓存
        $token = $redis->get($key);
        if ($token) {
            $ttl = $redis->ttl($key);
            if ($ttl > 300 || $ttl === -1) {
                return $token;
            }
        }

        $resp = self::initApp()->getClient()->postJson("cgi-bin/stable_token", [
            'grant_type'    => 'client_credential',
            'appid'         => config('superadminx.wechat_xiaochengxu.AppID'),
            'secret'        => config('superadminx.wechat_xiaochengxu.AppSecret'),
            //'force_refresh' => false,
        ])->toArray();

        if (!isset($resp['access_token'])) {
            throw new \Exception("微信返回异常: " . $resp->getBody());
        }

        $accessToken = $resp['access_token'];
        //$expire = isset($resp['expires_in']) ? max(300, $resp['expires_in'] - 300) : 7000;
        $expire = 300;

        $redis->setex($key, $expire, $accessToken);
        return $accessToken;
    }


    /**
     * 获取access_token
     * @return mixed|string|void
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public static function getAccessTokenbak()
    {
        try {
            $lockKey = 'wechat_access_token_lock';
            $isLocked = RedisServer::app()->set($lockKey, 1, 'EX', 10, 'NX');

            $accessToken = RedisServer::app()->get('wechat_access_token');

            if ($accessToken) {
                $ttl = RedisServer::app()->ttl('wechat_access_token');
                if ($ttl > 300 && $ttl !== -2) {
                    return $accessToken;
                }
            }

            if ($isLocked) {
                // 调整请求参数顺序，增加必要参数校验
                $requestData = [
                    'grant_type' => 'client_credential',
                    'appid' => config('superadminx.wechat_xiaochengxu.AppID'),
                    'secret' => config('superadminx.wechat_xiaochengxu.AppSecret'),
                    'force_refresh' => false // 改为可选参数，可扩展强制刷新功能
                ];

                // 严格校验配置参数
                if (empty($requestData['appid']) || empty($requestData['secret'])) {
                    throw new \Exception('微信小程序配置不完整');
                }

                $response = self::initApp()->getClient()->postJson("cgi-bin/stable_token", $requestData);
                $response = $response->toArray();

                // 增强错误处理
                if (isset($response['errcode']) && $response['errcode'] != 0) {
                    Log::channel('login')->error('getAccessToken API错误', $response);
                    throw new \Exception($response['errmsg'] ?? '接口调用失败');
                }

                if (isset($response['access_token']) && $response['expires_in']) {
                    // 根据微信文档建议设置有效期
                    $expiresIn = max(300, $response['expires_in'] - 300);
                    RedisServer::app()->setex('wechat_access_token', $expiresIn, $response['access_token']);
                    RedisServer::app()->del($lockKey);
                    return $response['access_token'];
                }

                throw new \Exception('无效的接口响应');
            }

            // 优化重试机制
            usleep(500000); // 改为500毫秒等待
            return self::getAccessToken();

        } catch (\Exception $e) {
            RedisServer::app()->del($lockKey);
            Log::channel('login')->error('getAccessToken异常: ' . $e->getMessage());
            abort("系统繁忙，请稍后重试" . $e->getMessage());
        }
    }

    public static function verifyQrcode(string $code)
    {
        try {
            $accessToken = self::getAccessToken();

        }catch (\Exception $e){
            abort($e->getMessage());
        }
    }

    /**
     * 获取稳定版接口调用凭证
     * @param bool $forceRefresh 是否强制刷新
     * @return string
     * @throws CustomException
     * @throws GuzzleException
     */
    public static function getStableAccessToken(bool $forceRefresh = false): string
    {
        $cacheKey = 'wechat_stable_token:' . config('superadminx.wechat_xiaochengxu.AppID');

        $redis = RedisServer::app();
        // 普通模式优先读取缓存
        if (!$forceRefresh && ($token = $redis->get($cacheKey))) {
            return $token;
        }

        // 强制刷新时删除旧缓存
        if ($forceRefresh) {
            $redis->del($cacheKey);
        }

        try {
//            $response = (new Client())->post('https://api.weixin.qq.com/cgi-bin/stable_token', [
//                'json' => [
//                    'grant_type' => 'client_credential',
//                    'appid' => config('superadminx.wechat_xiaochengxu.AppID'),
//                    'secret' => config('superadminx.wechat_xiaochengxu.AppSecret'),
//                    'force_refresh' => $forceRefresh
//                ],
//                'timeout' => 5
//            ]);

            $appid = config('superadminx.wechat_xiaochengxu.AppID');
            $secret = config('superadminx.wechat_xiaochengxu.AppSecret');
            $response = (new Client())->get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' . $appid . '&secret=' . $secret);

            $data = json_decode($response->getBody(), true);
            
            if (empty($data['access_token'])) {
                throw new \Exception('微信接口调用失败：' . ($data['errmsg'] ?? '未知错误'));
            }

            // 缓存时间设置为实际有效期减300秒（提前5分钟刷新）

            Log::channel('login')->info("token:", $data);
            $expire = max(300, (int)($data['expires_in'] ?? 7200) - 300);
            $redis->setex($cacheKey, $expire, $data['access_token']);

            return $data['access_token'];

        } catch (\Exception $e) {

            Log::channel('login')->info($e->getMessage());
            throw new CustomException('微信接口请求失败：' . $e->getMessage());
        }
    }

}