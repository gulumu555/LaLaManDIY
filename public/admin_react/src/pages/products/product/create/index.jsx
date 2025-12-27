import { useRef, lazy } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import { productApi } from '@/api/product';
import {Button, App, Form} from 'antd';
import { authCheck } from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';

const Form1 = lazy(() => import('./../component/form1'));

/**
 * 产品管理 新增
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ tableReload }) => {
    const formRef = useRef();
    const [form] = Form.useForm();
    const { message } = App.useApp();

    return <>
        <ModalForm
            name="createProduct"
            form={form}
            formRef={formRef}
            title="添加产品管理"
            initialValues={{
                product_spec: [],
                cate_id: '',
                sort:0,
                product_name: '',
                price: 0,
                stock: 0,
                description: ''
            }}
            trigger={
                <Button
                    type="primary"
                    disabled={authCheck('productCreate')}
                    icon={<PlusOutlined />}
                >新增</Button>
            }
            width={1400}
            // 第一个输入框获取焦点
            autoFocusFirstInput={true}
            // 可以回车提交
            isKeyPressSubmit={true}
            // 不干掉null跟undefined 的数据
            omitNil={false}
            onFinish={async (values) => {
                console.log('完整表单数据2:', {
                    ...values,
                })

                const result = await productApi.create(values);
                if (result.code === 1) {
                    tableReload?.();
                    message.success(result.message)
                    formRef.current?.resetFields?.()
                    return true;
                } else {
                    message.error(result.message)
                }
            }}
        >
            <Lazyload height={50}>
                <Form1 typeAction="create" form={form}/>
            </Lazyload>
        </ModalForm>
    </>;
};
