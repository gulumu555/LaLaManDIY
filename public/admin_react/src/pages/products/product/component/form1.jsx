import React, {useEffect, useState} from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormSwitch,
  ProFormTextArea
} from '@ant-design/pro-components';
import {Row, Col} from 'antd';
import {categoryApi} from '@/api/category';
import {arrayToTree} from '@/common/function';
import UploadImg from '@/component/form/uploadImg/index';
import ProductSpec from './product-spec.jsx';

/**
 * 产品管理 添加修改的form字段
 *
 * @param {string} typeAction create》添加，update》修改
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({typeAction, form,specForm}) => {
  const [initialValues, setInitValues] = useState([]);

  const handleSpecFormChange = (values) => {
    form.setFieldsValue({product_spec: values.specForm});
  };


  useEffect(() => {
    if (typeAction === 'update') {
      setInitValues([...specForm])
    }
  }, [typeAction,specForm]);

  return (
    <>
      <Row gutter={[24, 0]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormSelect
            name="cate_id"
            label="产品类型"
            placeholder="请选择"
            fieldform={{
              showSearch: true,
              optionFilterProp: 'label',
            }}
            request={async () => {
              const res = await categoryApi.getList({pageSize: 9999});
              return res.data.data.map(item => {
                return {
                  label: item.cate_name,
                  value: item.id
                };
              });
            }}
            rules={[
              {required: true, message: '请选择'},
            ]}
            labelCol={{span: 6}} // 标签占据 6 列
            wrapperCol={{span: 10}} // 输入框占据 18
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormText
            name="product_name"
            label="产品名称"
            placeholder="请输入"
            rules={[
              {required: true, message: '请输入'},
            ]}
            labelCol={{span: 6}} // 标签占据 6 列
            wrapperCol={{span: 10}} // 输入框占据 18
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormDigit
            name="sort"
            label="排序"
            placeholder="请输入"
            fieldform={{
              precision: 0,
              style: {width: '100%'},
            }}
            min={0}
            extra="数值越大，排序越靠前"
            rules={[
              {required: true, message: '请输入'},
            ]}
            labelCol={{span: 6}} // 标签占据 6 列
            wrapperCol={{span: 10}} // 输入框占据 18
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={24}>
          <ProForm.Item
            name="main_image"
            label="产品图片"
            rules={[
              {required: true, message: '请输入'},
            ]}
          >
            <UploadImg/>
          </ProForm.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={24}>
        <ProFormTextArea
          name="description"
          label="AI关键词"
          placeholder="请输入"
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 6,
            }
          }}
          rules={[
            {required: false, message: '请输入'},
          ]}
        />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={24}>
          <ProForm.Item
            name="product_spec"
            label="产品规格"
            rules={[
              {required: false, message: '请输入'},
            ]}
          >
            <ProductSpec specForm={handleSpecFormChange} initialValues={initialValues} />
          </ProForm.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <ProFormSwitch
            name="status"
            label="上架状态"
            extra=""
            checkedChildren="上架"
            unCheckedChildren="下架"
            checked={true}
            rules={[
              {required: true, message: '请选择'},
            ]}
            labelCol={{span: 6}} // 标签占据 6 列
            wrapperCol={{span: 10}} // 输入框占据 18
          />
        </Col>
      </Row>
    </>
  );
};
