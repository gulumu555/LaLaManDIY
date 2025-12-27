import { useRef, lazy } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import { withdrawOrderApi } from '@/api/withdrawOrder';
import { Button, App } from 'antd';
import { authCheck } from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';

const Form1 = lazy(() => import('./../component/form1'));

/**
 * 提现记录 新增
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ tableReload, ...props }) => {
    const formRef = useRef();
    const { message } = App.useApp();
    return <>
        <ModalForm
            name="createWithdrawOrder"
            formRef={formRef}
            title="添加提现记录"
            trigger={
                <Button 
                    type="primary" 
                    disabled={authCheck('withdrawOrderCreate')} 
                    icon={<PlusOutlined />}
                >添加提现记录</Button>
            }
            width={800}
            // 第一个输入框获取焦点
            autoFocusFirstInput={true}
            // 可以回车提交
            isKeyPressSubmit={true}
            // 不干掉null跟undefined 的数据
            omitNil={false}
            onFinish={async (values) => {
                const result = await withdrawOrderApi.create(values);
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
                <Form1 typeAction="create" />
            </Lazyload>
        </ModalForm>
    </>;
};