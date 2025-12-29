import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { seedDreamStyleApi } from '@/api/seedDreamStyle';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space, Image, Switch, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { authCheck } from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';

const imgErr = new URL('@/static/default/imgErr.png', import.meta.url).href;
const Create = lazy(() => import('./create'));
const Update = lazy(() => import('./update'));

/**
 * Seedream AI 风格配置
 *
 * @author LaLaMan
 */
export default () => {
    const { message } = App.useApp();
    const tableRef = useRef();
    const formRef = useRef();
    const [loading, setLoading] = useState(false);

    // 刷新表格数据
    const tableReload = () => {
        setLoading(true);
        try {
            tableRef.current.reload();
            tableRef.current.clearSelected();
        } finally {
            setLoading(false);
        }
    }

    // 要修改的数据ID
    const [updateId, setUpdateId] = useState(0);

    // 修改状态
    const updateStatus = (id, field, value) => {
        seedDreamStyleApi.updateStatus({ id, field, value }).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                tableReload();
            } else {
                message.error(res.message)
            }
        })
    }

    // 删除
    const del = (id) => {
        seedDreamStyleApi.delete({ id }).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                tableReload();
            } else {
                message.error(res.message)
            }
        })
    }

    // 分类选项
    const categoryOptions = [
        { label: '动漫', value: 'anime' },
        { label: '绘画', value: 'painting' },
        { label: '混合', value: 'mixed' },
        { label: '通用', value: 'general' },
    ];

    // 表格列
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
            align: 'center',
            search: false,
        },
        {
            title: '风格标识',
            dataIndex: 'key',
            width: 140,
            align: 'center',
            search: true,
            render: (_, record) => <Tag color="blue">{_}</Tag>,
        },
        {
            title: '风格名称',
            dataIndex: 'name',
            width: 120,
            align: 'center',
            search: true,
        },
        {
            title: '分类',
            dataIndex: 'category',
            width: 80,
            align: 'center',
            search: true,
            valueType: 'select',
            valueEnum: {
                anime: { text: '动漫' },
                painting: { text: '绘画' },
                mixed: { text: '混合' },
                general: { text: '通用' },
            },
        },
        {
            title: '封面图',
            dataIndex: 'cover_image',
            width: 80,
            align: 'center',
            search: false,
            render: (_, record) => (
                <Image
                    width={50}
                    height={50}
                    src={record.cover_image}
                    fallback={imgErr}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            )
        },
        {
            title: '参考图数量',
            dataIndex: 'reference_images',
            width: 100,
            align: 'center',
            search: false,
            render: (_, record) => {
                const count = Array.isArray(record.reference_images) ? record.reference_images.length : 0;
                return <Tag color={count > 0 ? 'green' : 'red'}>{count} 张</Tag>;
            }
        },
        {
            title: '排序',
            dataIndex: 'sort',
            width: 60,
            align: 'center',
            search: false,
            sorter: true,
        },
        {
            title: '新品',
            dataIndex: 'is_new',
            width: 70,
            align: 'center',
            search: false,
            render: (_, record) => (
                <Switch
                    size="small"
                    checked={record.is_new === 1}
                    onChange={(checked) => updateStatus(record.id, 'is_new', checked ? 1 : 0)}
                />
            )
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            width: 80,
            align: 'center',
            search: true,
            valueType: 'select',
            valueEnum: {
                1: { text: '启用' },
                0: { text: '禁用' },
            },
            render: (_, record) => (
                <Switch
                    checked={record.is_active === 1}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                    onChange={(checked) => updateStatus(record.id, 'is_active', checked ? 1 : 0)}
                />
            )
        },
        {
            title: '更新时间',
            dataIndex: 'update_time',
            width: 150,
            align: 'center',
            search: false,
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 120,
            search: false,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => setUpdateId(record.id)}
                    >编辑</Button>
                    <Popconfirm
                        title="确认要删除吗？"
                        description="删除后无法恢复"
                        onConfirm={() => del(record.id)}
                    >
                        <Button type="link" size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            ),
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
                    title: 'AI 风格配置',
                    subTitle: '管理 Seedream 4.5 风格参考图和提示词',
                    style: { padding: '0px 24px 12px' },
                }}
            >
                <ProTable
                    actionRef={tableRef}
                    formRef={formRef}
                    rowKey="id"
                    columns={columns}
                    scroll={{ x: 1200 }}
                    options={{ fullScreen: true }}
                    columnsState={{
                        persistenceKey: 'table_column_SeedDreamStyle',
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
                        showQuickJumper: true,
                        showSizeChanger: true,
                        responsive: true,
                    }}
                    request={async (params = {}, sort, filter) => {
                        let orderBy = '';
                        for (let key in sort) {
                            orderBy = key + ' ' + (sort[key] === 'descend' ? 'desc' : 'asc');
                        }
                        try {
                            const result = await seedDreamStyleApi.getList({
                                ...params,
                                orderBy,
                                page: params.current,
                            });
                            return {
                                data: result.data.data,
                                success: true,
                                total: result.data.total,
                            };
                        } catch (err) {
                            message.error('获取列表失败');
                            return { data: [], success: false, total: 0 };
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
