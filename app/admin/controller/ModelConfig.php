<?php
namespace app\admin\controller;

use app\common\model\ModelConfigModel;
use support\Request;
use support\Response;

/**
 * AI模型配置 控制器
 * 
 * 管理Seedream等AI生成模型的配置
 */
class ModelConfig
{
    protected $onLogin = true;
    protected $noNeedLogin = ['getActiveList'];  // 允许表单下拉框获取模型列表

    /**
     * 获取模型列表
     */
    public function getList(Request $request): Response
    {
        $list = ModelConfigModel::order('sort desc, id desc')->paginate(20);
        return success($list);
    }

    /**
     * 获取所有激活模型（用于下拉选择）
     */
    public function getActiveList(Request $request): Response
    {
        $list = ModelConfigModel::getActiveModels();
        return success($list);
    }

    /**
     * 新增模型
     */
    public function create(Request $request): Response
    {
        $data = $request->post();

        // 验证必填字段
        if (empty($data['key']) || empty($data['name'])) {
            return json(['code' => 0, 'msg' => '模型标识和名称不能为空']);
        }

        // 检查key唯一性
        if (ModelConfigModel::where('key', $data['key'])->find()) {
            return json(['code' => 0, 'msg' => '模型标识已存在']);
        }

        ModelConfigModel::create($data);
        return success([], '添加成功');
    }

    /**
     * 获取单条数据
     */
    public function findData(Request $request, int $id): Response
    {
        $data = ModelConfigModel::find($id);
        return success($data);
    }

    /**
     * 更新模型
     */
    public function update(Request $request): Response
    {
        $data = $request->post();
        if (empty($data['id'])) {
            return json(['code' => 0, 'msg' => '缺少ID']);
        }

        ModelConfigModel::update($data);
        return success([], '修改成功');
    }

    /**
     * 删除模型
     */
    public function delete(Request $request): Response
    {
        $id = $request->post('id');
        ModelConfigModel::destroy($id);
        return success([], '删除成功');
    }

    /**
     * 设置为默认模型
     */
    public function setDefault(Request $request): Response
    {
        $id = $request->post('id');
        if (empty($id)) {
            return json(['code' => 0, 'msg' => '缺少ID']);
        }

        $result = ModelConfigModel::setAsDefault($id);
        return $result ? success([], '设置成功') : json(['code' => 0, 'msg' => '设置失败']);
    }

    /**
     * 切换状态
     */
    public function updateStatus(Request $request): Response
    {
        $id = $request->post('id');
        $status = $request->post('is_active');

        ModelConfigModel::where('id', $id)->update(['is_active' => $status]);
        return success([], '修改成功');
    }
}
