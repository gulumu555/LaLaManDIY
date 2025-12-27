import {Typography, Button, Popconfirm, Space, Tooltip, Form, Input, Image, message} from 'antd';
import {logistics_status_option, payment_status_option, payment_type_option, refund_status_option} from '../config.js';
import {categoryApi} from "@/api/category"
import {
  ModalForm, ProForm,
} from '@ant-design/pro-components';
import {ordersApi} from "@/api/orders"
import React from "react";
import {orderRefundApi} from "../../../api/orderRefund.js";
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import { config } from '@/common/config.js';

const imgErr = new URL('@/static/default/imgErr.png', import.meta.url).href;

export const columnsList = (setTriggeredButton) => {
  const  [loadingIds, setLoadingIds] = React.useState([]);

  const handleDownload = async (record) => {
    try {
      // 将当前记录ID加入loading状态
      setLoadingIds(prev => [...prev, record.id]);

      // 调用后端接口下载文件，由后端处理跨域问题
      const result = await ordersApi.download({urls: record.ai_data, name: 'ai_data'});

      // 构造下载URL（使用后端返回的临时文件路径）
      const downloadUrl = `${config.url}/${result.data}`;

      // 创建一个隐藏的a标签来触发下载
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${record.order_no}_models.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 从loading状态中移除当前记录ID
      setLoadingIds(prev => prev.filter(id => id !== record.id));

      // 可以考虑添加清理临时文件的API调用
    } catch (error) {
      console.error('下载文件时出错:', error);
      message.error('下载文件时出错: ' + error.message);
      // 出错时也移除loading状态
      setLoadingIds(prev => prev.filter(id => id !== record.id));
    }
  };

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
      minWidth: 50,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '订单编号',
      dataIndex: 'order_no',
      search: true,
      align: 'center',
      ellipsis: true,
      width: 160,
      render: (_, record) => _,
    },
    {
      title: '产品类型',
      dataIndex: 'cate_id',
      search: true,
      valueType: 'select',
      minWidth: 100,
      align: 'center',
      request: async () => {
        const result = await categoryApi.getList({pageSize: 9999, type: 1});
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
      title: '产品名称',
      dataIndex: 'product_name',
      search: true,
      valueType: 'text',
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '产品主图',
      dataIndex: 'product_image',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => (
        <Image
          width={40}
          src={`${record.product_image}`}
          fallback={imgErr}
        />
      )
    },
    {
      title: '规格尺寸',
      dataIndex: 'spec',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '打印照片',
      dataIndex: 'result_image',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => (
        <Image
          width={40}
          src={`${record.result_image}`}
          fallback={imgErr}
        />
      )
    },
    {
      title: '手机号码',
      dataIndex: 'tel',
      search: true,
      width: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '订单总金额',
      dataIndex: 'total_amount',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '佣金抵扣',
      dataIndex: 'balance_amount',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '实付金额',
      dataIndex: 'payment_amount',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },

    {
      title: '支付状态',
      dataIndex: 'payment_status',
      search: true,
      valueType: 'select',
      align: 'center',
      fieldProps: {
        showSearch: true,
        options: [...payment_status_option]
      },
      minWidth: 100,
      render: (_, record) => _,
    },
    {
      title: '支付方式',
      dataIndex: 'payment_type',
      search: true,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        options: [...payment_type_option]
      },
      render: (_, record) => _,
    },
    {
      title: '支付时间',
      dataIndex: 'payment_time',
      search: false,
      width: 150,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '收货地址',
      dataIndex: 'address',
      search: false,
      width: 150,
      render: (_, record) => _,
    },

    {
      title: '物流状态',
      dataIndex: 'logistics_status',
      search: true,
      valueType: 'select',
      align: 'center',
      fieldProps: {
        showSearch: true,
        options: [...logistics_status_option]
      },
      minWidth: 100,
      render: (_, record) => <>{record.logistics_status_desc}</>,
    },
    {
      title: '售后状态',
      dataIndex: 'refund_status',
      search: true,
      valueType: 'select',
      align: 'center',
      fieldProps: {
        showSearch: true,
        options: [...refund_status_option]
      },
      minWidth: 100,
      render: (_, record) => <>{record.refund_status_desc}</>,
    },
    {
      title: '审核备注',
      dataIndex: 'refuse_reason',
      search: false,
      valueType: 'select',
      align: 'center',
      ellipsis: true,
      fieldProps: {
        showSearch: true,
        options: [...refund_status_option]
      },
      minWidth: 100,
      render: (_, record) => _,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      search: false,
      width: 150,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '发货时间',
      dataIndex: 'shipping_time',
      search: false,
      width: 150,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '确认收货时间',
      dataIndex: 'after_time',
      search: false,
      width: 150,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '物流公司',
      dataIndex: 'shipping_name',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '物流单号',
      dataIndex: 'shipping_code',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      minWidth: 100,
      align: 'center',
      render: (_, record) => _,
    },
    {
      title: '操作',
      search: false,
      width: 200,
      fixed: 'right',
      render: (_, record) => <>
        {
          record.ai_data && (
            record.product_type === 3 ? (<Button
              loading={loadingIds.includes(record.id)}
              style={{marginRight: 8}}
              type={'primary'}
              onClick={() => handleDownload(record)}
            >
              {!loadingIds.includes(record.id) ? '模型下载' : '下载中..'}
            </Button>) : (
              <a style={{marginRight: 8}} href={`${record.ai_data}`}><Button type={"primary"}>资料下载</Button></a>
            )
          )
        }

        {record.can_shipping === true && (
          <Button
            type="primary"
            onClick={() => {
              setTriggeredButton('shipping', record);
            }}
            style={{marginRight: 8}} // 添加一些间距，让两个按钮不紧挨在一起
          >
            发货
          </Button>
        )}
        {record.can_refund === true && (
          <Button
            type="primary"
            onClick={() => {
              setTriggeredButton('examine', record);
            }}
          >
            审核
          </Button>
        )}
        {!record.can_shipping && !record.can_refund && <>-</>}
      </>,
    },
  ]
}

