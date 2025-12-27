<?php
namespace app\api\controller;

use app\common\model\UserInviteModel;
use support\Log;
use support\Request;
use support\Response;
use support\think\Db;
use app\utils\Jwt;
use app\utils\WechatMini;
use app\common\model\UserModel;
use app\common\validate\UserValidate;



/**
 * 小程序登录相关
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class Login
{
    // 此控制器是否需要登录
    protected $onLogin = false;
    // 不需要登录的方法
    protected $noNeedLogin = [];

    /**
     * @log 登录
     * @method get
     * @param Request $request 
     * @param string $code 
     * @return Response
     * */
    public function autoLogin(Request $request, string $code)
    {
        $return['is_register'] = 0;
        try {
            $result = WechatMini::getOpenid($code);

            if (isset($result['openid']) && $result['openid']) {
                if ($userId = UserModel::where('openid', $result['openid'])->value('id')) {
                    $return = $this->resultUser($userId);
                    $return['is_register'] = 1;
                }
            }

            return success($return);
        }catch (\Exception $e) {
            return success($return);
        }
    }

    /**
     * 小程序授权获取用户手机号
     * @method get
     * @param Request $request 
     * @param string $code 
     * @return Response
     * */
    public function getPhoneNumber(Request $request)
    {
        $data = WechatMini::getPhoneNumber($request->post('code'));

        return success($data);
    }

    /**
     * 用户注册提交
     * @method post
     * @param Request $request 
     * @param string $code 
     * @return Response
     * */
    public function register(Request $request)
    {
        $data = $request->post();

        Db::startTrans();
        try {

            validate(UserValidate::class)->scene('register')->check($data);

            //获取openid，wxlogin的code
            $result = WechatMini::getOpenid($data['code']);

            if (! isset($result['openid']) || ! $result['openid']) {
                throw new \Exception('获取用户openid错误');
            }
            $data['openid'] = $result['openid'];

            //已经注册直接返回
            $userId = UserModel::where('openid', $data['openid'])->value('id');
            if (! $userId) {
                //如果头像图片地址里面包含url，则干掉
                if (isset($data['img']) && strpos($data['img'], config('app.url')) !== false) {
                    $data['img'] = str_replace(config('app.url'), '', $data['img']);
                }

                //赠送一次
                $data['num_balance'] = getenv('SEND_BALANCE_COUNT');
                //$data['nickname'] = !empty($data['nickname']) ? $data['nickname'] : ('拉拉漫' . substr($data['tel'], -4));

                $max = UserModel::order('id', 'desc')->find();
                $data['nickname'] = !empty($data['nickname']) ? $data['nickname'] : ('拉拉漫' . (($max['id'] ?? 0) + 1));
                $result = UserModel::create($data);

                $userId = $result->id;

                if (!empty($data['pid']) && !UserInviteModel::where('invited_id', '=', $userId)->find()) {

                   UserInviteModel::create([
                       'user_id' => $data['pid'],
                       'invited_id' => $userId
                   ]);
                }
            }
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }

        $return = $this->resultUser($userId);
        $return['is_register'] = 1;

        return success($return);
    }

    private function resultUser(int $userId)
    {
        $user          = UserModel::where('id', $userId)->find();
        $user['token'] = Jwt::generateToken('user_pc', $user->toArray());
        return $user;
    }
}
