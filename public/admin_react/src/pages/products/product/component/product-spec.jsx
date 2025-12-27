import React, {useEffect} from 'react';
import { Form, Input, Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import './product-spec.css';

/**
 * 产品规格
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 */
export default ({ specForm, initialValues }) => {

  const [form] = Form.useForm();
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({ specForm: initialValues });
    }
  }, [initialValues]);

  return (
    <Form
      form={form}
      className="form-spec"
      onValuesChange={(changedValues, allValues) => {
        if (specForm) {
          specForm(allValues);
        }
      }}
    >
      <Form.List name='specForm'>
        {(fields, { add, remove }) => (
          <div className="form-item-total-container">
            <div className="item-container">
              {fields.map((field, index) => (
                <div key={field.key} className="form-item-container">
                  <Form.Item
                    {...field}
                    label="规格名称"
                    name={[field.name, 'spec_name']}
                    className="form-item"
                    rules={[{ required: true, message: '请输入规格名称' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="价格（元）"
                    name={[field.name, 'price_adjustment']}
                    className="form-item"
                    rules={[{ required: true, message: '请输入价格' }]}
                  >
                    <Input defaultValue="0.00" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="精度（宽 px）"
                    name={[field.name, 'accuracy_width']}
                    className="form-item"
                    rules={[{ required: false, message: '请输入精度（宽 px）' }]}
                  >
                    <Input defaultValue={0} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="精度（高 px）"
                    name={[field.name, 'accuracy_height']}
                    className="form-item"
                    rules={[{ required: false, message: '请输入精度（高 px）' }]}
                  >
                    <Input defaultValue={0} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="库存"
                    name={[field.name, 'stock']}
                    className="form-item"
                    rules={[{ required: true, message: '请输入库存' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="排序"
                    name={[field.name, 'sort']}
                    className="form-item"
                    rules={[{ required: true, message: '请输入排序' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item className="form-item">
                    <DeleteOutlined
                      className="delete-icon"
                      onClick={() => remove(index)}
                    />
                  </Form.Item>
                </div>
              ))}
            </div>
            <div className="add-button-container">
              <Button
                type="dashed"
                onClick={() => add({
                  spec_name: '',
                  price_adjustment: '0.00',
                  accuracy_width: 0,
                  accuracy_height: 0,
                  stock: 0,
                  sort: 0
                })}
                icon={<PlusOutlined />}
              >
                新增规格
              </Button>
            </div>
          </div>
        )}
      </Form.List>
    </Form>
  );
};
