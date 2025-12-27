import React, { useRef, lazy, useState} from 'react';
import { useUpdateEffect } from 'ahooks';
import {
  ModalForm, ProForm, ProFormText, ProFormTextArea, ProFormRadio
} from '@ant-design/pro-components';
import {Col, Form, Image, message, Row} from "antd";
import UploadImgAll from "../../../component/form/uploadImgAll/index.jsx";
import {orderRefundApi} from "../../../api/orderRefund.js";
import UploadImgMini from "../../../component/form/uploadImgMini/index.jsx";
import ImagePreivew from "../../../component/form/imagePreivew/index.jsx";
const imgErr = new URL('@/static/default/imgErr.png', import.meta.url).href;

/**
 * 审核
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export const ExamineForm = ({ examine, selectedRecord, setExamine, tableReload}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (selectedRecord && examine) {
      orderRefundApi.findData({order_id: selectedRecord.id}).then(res => {
        form.setFieldsValue({...res.data});
      });
    }
  }, [examine]);


  const onFinish = async (values) => {
    if (selectedRecord) {
      values.order_id = selectedRecord.id; // 假设记录中有 id 字段
      try {
        const result = await orderRefundApi.updateStatus(values);
        if (result.code === 1) {
          message.success('审核成功')
          tableReload?.();
          setExamine(false); // 关闭模态框
        } else {
          message.error(result.message)
        }
      } catch (err) {
        // 错误处理
      }
    }
  };

  return <>
    <ModalForm
      title="订单审核"
      form={form}
      open={examine}
      width="500px"
      layout="vertical"
      onOpenChange={(_boolean) => {
        setExamine(_boolean);
      }}
      submitter={{
        searchConfig: {
          submitText: '提交',
        },
        resetButtonProps: {
          style: {
            // 隐藏重置按钮
            display: 'show',
          },
        },
      }}
      onFinish={onFinish}
    >
      <Row gutter={[24, 0]}>

        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormText
            name="refund_amount"
            label="退款总金额"
            placeholder="请输入"
            rules={[
              //{ required: true, message: '请输入' },
            ]}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormText
            name="wx_amount"
            label="微信退回金额"
            placeholder="请输入"
            rules={[
              //{ required: true, message: '请输入' },
            ]}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormText
            name="balance_amount"
            label="佣金退回金额"
            placeholder="请输入"
            rules={[
              //{ required: true, message: '请输入' },
            ]}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormText
            name="reason"
            label="退款原因"
            placeholder="请输入"
            readonly={true}
            rules={[
              //{ required: true, message: '请输入' },
            ]}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
          <ProForm.Item
            name="file"
            label="附件"
            rules={[
              //{ required: true, message: '请输入' },
            ]}
          >
           <ImagePreivew/>
          </ProForm.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormRadio.Group
            name="examine_status"
            label="审核状态"
            placeholder="请选择"
            options={[
              { label: '同意', value: 2},
              { label: '拒绝', value: 3},
            ]}
            rules={[
              //{ required: true, message: '请选择' },
            ]}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormTextArea
            name="remark"
            label="备注"
            placeholder="请输入"
            rules={[
              //{ required: true, message: '请输入' },
            ]}
          />
        </Col>
      </Row>

    </ModalForm>
  </>
}
