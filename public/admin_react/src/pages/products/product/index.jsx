import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { productApi } from '@/api/product';
import { categoryApi } from '@/api/category';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Typography, Space, Tooltip,
Image, Switch, } from 'antd';
import {
    OrderedListOutlined,
    QuestionCircleOutlined,
    CloudDownloadOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons';
import { config } from '@/common/config';
import { NavLink } from 'react-router-dom';
import { authCheck, arrayToTree} from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';

const imgErr = new URL('@/static/default/imgErr.png', import.meta.url).href;
const Create = lazy(() => import('./create'));
const Update = lazy(() => import('./update'));

/**
 * 产品管理
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default () => {
    const { message } = App.useApp();
    const tableRef = useRef();
    const formRef = useRef();

    // 刷新表格数据
    const tableReload = () => {
        tableRef.current.reload();
        tableRef.current.clearSelected();
    }

    // 要修改的数据
    const [updateId, setUpdateId] = useState(0);

    /////////////修改状态///////////////
    const updateStatus = (id, status) => {
        productApi.updateStatus({
            id,
            status
        }).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                tableReload();
            } else {
                message.error(res.message)
            }
        })
    }




    // 表格列
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '产品类型',
            dataIndex: 'cate_name',
            minWidth: 100,
            align: 'center',
            search: true,
            valueType : 'select',
            request: async () => {
                const result = await categoryApi.getList();
                let list = result.data.data.map(item => {
                    return {
                        label: item.cate_name,
                        value: item.id
                    }
                });
                //list = arrayToTree(list);
                return list;
            },
            fieldProps: {
                showSearch: true,
            },
            ellipsis: true,
            render: (_, record) => _,
        },
        {
            title: '产品名称',
            dataIndex: 'product_name',
            minWidth: 100,
            align: 'center',
            search: true,
            valueType : 'text',
            ellipsis: true,
            render: (_, record) => _,
        },
        {
            title: '产品图片',
            dataIndex: 'main_image',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => (
                <Image
                    width={40}
                    src={`${record.main_image}`}
                    fallback={imgErr}
                />
            )
        },
        {
            title: '排序',
            dataIndex: 'sort',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '库存',
            dataIndex: 'stock',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '销量',
            dataIndex: 'sales',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '修改时间',
            dataIndex: 'update_time',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '上架状态',
            dataIndex: 'status',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => <>
                <Switch
                    checked={record.status === 1 ? true : false}
                    checkedChildren="上架"
                    unCheckedChildren="下架"
                    onClick={() => {
                        updateStatus(record.id, record.status == 1 ? 0 : 1);
                    }}
                    disabled={authCheck('productUpdateStatus')}
                />
            </>
        },

        {
            title: '操作',
            dataIndex: 'action',
            search: false,
            render: (_, record) => {
                return <>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setUpdateId(record.id)
                        }}
                        disabled={authCheck('productUpdate')}
                    >修改</Button>
                </>
            },
        },
    ];
    return (
        <>
            {/* 修改表单 */}
            <Lazyload block={false}>
                <Update
                    tableReload={tableReload}
                    updateId={updateId}
                    setUpdateId={setUpdateId}
                />
            </Lazyload>
            <PageContainer
                className="sa-page-container"
                ghost
                header={{
                    title: '产品管理',
                    style: { padding: '0px 24px 12px' },
                }}
                            >
                <ProTable
                    actionRef={tableRef}
                    formRef={formRef}
                    rowKey="id"
                    columns={columns}
                    scroll={{
                        x: 1000
                    }}
                    options={{
                        fullScreen: true
                    }}
                    columnsState={{
                        // 此table列设置后存储本地的唯一key
                        persistenceKey: 'table_column_' + 'Product',
                        persistenceType: 'localStorage'
                    }}
                    headerTitle={
                        <Space>
                            <Lazyload block={false}>
                                <Create tableReload={tableReload} />
                            </Lazyload>
                                                            </Space>
                    }
                    pagination={{
                        defaultPageSize: 20,
                        size: 'default',
                        // 支持跳到多少页
                        showQuickJumper: true,
                        showSizeChanger: true,
                        responsive: true,
                    }}
                    request={async (params = {}, sort, filter) => {
                        // 排序的时候
                        let orderBy = '';
                        for (let key in sort) {
                            orderBy = key + ' ' + (sort[key] === 'descend' ? 'desc' : 'asc');
                        }
                        const result = await productApi.getList({
                            ...params,// 包含了翻页参数跟搜索参数
                                                        orderBy, // 排序
                            page: params.current,
                        });
                        return {
                            data: result.data.data,
                            success: true,
                            total: result.data.total,
                        };
                    }}

                    // 开启批量选择
                    // rowSelection={{
                    //     preserveSelectedRowKeys: true,
                    // }}
                    // // 批量选择后左边操作
                    // tableAlertRender={({ selectedRowKeys, }) => {
                    //     return (
                    //         <Space>
                    //             <span>已选 {selectedRowKeys.length} 项</span>
                    //             <Button
                    //                 type="link"
                    //                 size='small'
                    //                 icon={<EyeOutlined />}
                    //                 disabled={authCheck('productUpdateStatus')}
                    //                 onClick={()=>{
                    //                     updateStatus(selectedRowKeys,1);
                    //                 }}
                    //             >显示</Button>
                    //             <Button
                    //                 type="link"
                    //                 size='small'
                    //                 icon={<EyeInvisibleOutlined />}
                    //                 disabled={authCheck('productUpdateStatus')}
                    //                 onClick={()=>{
                    //                     updateStatus(selectedRowKeys,2);
                    //                 }}
                    //             >隐藏</Button>
                    //
                    //         </Space>
                    //     );
                    // }}
                />
            </PageContainer>
        </>
    )
}
