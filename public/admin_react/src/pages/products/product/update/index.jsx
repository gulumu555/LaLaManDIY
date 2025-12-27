import {useRef, useState, lazy, useEffect} from 'react';
import {
    ModalForm,
} from '@ant-design/pro-components';
import { productApi } from '@/api/product';
import { App } from 'antd';
import { useUpdateEffect } from 'ahooks';
import Lazyload from '@/component/lazyLoad/index';

const Form1 = lazy(() => import('./../component/form1'));

/**
 * 产品管理 修改
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ tableReload, updateId, setUpdateId, ...props }) => {
    const formRef = useRef();
    const { message } = App.useApp();
    const [open, setOpen] = useState(false);
    const [specForm, setSpecForm] = useState([]);

    useUpdateEffect(() => {
        if (updateId > 0) {
            setOpen(true);
        }
    }, [updateId])

    return <>
        <ModalForm
            name="updateProduct"
            formRef={formRef}
            open={open}
            onOpenChange={(_boolean) => {
                setOpen(_boolean);
                // 关闭的时候干掉updateId，不然无法重复修改同一条数据
                if (_boolean === false) {
                    setUpdateId(0);
                }
            }}
            title="修改产品管理"
            width={1400}
            // 第一个输入框获取焦点
            autoFocusFirstInput={true}
            // 可以回车提交
            isKeyPressSubmit={true}
            // 不干掉null跟undefined 的数据
            omitNil={false}
            modalProps={{
                destroyOnClose: true,
            }}
            params={{
                id: updateId
            }}
            request={async (params) => {
                const result = await productApi.findData(params);
                if (result.code === 1) {
                    setSpecForm(result.data.product_spec);
                    return result.data;
                } else {
                    message.error(result.message);
                    setOpen(false);
                }
            }}
            onFinish={async (values) => {
                const result = await productApi.update({
                    id: updateId,
                    ...values
                });
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
                <Form1 typeAction='update' form={formRef.current} specForm={specForm}/>
            </Lazyload>
        </ModalForm>
    </>;
};
