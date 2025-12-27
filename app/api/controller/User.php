<?php
namespace app\api\controller;

use app\common\logic\UserLogic;
use app\common\model\SmsCodeModel;
use app\common\model\UserModel;
use app\utils\HuoShanTos;
use app\utils\Jwt;
use app\utils\RunningHubAi;
use app\utils\SiliconFlow;
use app\utils\Sms;
use app\utils\WechatMini;
use support\Request;
use support\Response;

/**
 * 用户
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class User
{
    // 此控制器是否需要登录
    protected $onLogin = true;
    // 不需要登录的方法
    protected $noNeedLogin = ['getResetPasswordCode', 'resetPassword'];

    /**
     * 修改自己的登录密码
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function updatePassword(Request $request) : Response
    {
        UserLogic::updatePassword($request->post(), $request->user['id']);
        return success([], '修改成功，请重新登录');
    }

    /**
     * 获取自己的资料
     * @method get
     * @param Request $request 
     * @return Response
     */
    public function getUserInfo(Request $request) : Response
    {
        $data = UserLogic::findData($request->user['id']);
        return success($data);
    }

    /**
     * 修改自己的资料
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function updateInfo(Request $request) : Response
    {
        UserLogic::updateInfo($request->post(), $request->user['id']);
        return success([], '修改成功');
    }

    /**
     * 忘记密码获取验证码
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function getResetPasswordCode(Request $request) : Response
    {
        $data['tel'] = $request->post('tel');
        if (! $data['tel']) {
            abort('参数错误');
        }

        // 验证手机号格式
        Sms::checkTel($data['tel']);

        // 判断此律师是否存在 是否正常
        $user = UserModel::where('tel', $data['tel'])->find();
        if (! $user || $user['status'] == 2) {
            abort('手机号错误~');
        }

        $data['code'] = Sms::getCode(4);
        // 开始发送
        //Sms::send($data['tel'], "您的验证码是：{$data['code']}，有效期5分钟。");

        // 添加发送记录
        $data['type'] = 1;
        SmsCodeModel::create($data);
        return success([], '发送成功');
    }

    /**
     * 重设密码
     * @method post
     * @param Request $request 
     * @return Response
     */
    public function resetPassword(Request $request) : Response
    {
        UserLogic::resetPassword($request->post());
        return success([], '修改成功~');
    }

    public function qrcode(Request $request) : Response
    {
        $path = UserLogic::qrcode($request->user['id']);

        return success(['path' => $path]);
    }


    public function logout(Request $request)
    {
        Jwt::logoutUser('user_pc', $request->user['id']);
        return success([], '退出成功');
    }

    public function rechargeInfo(Request $request) : Response
    {
        $data = UserLogic::getRechargeInfo($request->user['id']);
        return success($data);
    }
}
