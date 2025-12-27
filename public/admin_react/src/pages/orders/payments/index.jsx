import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { paymentsApi } from '@/api/payments';
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
import { NavLink } from 'react-router-dom';
import { authCheck, arrayToTree} from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';
import {payment_status_option,payment_type_option} from "../config.js";


/**
 * 充值订单
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






    // 表格列
    const columns = [
        {
            title: '订单ID',
            dataIndex: 'id',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '充值套餐(次)',
            dataIndex: 'order_count',
            search: true,
            valueType : 'text',
            render: (_, record) => _,
        },
        {
            title: '交易单号',
            dataIndex: 'transaction_id',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '订单金额',
            dataIndex: 'total_amount',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '佣金抵扣',
            dataIndex: 'balance_amount',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '微信支付',
            dataIndex: 'payment_amount',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '支付状态',
            dataIndex: 'payment_status',
            search: true,
            valueType : 'select',
            fieldProps: {
                showSearch: true,
                options: [...payment_status_option]
            },
            render: (_, record) => _,
        },
        {
            title: '支付方式',
            dataIndex: 'payment_type',
            search: true,
            valueType : 'select',
            fieldProps: {
                showSearch: true,
                options: [...payment_type_option]
            },
            render: (_, record) => _,
        },
        {
            title: '手机号码',
            dataIndex: 'tel',
            search: false,
            valueType : 'text',
            render: (_, record) => _,
        },
        {
            title: '支付时间',
            dataIndex: 'payment_time',
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
                    title: '充值订单',
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
                        persistenceKey: 'table_column_' + 'Payments',
                        persistenceType: 'localStorage'
                    }}
                    headerTitle={
                        <Space>
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
                        const result = await paymentsApi.getList({
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

                />
            </PageContainer>
        </>
    )
}
