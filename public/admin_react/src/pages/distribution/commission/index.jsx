import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { userBalanceLogApi } from '@/api/userBalanceLog';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Typography, Space, Tooltip,
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
import {NavLink, useLocation} from 'react-router-dom';
import { authCheck, arrayToTree} from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';


/**
 * 佣金明细
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default () => {
    const { message } = App.useApp();
    const tableRef = useRef();
    const formRef = useRef();
    const [statisticTotal, setStatisticTotal] = useState({})

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const user_id = queryParams.get('user_id');

    // 刷新表格数据
    const tableReload = () => {
        tableRef.current.reload();
        tableRef.current.clearSelected();
    }






    // 表格列
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '用户昵称',
            dataIndex: 'nickname',
            search: true,
            valueType : 'text',
            copyable: true,
            render: (_, record) => _,
        },
        {
            title: '手机号码',
            dataIndex: 'tel',
            search: true,
            valueType : 'text',
            copyable: true,
            render: (_, record) => _,
        },
        {
            title: '变动金额',
            dataIndex: 'amount',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '变动原因',
            dataIndex: 'type',
            search: true,
            valueType : 'select',
            fieldProps: {
                showSearch: true,
                options: [
                    {
                        value: 1,
                        label: '消费提成',
                    },
                    {
                        value: 2,
                        label: '提现成功',
                    },
                    {
                        value: 3,
                        label: '提现失败',
                    },
                    {
                        value: 4,
                        label: '购买服务消费',
                    },
                    {
                        value: 5,
                        label: '打印消费',
                    },
                    {
                        value: 6,
                        label: '售后退费',
                    },
                    {
                        value: 7,
                        label: '订单取消',
                    },
                    {
                        value: 8,
                        label: '消费退款',
                    },
                ]
            },
            render: (_, record) => _,
        },
        {
            title: '状态',
            dataIndex: 'status',
            search: true,
            valueType : 'select',
            fieldProps: {
                showSearch: true,
                options: [
                    {
                        value: 0,
                        label: '冻结',
                    },
                    {
                        value: 1,
                        label: '正常',
                    },
                    // {
                    //     value: 2,
                    //     label: '正常',
                    // },
                ]
            },
            render: (_, record) =>
              <>
                {record.status_desc}
            </>,
        },
        {
            title: '关联订单（关联ID）',
            dataIndex: 'order_id',
            search: false,
            render: (_, record) => <NavLink to={`/orders/print?order_id=${record.order_id}`} >{record.order_id}</NavLink>,
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            search: false,
            render: (_, record) => _,
        },
    ];
    return (
        <>
             <PageContainer
                className="sa-page-container"
                ghost
                header={{
                    title: '佣金明细',
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
                        persistenceKey: 'table_column_' + 'UserBalanceLog',
                        persistenceType: 'localStorage'
                    }}
                    headerTitle={
                        <Space>
                            佣金（含冻结）合计(元)：<span className="red-text">{ statisticTotal.total || '0.00' }</span> &nbsp;&nbsp;
                            冻结金额合计（元）: <span className="red-text">{ statisticTotal.freeze || '0.00' }</span> &nbsp;&nbsp;
                            佣金使用合计（元）: <span className="red-text">{ statisticTotal.used || '0.00' }</span> &nbsp;&nbsp;
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
                        const result = await userBalanceLogApi.getList({
                            ...params,// 包含了翻页参数跟搜索参数
                            orderBy, // 排序
                            page: params.current,
                            user_id,
                        });

                        setStatisticTotal(result.data.statistic)
                        return {
                            data: result.data.data,
                            success: true,
                            total: result.data.total,
                        };
                    }}

                />
            </PageContainer>
        </>
    )
}
