import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { photoStyleApi } from '@/api/photoStyle';
import { categoryApi } from '@/api/category';
import { ProTable } from '@ant-design/pro-components';
import {
    App, Button, Popconfirm, Typography, Space, Tooltip,
    Image, Switch,
} from 'antd';
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
import { authCheck, arrayToTree } from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';

const imgErr = new URL('@/static/default/imgErr.png', import.meta.url).href;
const Create = lazy(() => import('./create'));
const Update = lazy(() => import('./update'));

/**
 * 风格样例
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default () => {
    const { message } = App.useApp();
    const tableRef = useRef();
    const formRef = useRef();
    const [loading, setLoading] = useState(false);

    // 刷新表格数据
    const tableReload = () => {
        setLoading(true); // 开始加载
        try {
            tableRef.current.reload();
            tableRef.current.clearSelected();
        } finally {
            setLoading(false); // 结束加载
        }
    }

    // 要修改的数据
    const [updateId, setUpdateId] = useState(0);

    /////////////修改状态///////////////
    const updateStatus = (id, status) => {
        photoStyleApi.updateStatus({
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


    /////////////////删除//////////////
    const del = (id) => {
        photoStyleApi.delete({
            id
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
            title: '一级风格',
            dataIndex: 'cate_id',
            minWidth: 100,
            align: 'center',
            search: true,
            valueType: 'select',
            request: async () => {
                const result = await categoryApi.getList({ pageSize: 1000, type: 2 });
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
        },
        {
            title: '二级风格',
            dataIndex: 'style_name',
            minWidth: 100,
            align: 'center',
            search: true,
            render: (_, record) => _,
        },
        {
            title: '风格参考图',
            dataIndex: 'style_img',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => (
                <Image
                    width={40}
                    src={`${record.style_img}`}
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
        // {
        //     title: '说明文字',
        //     dataIndex: 'descript',
        //     minWidth: 100,
        //     align: 'center',
        //     search: false,
        //     render: (_, record) => _,
        // },
        {
            title: '修改时间',
            dataIndex: 'update_time',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '状态',
            dataIndex: 'status',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => <>
                <Switch
                    checked={record.status === 1 ? true : false}
                    checkedChildren="显示"
                    unCheckedChildren="隐藏"
                    onClick={() => {
                        updateStatus(record.id, record.status == 1 ? 0 : 1);
                    }}
                // disabled={authCheck('photoStyleUpdateStatus')}
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
                        disabled={authCheck('photoStyleUpdate')}
                    >修改</Button>
                    <Popconfirm
                        title="确认要删除吗？"
                        onConfirm={() => {
                            del(record.id);
                        }}
                        disabled={authCheck('photoStyleDelete')}
                    >
                        {/* <Button
                            type="link"
                            size="small"
                            danger
                            disabled={authCheck('photoStyleDelete')}
                        >删除</Button>*/}
                    </Popconfirm>
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
                    title: '二级风格',
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
                        persistenceKey: 'table_column_' + 'PhotoStyle',
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
                        try {
                            const result = await photoStyleApi.getList({
                                ...params,// 包含了翻页参数跟搜索参数
                                orderBy, // 排序
                                page: params.current,
                            });
                            return {
                                data: result.data.data,
                                success: true,
                                total: result.data.total,
                            };
                        } catch (err) {
                            message.error('获取列表失败');
                            return {
                                data: [],
                                success: false,
                                total: 0,
                            };
                        } finally {
                            setLoading(false);
                        }
                    }}
                    loading={loading}

                />
            </PageContainer>
        </>
    )
}
