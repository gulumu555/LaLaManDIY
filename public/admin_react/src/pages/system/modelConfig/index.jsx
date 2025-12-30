import { useRef } from 'react';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import { Button, Space, Popconfirm, Tag, message, Switch } from 'antd';
import { PlusOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { modelConfigApi } from '@/api/modelConfig';
import { useNavigate } from 'react-router-dom';

/**
 * AI模型配置 - 列表页面
 * 
 * 管理Seedream等AI生成模型
 */
export default () => {
    const actionRef = useRef();
    const navigate = useNavigate();

    // 设为默认模型
    const handleSetDefault = async (id) => {
        const res = await modelConfigApi.setDefault({ id });
        if (res.code === 1) {
            message.success('设置成功');
            actionRef.current?.reload();
        }
    };

    // 删除
    const handleDelete = async (id) => {
        const res = await modelConfigApi.delete({ id });
        if (res.code === 1) {
            message.success('删除成功');
            actionRef.current?.reload();
        }
    };

    // 切换状态
    const handleStatusChange = async (id, checked) => {
        const res = await modelConfigApi.updateStatus({ id, is_active: checked ? 1 : 0 });
        if (res.code === 1) {
            message.success('状态已更新');
            actionRef.current?.reload();
        }
    };

    const columns = [
        {
            title: '模型标识',
            dataIndex: 'key',
            width: 140,
            render: (text, record) => (
                <Space>
                    {record.is_default === 1 && <StarFilled style={{ color: '#faad14' }} />}
                    <code>{text}</code>
                </Space>
            ),
        },
        {
            title: '名称',
            dataIndex: 'name',
            width: 150,
        },
        {
            title: '版本',
            dataIndex: 'version',
            width: 80,
            render: (text) => <Tag color="blue">v{text || '?'}</Tag>,
        },
        {
            title: '服务商',
            dataIndex: 'provider',
            width: 100,
            valueEnum: {
                volcengine: { text: '火山引擎', status: 'Processing' },
                other: { text: '其他', status: 'Default' },
            },
        },
        {
            title: '描述',
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            width: 80,
            render: (_, record) => (
                <Switch
                    checked={record.is_active === 1}
                    onChange={(checked) => handleStatusChange(record.id, checked)}
                    checkedChildren="启用"
                    unCheckedChildren="停用"
                />
            ),
        },
        {
            title: '排序',
            dataIndex: 'sort',
            width: 70,
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 200,
            render: (_, record) => (
                <Space>
                    {record.is_default !== 1 && (
                        <a onClick={() => handleSetDefault(record.id)}>
                            <StarOutlined /> 设为默认
                        </a>
                    )}
                    <a onClick={() => navigate(`/system/modelConfig/update/${record.id}`)}>
                        修改
                    </a>
                    <Popconfirm
                        title="确定删除此模型配置？"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <a style={{ color: '#ff4d4f' }}>删除</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer
            title="AI模型配置"
            subTitle="管理Seedream等AI生成模型，可设置默认模型和参数"
        >
            <ProTable
                actionRef={actionRef}
                columns={columns}
                rowKey="id"
                request={async (params) => {
                    const res = await modelConfigApi.getList(params);
                    return {
                        data: res.data?.data || [],
                        total: res.data?.total || 0,
                        success: res.code === 1,
                    };
                }}
                search={false}
                toolBarRender={() => [
                    <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/system/modelConfig/create')}
                    >
                        添加模型
                    </Button>,
                ]}
            />
        </PageContainer>
    );
};
