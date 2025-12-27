<?php
namespace app\common\logic;

use app\common\model\OrdersModel;
use app\common\model\UserAddressModel;
use app\common\validate\UserAddressValidate;
use app\utils\Kuaidi100;
use app\utils\ShunFeng;
use Shopwwi\WebmanExpress\Facade\Express;
use support\Log;
use think\db\Query;

/**
 * 收货地址 逻辑层
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class UserAddressLogic
{

    /**
     * 列表
     * @param array $params get参数
     * @param bool $page 是否需要翻页
     * */
      public static function getList(array $params = [])
       {
           // 排序
           $orderBy = "id desc";
        if (isset($params['orderBy']) && $params['orderBy']) {
               $orderBy = "{$params['orderBy']},{$orderBy}";
           }

           $list = UserAddressModel::withSearch('user_id', $params)
               ->with(['RegionCounty'])
               ->where('deleted', 0)
               ->order($orderBy);

           return $list->paginate($params['pageSize'] ?? 20);
       }

    /**
     * 物流查询
     * @param $params
     * @return array
     */
    public static function logistics($params)
    {
        try {
            $orders = OrdersModel::with(['UserAddress' => function (Query $query) {
                $query->with(['RegionCounty']);
            }])->find($params['id'])->toArray();

//            $return = Kuaidi100::query($orders['shipping_code'], $orders['UserAddress']['phone'])['data'] ?? [];

            $result['address_info'] = [
                'shipping_name' => $orders['shipping_name'],
                'shipping_code' => $orders['shipping_code'],
                'address' => $orders['UserAddress']['pid_path_title'] . $orders['UserAddress']['address'],
            ];
            $result['shipping_list'] = ShunFeng::send($orders['shipping_code'], $orders['UserAddress']['phone']);

            return $result;
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }

    public static function create(mixed $data)
    {
        try {
            Validate(UserAddressValidate::class)->scene('base')->check($data);

            $update = UserAddressModel::where('user_id', $data['user_id'])->where('is_default', 1)->column('id,is_default');
            $update = array_map(function ($item) {
                return [
                    'id' => $item['id'],
                    'is_default' => 0
                ];
            }, $update);
            if ($update){
                foreach ($update as $item) {
                    UserAddressModel::update($item);
                }
            }

            UserAddressModel::create($data);
            return true;
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }

    public static function update(mixed $data)
    {
        try {
            Validate(UserAddressValidate::class)->scene('edit')->check($data);

            $update = UserAddressModel::where('user_id', $data['user_id'])->where('is_default', 1)->column('id,is_default');

            $update = array_map(function ($item) {
                return [
                    'id' => $item['id'],
                    'is_default' => 0
                ];
            }, $update);

            $update[] = $data;

            if ($update){
                foreach ($update as $item) {
                    UserAddressModel::update($item);
                }
            }

            return true;
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }

    public static function delete(mixed $data)
    {
        try {
            return UserAddressModel::destroy($data, false);
        }catch (\Exception $e) {
            abort($e->getMessage());
        }
    }


}