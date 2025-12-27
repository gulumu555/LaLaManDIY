import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { homeApi } from '@/api/home';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Typography, Space, Tooltip,
Image, } from 'antd';
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
 * 首页列表
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



    /////////////////删除//////////////
    const del = (id) => {
        homeApi.delete({
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
            title: '风格样例',
            dataIndex: 'img',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => (
                <Image
                    width={40}
                    src={`${record.img}`}
                    fallback={imgErr}
                />
            )
        },
        {
            title: '说明文字',
            dataIndex: 'desc',
            minWidth: 300,
            align: 'center',
            search: true,
            ellipsis: true,
            valueType : 'text',
            render: (_, record) => _,
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
            title: '修改时间',
            dataIndex: 'update_time',
            minWidth: 100,
            align: 'center',
            search: false,
            render: (_, record) => _,
        },

        {
            title: '操作',
            dataIndex: 'action',
            search: false,
            align: 'center',
            render: (_, record) => {
                return <>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setUpdateId(record.id)
                        }}
                        disabled={authCheck('homeUpdate')}
                    >修改</Button>
                    <Popconfirm
                        title="确认要删除吗？"
                        onConfirm={() => {
                            del(record.id);
                        }}
                        disabled={authCheck('homeDelete')}
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            disabled={authCheck('homeDelete')}
                        >删除</Button>
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
                    title: '风格样例',
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
                        persistenceKey: 'table_column_' + 'Home',
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
                            const result = await homeApi.getList({
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
