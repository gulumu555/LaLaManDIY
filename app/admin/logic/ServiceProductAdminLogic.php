<?php
namespace app\admin\logic;

use app\common\model\ServiceProductModel;
use app\admin\validate\ServiceProductValidate;
use think\facade\Db;

/**
 * 支付配置 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ServiceProductAdminLogic
{

    /**
     * 新增
     * @param array $params
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            validate(ServiceProductValidate::class)->scene('create')->check($params);

            ServiceProductModel::create($params);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }

    /**
     * 获取数据
     * @param int $id 数据id
     */
    public static function findData(int $id)
    {
        return ServiceProductModel::find($id);
    }

    /**
     * 更新
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(ServiceProductValidate::class)->scene('update')->check($params);

            ServiceProductModel::update($params);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }



    /**
     * 更新状态
     * @param int|array $id
     * @param int $status
     */
    public static function updateStatus(int|array $id, int $status)
    {
        Db::startTrans();
        try {
            ServiceProductModel::where('id', 'in', $id)->update([
                'status' => $status
            ]);
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }





}