export const ShippingForm = ({shipping, selectedRecord, setShipping, shippingFormSubmit}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (selectedRecord && shipping) {
      form.setFieldsValue({
        shipping_name: '顺丰快递',
        shipping_code: '',
      });
    }
  }, [shipping]);
  form.setFieldsValue({shipping_name: "顺丰快递"});

  return (
    <ModalForm
      title="填写发货信息"
      form={form}
      open={shipping}
      onVisibleChange={setShipping}
      width="500px"
      layout="vertical"
      submitter={{
        searchConfig: {
          submitText: '确认发货',
        },
        resetButtonProps: {
          style: {
            // 隐藏重置按钮
            display: 'show',
          },
        },
      }}
      onFinish={async (values) => {
        // 处理发货信息提交
        values.id = selectedRecord.id;
        shippingFormSubmit(values);

      }}
    >
      <Form.Item
        name="shipping_name"
        label="收货地址"
        rules={[
          {
            required: false,
          },
        ]}
        // labelCol={{ span: 5 }}
        // wrapperCol={{ span: 16 }}
      >
        <Space direction="horizontal" style={{marginBottom: 16, marginLeft: 16}}>
          <Typography.Text>{selectedRecord?.address || '-'}</Typography.Text>
        </Space>
      </Form.Item>

      <Form.Item
        name="shipping_name"
        label="物流公司"
        rules={[
          {
            required: true,
            message: '请输入快递公司',
          },
        ]}
        // labelCol={{ span: 5 }}
        // wrapperCol={{ span: 16 }}
      >
        <Input placeholder="请输入快递公司" readOnly/>
      </Form.Item>
      <Form.Item
        name="shipping_code"
        label="物流单号"
        rules={[
          {
            required: true,
            message: '请输入物流单号',
          },
        ]}
        // labelCol={{ span: 5 }}
        // wrapperCol={{ span: 16 }}
      >
        <Input placeholder="请输入快递单号"/>
      </Form.Item>
      <Form.Item
        name="remark"
        label="备注"
        rules={[
          {
            required: false,
            message: '请输入备注',
          },
        ]}
        // labelCol={{ span: 5 }}
        // wrapperCol={{ span: 16 }}
      >
        <Input.TextArea placeholder="请输入备注"/>
      </Form.Item>
    </ModalForm>
  );
};

