import React, {useRef, lazy, useState, useEffect} from 'react';
import {ModalForm, PageContainer, ProFormText, ProFormTextArea} from '@ant-design/pro-components';
import {withdrawOrderApi} from '@/api/withdrawOrder';
import {ProTable} from '@ant-design/pro-components';
import {
  App, Button, Popconfirm, Typography, Space, Tooltip, Avatar, Col, Row,
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
import {config} from '@/common/config';
import {NavLink} from 'react-router-dom';
import {authCheck, arrayToTree} from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';
import {payment_status_option} from "../../orders/config.js";

const Update = lazy(() => import('./update'));

/**
 * 提现记录
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default () => {
  const {message} = App.useApp();
  const tableRef = useRef();
  const formRef = useRef();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // 要修改的数据
  const [updateId, setUpdateId] = useState(0);

  const [examine, setExamine] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  const modalFormRef = useRef();

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
      title: '头像',
      dataIndex: 'avatar',
      search: false,
      render: (_, record) => <>
        <Avatar src={`${record.avatar}`}>{record.nickname?.substr(0, 1)}</Avatar>
      </>
    },
    {
      title: '用户昵称',
      dataIndex: 'nickname',
      search: true,
      valueType: 'text',
      render: (_, record) => _,
    },
    {
      title: '手机号码',
      dataIndex: 'tel',
      search: true,
      valueType: 'text',
      copyable: true,
      render: (_, record) => _,
    },
    {
      title: '本次提现金额',
      dataIndex: 'amount',
      search: false,
      render: (_, record) => _,
    },
    {
      title: '提现账号（微信账号）',
      dataIndex: 'wx_id',
      search: false,
      render: (_, record) => _,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      search: true,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        options: [
          {
            label: '审核中',
            value: 0,
          },
          {
            label: '审核通过',
            value: 1,
          },
          {
            label: '审核拒绝',
            value: 2,
          }
        ]
      },
      render: (_, record) => {
        return <>
          {
            record.status === 0 ? (
              <>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setUpdateId(record.id)
                  }}
                  disabled={authCheck('withDrawOrderUpdateStatus')}
                >{record.status_desc}</Button>
              </>
            ) : (
              record.status === 2 ? (
                <span href="#" className="red-text">{record.status_desc}</span>
              ) : record.status_desc
            )
          }
        </>
      },
    },
    /*{
      title: '提现状态',
      dataIndex: 'withdraw_status',
      search: false,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        options: [
          {
            label: '-',
            value: 0,
          },
          {
            label: '提现成功',
            value: 1,
          },
          {
            label: '提现失败',
            value: 2,
          }
        ]
      },
    },*/
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      render: (_, record) => _,
    },

    {
      title: '申请日期',
      dataIndex: 'create_time',
      search: false,
      render: (_, record) => _,
    },

  ];


  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status !== 0,
    }),
  };

  // 批量通过操作
  const handleBatchExamine = (status) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要审核的提现记录');
      return;
    }

    // setForm({
    //   id: selectedRowKeys,
    //   status: status,
    // })

    setCurrentStatus(status);
    setExamine(true);
    /*try {
      // 调用 API 批量通过
      let param = {
        id: selectedRowKeys,
        status: status,
      }
      withdrawOrderApi.updateStatus(param).then(res => {
        message.success('批量审核成功');
        tableReload();
      });

    } catch (error) {
      message.error('批量审核失败，请重试');
      console.error('批量审核失败:', error);
    }*/
  };

  const submit = (param) => {
    try {
      withdrawOrderApi.updateStatus(param).then(res => {
        message.success('批量审核成功');
        setExamine(false);
        modalFormRef.current?.resetFields();
        tableReload();
      });
    } catch (error) {
      message.error('批量审核失败，请重试');
      console.error('批量审核失败:', error);
    }
  }

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
          title: '提现记录',
          style: {padding: '0px 24px 12px'},
        }}
      >
        <ProTable
          actionRef={tableRef}
          formRef={formRef}
          rowKey="id"
          columns={columns}
          rowSelection={rowSelection}
          scroll={{
            x: 1000
          }}
          options={{
            fullScreen: true
          }}
          columnsState={{
            // 此table列设置后存储本地的唯一key
            persistenceKey: 'table_column_' + 'WithdrawOrder',
            persistenceType: 'localStorage'
          }}
          headerTitle={
            <Space>
              <Popconfirm
                title="确认要批量通过这些提现记录吗？"
                onConfirm={() => handleBatchExamine(1)}
                okText="确定"
                cancelText="取消"
                disabled={authCheck('withDrawOrderUpdateStatus') || selectedRowKeys.length === 0}
              >
                <Button
                  type="primary"
                >
                  批量通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认要批量拒绝这些提现记录吗？"
                onConfirm={() => handleBatchExamine(2)}
                okText="确定"
                cancelText="取消"
                disabled={authCheck('withDrawOrderUpdateStatus') || selectedRowKeys.length === 0}
              >
                <Button
                  type="primary"
                >
                  批量拒绝
                </Button>
              </Popconfirm>
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
            const result = await withdrawOrderApi.getList({
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

      <Lazyload block={false}>
        <ModalForm
          formRef={modalFormRef}
          open={examine}
          onOpenChange={(_boolean) => {
            if (modalFormRef.current) {
              if (_boolean === false) {
                modalFormRef.current.resetFields();
              } else {
                modalFormRef.current.resetFields();
              }
            }
            setExamine(_boolean);
          }}
          title="审核"
          width={500}
          // 第一个输入框获取焦点
          autoFocusFirstInput={true}
          // 可以回车提交
          isKeyPressSubmit={true}
          // 不干掉null跟undefined 的数据
          omitNil={false}
          onFinish={submit}
        >
          {/* 隐藏字段存储 id */}
          <ProFormText
            name="id"
            initialValue={selectedRowKeys}
            hidden
          />
          {/* 隐藏字段存储 status */}
          <ProFormText
            name="status"
            initialValue={currentStatus}
            hidden
          />
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入"
              />
            </Col>
          </Row>
        </ModalForm>
      </Lazyload>
    </>
  )
}
