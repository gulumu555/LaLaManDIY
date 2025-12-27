import { useRef, lazy, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { photoOrderApi } from '@/api/photoOrder';
import { ProTable } from '@ant-design/pro-components';
import {
    App, Button, Popconfirm, Typography, Space, Tooltip, Image,
} from 'antd';
const imgErr = new URL('@/static/default/imgErr.png', import.meta.url).href;


/**
 * 打印订单
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
            title: 'ID',
            dataIndex: 'id',
            search: false,
            render: (_, record) => _,
        },
        {
            title: '类型',
            dataIndex: 'order_type',
            search: false,
            valueType : 'select',
            fieldProps: {
                showSearch: true,
                options: [
                    {
                        value: 1,
                        label: '风格转绘',
                    },
                    {
                        value: 2,
                        label: '打印服务',
                    },
                ]
            },
            render: (_, record) => _,
        },
        {
            title: '生图名称',
            dataIndex: 'name',
            search: true,
            valueType : 'text',
            render: (_, record) => _,
        },


        {
            title: '生成图片',
            dataIndex: 'ai_original_img',
            search: false,
            render: (_, record) => (
              <Image
                width={40}
                src={`${record.ai_original_img}`}
                fallback={imgErr}
              />
            )
        },
        {
            title: '手机号码',
            dataIndex: 'tel',
            search: true,
            render: (_, record) => _,
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
                    title: '生图订单',
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
                        persistenceKey: 'table_column_' + 'PhotoOrder',
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
                        const result = await photoOrderApi.getList({
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
