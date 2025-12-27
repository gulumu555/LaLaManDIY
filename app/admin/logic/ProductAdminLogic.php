<?php
namespace app\admin\logic;

use app\admin\validate\ProductValidate;
use app\common\model\ProductModel;
use app\common\model\ProductSpecModel;
use app\utils\Strs;
use think\facade\Db;

/**
 * 产品管理 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class ProductAdminLogic
{



    /**
     * 新增
     * @param array $params
     */
    public static function create(array $params)
    {
        Db::startTrans();
        try {
            validate(ProductValidate::class)->scene('base')->check($params);
            $product_spec = $params['product_spec'] ?? [];
            $params['product_code'] = Strs::uniqueStr();

            $params['stock'] = array_sum(array_column($product_spec, 'stock'));

            $Product = ProductModel::create($params);


            foreach ($product_spec as $spec) {
                $spec['product_id'] = $Product->id;
                ProductSpecModel::create($spec);
            }

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }



    /**
     * 更新
     * @param array $params
     */
    public static function update(array $params)
    {
        Db::startTrans();
        try {
            validate(ProductValidate::class)->scene('base')->check($params);
            validate(ProductValidate::class)->scene('edit')->check($params);

            $product_spec = $params['product_spec'] ?? [];

            $params['stock'] = array_sum(array_column($product_spec, 'stock'));
            ProductModel::update($params);


            $spec_id = ProductSpecModel::where('product_id', $params['id'])->column('id');

            $delete_id = array_diff($spec_id, array_column($product_spec, 'id'));
            if ($delete_id) {
                foreach ($delete_id as $id) {
                    ProductSpecModel::destroy($id);
                }
            }

            foreach ($product_spec as $item) {
                if (!isset($item['id'])) {
                    $item['product_id'] = $params['id'];
                    ProductSpecModel::create($item);
                } else {
                    ProductSpecModel::update($item);
                }
            }

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            abort($e->getMessage());
        }
    }

    /**
     * 删除
     * @param int|array $id 要删除的id
     */
    public static function delete(int|array $id)
    {
        ProductModel::destroy($id);
    }

    public static function updateStatus(array $params)
    {
        try {
            validate(ProductValidate::class)->scene('edit')->check($params);
            validate(ProductValidate::class)->scene('status')->check($params);
            ProductModel::update($params);
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }







}