import React, {useRef, useState, lazy} from 'react';
import {
  ModalForm, ProTable,
} from '@ant-design/pro-components';
import {userApi} from '@/api/user';
import {App, Avatar} from 'antd';
import {useUpdateEffect} from 'ahooks';
import {Table} from "antd";


const Form1 = lazy(() => import('./../component/form1'));

/**
 * 用户 修改
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ updateId, setUpdateId, ...props}) => {
  const formRef = useRef();
  const {message} = App.useApp();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  useUpdateEffect(() => {
    if (updateId > 0) {
      setOpen(true);
      userApi.addressList({
        user_id: updateId,
        current: 1,
        pageSize: 9999,
        page: 1
      }).then(res => {

        setList(res.data.data);
      })
    }
  }, [updateId])

  // 表格列
  const columns = [
    {
      title: '收货人姓名',
      dataIndex: 'name',
      width:100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width:100,
    },
    {
      title: '地址',
      ellipsis: true,
      dataIndex: 'address',
      width:200,
      render: (_, record) => <>
        {record.pid_path_title} {record.address}
      </>,
    },
    {
      title: '是否默认地址',
      dataIndex: 'is_default',
      valueType: 'text',
      render: (_, record) => record.is_default === 1 ? '是' : '否',
      width:110,
    },
    {
      title: '修改时间',
      dataIndex: 'update_time',
      width:140,
    },
  ]
  return <>
    <ModalForm
      name="userAddress"
      formRef={formRef}
      open={open}
      onOpenChange={(_boolean) => {
        setOpen(_boolean);
        // 关闭的时候干掉updateId，不然无法重复修改同一条数据
        if (_boolean === false) {
          setUpdateId(0);
        }
      }}
      title="用户地址"
      width={850}
      // 第一个输入框获取焦点
      autoFocusFirstInput={true}
      // 不干掉null跟undefined 的数据
      omitNil={false}
      modalProps={{
        destroyOnClose: true,
      }}
      params={{
        id: updateId
      }}
      submitter={false}
    >
      <Table dataSource={list} columns={columns}/>;
    </ModalForm>
  </>;
};
