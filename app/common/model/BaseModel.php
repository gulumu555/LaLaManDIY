<?php
namespace app\common\model;

use app\common\logic\FileRecordLogic;
use app\common\model\logic\HandleData;
use Closure;
use support\think\Model;
use think\db\exception\DataNotFoundException;
use think\db\exception\DbException;
use think\db\exception\ModelNotFoundException;
use think\db\Query;
use think\model\contract\Modelable;

/**
 * 父模型，所有的模型都要继承
 * 主要解决数据增改删的时候同步更新附件表，删除附件等操作
 * 
 * 文件上传的时候count=0
 * 数据添加的时候count+1
 * 数据修改的时候，会比对新老数据，新附件count+1，删除的附件count-1，没变的附件不变
 * 数据删除的时候count-1
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
class BaseModel extends Model
{

    /**
     * 表别名
     *
     * @var string
     */
    protected $alias;

    /**
     * 设置表别名
     *
     * @param string $alias 表别名
     *
     * @return $this
     */
    public function setAlias(string $alias)
    {
        $this->alias = $alias;

        return $this;
    }

    /**
     * 获取表别名
     *
     * @return string
     */
    public function getAlias(): string
    {
        return $this->alias ?? '';
    }


    /**
     * 新增后
     * @param object $data
     */
    public static function onAfterInsert($data)
    {
        $fileUrl   = self::dataSearchFile($data);
        $tableName = $data->name;
        $tableId   = ($data->toArray())['id'] ?? null;

        // 记录这条数据里面所有的附件
        if ($fileUrl && $tableName && $tableId) {
            FileRecordLogic::create($tableName, $tableId, $fileUrl);
        }
    }

    /**
     * 更新后
     * @param object $data
     */
    public static function onAfterUpdate($data)
    {
        $fileUrl   = self::dataSearchFile($data);
        $tableName = $data->name;
        $tableId   = ($data->toArray())['id'] ?? null;

        // 重新更新此条数据使用的附件
        if ($fileUrl && $tableName && $tableId) {
            FileRecordLogic::update($tableName, $tableId, $fileUrl);
        }
    }

    /**
     * 删除后
     * @param object $data
     */
    public static function onAfterDelete($data)
    {
        $tableName = $data->name;
        $tableId   = ($data->toArray())['id'];

        // 删除附件记录
        FileRecordLogic::delete($tableName, $tableId);
    }

    /**
     * 添加修改的时候，把数据里面的文件路劲找出来
     */
    private static function dataSearchFile($data)
    {
        $fileUrl = [];
        try {
            $content = $data->toArray();
            if (!isset($data->file) || !$data->file) {
                return [];
            }
            foreach ($data->file as $k => $v) {
                if (isset($content[$k]) && $content[$k]) {
                    // 直接等于
                    if (($v == '' || ! $v) && isset($content[$k]) && $content[$k]) {
                        $fileUrl[] = $content[$k];
                    }
                    // 数组，支持多维数组，随便多深，想自定义表单的提交数据也可以放进来，把提交的每个值都当成附件路劲处理
                    if ($v == 'array' && isset($content[$k]) && $content[$k]) {
                        $fileUrl = array_merge($fileUrl, self::arrSearchFile($content[$k]));
                    }
                    // 编辑器
                    if ($v == 'editor') {
                        $tmp     = self::editorSearchFile($content[$k]);
                        $fileUrl = array_merge($fileUrl, $tmp);
                    }
                }
            }
        } catch (\Exception $e) {
            abort($e->getMessage());
        }
        return $fileUrl;
    }

    /**
     * 从富文本中找出所有附件路劲
     */
    private static function editorSearchFile($content)
    {
        $fileUrl = [];
        if (! $content) {
            return $fileUrl;
        }
        $pattern = [
            '/]*src=(["\'])(.*?)\1[^>]*>/i',
            '/]*href=(["\'])(.*?)\1[^>]*>/i',
        ];
        foreach ($pattern as $v) {
            preg_match_all($v, $content, $matches);
            $fileUrl = array_merge($fileUrl, $matches[2]);
        }
        return $fileUrl;
    }

    /**
     * 递归数组，把数组中所有值都当成url
     */
    private static function arrSearchFile($arr)
    {
        $fileUrl = [];
        if (is_array($arr)) {
            foreach ($arr as $v) {
                if (is_array($v) && $v) {
                    $fileUrl = array_merge($fileUrl, self::arrSearchFile($v));
                } else if ($v) {
                    $fileUrl[] = $v;
                    $fileUrl   = array_merge($fileUrl, self::editorSearchFile($v));
                }
            }
        }
        return $fileUrl;
    }

    /**
     * 删除记录继承父类.
     *
     * @param mixed $data 主键列表 支持闭包查询条件
     * @param bool $force 是否强制删除
     *
     * @return bool
     * @throws DataNotFoundException
     * @throws DbException
     * @throws ModelNotFoundException
     */
    public static function destroy($data, bool $force = true): bool
    {
        if ($force) {
            return parent::destroy($data);
        }

        if (empty($data) && 0 !== $data) {
            return false;
        }

        $model = new static();
        $query = $model->db();

        if (is_array($data) && key($data) !== 0) {
            $query->where($data);
            $data = [];
        } elseif ($data instanceof Closure) {
            $data($query);
            $data = [];
        }

        $resultSet = $query->select((array) $data);

        foreach ($resultSet as $result) {
            $result->useSoftDelete('deleted', 1)->delete();
        }

        return true;
    }

    /**
     * 获取当前模型的数据库查询对象
     *
     * @param array $scope 设置不使用的全局查询范围
     *
     * @return Query
     */
    public function db($scope = []): Query
    {
        /** @var Query $query */
        $query = self::$db->connect($this->connection)
            ->name($this->name)
            ->pk($this->pk);

        if (!empty($this->autoInc)) {
            $query->autoinc(is_string($this->autoInc) ? $this->autoInc : $this->pk);
        }

        if (!empty($this->table)) {
            $query->table($this->table . $this->suffix);
        } elseif (!empty($this->suffix)) {
            $query->suffix($this->suffix);
        }

        $query->model($this)
            ->json($this->json, $this->jsonAssoc)
            ->setFieldType(array_merge($this->schema, $this->jsonType))
            ->setKey($this->getKey())
            ->readonly($this->readonly)
            ->lazyFields($this->lazyFields);

        // 软删除
        if (property_exists($this, 'withTrashed') && !$this->withTrashed) {
            $this->withNoTrashed($query);
        }
        /*else {
            // 检查表中是否存在 'deleted' 字段
            $tableFields = $query->getConnection()->getTableFields($query->getTable());
            if (in_array('deleted', $tableFields)) {
                // 获取表别名
                $alias = $query->getOptions('alias') ?? '';
                if ($alias) {
                    $query->where("{$alias}.deleted", 0);
                } else {
                    $query->where('deleted', 0);
                }
            }
        }*/

        // 全局作用域
        if (is_array($scope)) {
            $globalScope = array_diff($this->globalScope, $scope);
            $query->scope($globalScope);
        }


        // 返回当前模型的数据库查询对象
        return $query;
    }

    /**
     * 写入数据.
     *
     * @param array|object  $data 数据
     * @param array  $allowField  允许字段
     * @param bool   $replace     使用Replace
     * @param string $suffix      数据表后缀
     *
     * @return static
     */
    public static function create(array | object $data, array $allowField = [], bool $replace = false, string $suffix = ''): Modelable
    {
        $data = HandleData::beforeUpdate($data);

        return parent::create($data, $allowField, $replace, $suffix);
    }

    /**
     * 更新数据.
     *
     * @param array|object  $data 数据数组
     * @param mixed  $where       更新条件
     * @param array  $allowField  允许字段
     * @param string $suffix      数据表后缀
     *
     * @return static
     */
    public static function update(array | object $data, $where = [], array $allowField = [], string $suffix = ''): Modelable
    {
        $data = HandleData::beforeUpdate($data);

        return parent::update($data, $where, $allowField, $suffix);
    }
}