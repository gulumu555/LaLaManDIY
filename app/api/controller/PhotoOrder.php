<?php

namespace app\api\controller;

use app\api\logic\PhotoOrderLogic;
use support\Log;
use support\Request;
use support\Response;

class PhotoOrder
{
    // 此控制器是否需要登录
    protected $onLogin = true;

    // 不需要登录的方法
    protected $noNeedLogin = ['notify', 'arkNotify'];


    /**
     * 列表
     * @method get
     * @param Request $request
     * @return Response
     */
    public function getList(Request $request): Response
    {
        $data = $request->get();
        $data['user_id'] = $request->user['id'];
        $list = \app\common\logic\PhotoOrderLogic::getList($data);
        return success($list);
    }

    /**
     * @param Request $request
     * @return \support\Response
     * @throws \Exception
     */
    public function create(Request $request): \support\Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];

        $model = PhotoOrderLogic::create($data);

        return success([
            'id' => $model->id,
            'status' => $model->status,
        ]);
    }


    public function findData(Request $request, int $id)
    {
        $data = PhotoOrderLogic::findData($id);

        return success($data);
    }

    public function update(Request $request): Response
    {
        $data = $request->post();
        $data['user_id'] = $request->user['id'];

        PhotoOrderLogic::update($data);

        return success();
    }

    public function notify(Request $request): Response
    {
        //TODO:改成异步处理
        Log::channel('image')->info('回调成功', [$request->post()]);
        PhotoOrderLogic::notify($request->post());
        return success([], 'success', 0);
    }

    public function arkNotify(Request $request): Response
    {
        Log::channel('ark')->info('回调成功', [$request->post()]);

        PhotoOrderLogic::arkNotify($request->post());
        return json([
            'status' => 'succeeded'
        ]);
    }
}