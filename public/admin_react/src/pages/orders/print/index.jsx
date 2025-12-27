import React, {useRef, lazy, useState} from 'react';
import {PageContainer} from '@ant-design/pro-components';
import {ordersApi} from '@/api/orders';
// import { categoryApi } from '@/api/category';
import {ProTable} from '@ant-design/pro-components';
import {
  App, Button, Popconfirm, Typography, Space, Tooltip, Form, Tabs,
} from 'antd';
import {columnsList, ShippingForm} from "./columns.jsx";
import {useLocation} from "react-router-dom";
import TabPane from "antd/es/tabs/TabPane.js";
import {ExamineForm} from './examine.jsx'
import {orderRefundApi} from "../../../api/orderRefund.js";
import LazyLoad from "../../../component/lazyLoad/index.jsx";


/**
 * 打印订单
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default () => {
  const {message} = App.useApp();
  const tableRef = useRef();
  const formRef = useRef();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const order_id = queryParams.get('order_id');
  const [activeTab, setActiveTab] = useState('0');
  const [loading, setLoading] = useState(false);
  const [examine, setExamine] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);


  const setTriggeredButton = (type, record) => {
    if (type === 'examine') {
      setExamine(true);
    } else {
      setShipping(true)
    }

    setSelectedRecord(record)
  }

  const setExamineVisible = (visible) => {
    setExamine(visible)
  }

  const setShippingVisible = (visible) => {
    setShipping(visible)
  }

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

  const shippingFormSubmit = async (values) => {
    // 处理发货信息提交
    ordersApi.updateShipping(values).then(res => {
      if (res.code === 1) {
        message.success('发货成功');
        setShipping(false);
        tableReload(); // 刷新表格数据
      }
    }).catch(err => {
      setShipping(false)
    });

  }

  const examineFormSubmit = async (values) => {
    // 处理审核信息提交
    orderRefundApi.updateStatus(values).then(res => {
      if (res.code === 1) {
        message.success(res.message);
        setExamineVisible(false);
        tableReload(); // 刷新表格数据
      }
    }).catch(err => {
      setExamineVisible(false)
    });
  }

  const callback = (key) => {
    console.log(`当前激活的标签页: ${key}`);
    setActiveTab(key);
    tableReload();
  };

  return (
    <>
      <PageContainer
        className="sa-page-container"
        ghost
        header={{
          title: '打印订单',
          style: {padding: '0px 24px 12px'},
        }}
      >
        <ProTable
          actionRef={tableRef}
          formRef={formRef}
          rowKey="id"
          columns={columnsList(setTriggeredButton)}
          scroll={{
            x: 3000
          }}
          options={{
            fullScreen: true
          }}
          columnsState={{
            // 此table列设置后存储本地的唯一key
            persistenceKey: 'table_column_' + 'Orders',
            persistenceType: 'localStorage'
          }}
          headerTitle={
            <Space>
              <Tabs type="card" activeKey={activeTab} onChange={callback}>
                <TabPane tab="全部" key="0">
                </TabPane>
                <TabPane tab="待支付" key="1">
                </TabPane>
                <TabPane tab="待发货" key="3">
                </TabPane>
                <TabPane tab="待收货" key="4">
                </TabPane>
                <TabPane tab="已完成" key="5">
                </TabPane>
                <TabPane tab="售后/退款" key="6">
                </TabPane>
              </Tabs>
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
            setLoading(true); // 开始加载
            try {
              const result = await ordersApi.getList({
                ...params, // 包含了翻页参数跟搜索参数
                orderBy, // 排序
                page: params.current,
                id: order_id,
                order_status: activeTab === '0' ? '' : activeTab // 处理 "全部" 情况
              });
              return {
                data: result.data.data,
                success: true,
                total: result.data.total,
              };
            } catch (err) {
              message.error('获取订单列表失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            } finally {
              setLoading(false); // 结束加载
            }
          }}
          loading={loading} // 添加 loading 属性
        />

        <LazyLoad block={false}>
          <ShippingForm
            shipping={shipping}
            selectedRecord={selectedRecord}
            setShipping={setShippingVisible}
            shippingFormSubmit={shippingFormSubmit}
          />
          <ExamineForm
            examine={examine}
            selectedRecord={selectedRecord}
            setExamine={setExamineVisible}
            tableReload={tableReload}
          />
        </LazyLoad>
      </PageContainer>
    </>
  )
}
