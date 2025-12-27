import { useRef, lazy, useState} from 'react';
import { PlusOutlined, EditOutlined} from '@ant-design/icons';
import {
    ModalForm, ProForm,
    } from '@ant-design/pro-components';
import { ordersApi } from '@/api/orders';
import { Button, App, Row, Col } from 'antd';
import { authCheck } from '@/common/function';
import { useUpdateEffect } from 'ahooks';
import Lazyload from '@/component/lazyLoad/index';

/**
 * 打印订单 修改
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ tableReload, updateId, setUpdateId, ...props }) => {
    const formRef = useRef();
    const { message } = App.useApp();
    const [open, setOpen] = useState(false);

    useUpdateEffect(() => {
        if (updateId > 0) {
            setOpen(true);
        }
    }, [updateId])

    return <>
        <ModalForm
            name="updateOrders"
            formRef={formRef}
            open={open}
            onOpenChange={(_boolean) => {
                setOpen(_boolean);
                // 关闭的时候干掉updateId，不然无法重复修改同一条数据
                if (_boolean === false) {
                    setUpdateId(0);
                }
            }}
            title="查看物流"
            //trigger={
            //    <Button 
            //        //type="primary" 
            //        type="link"
            //        size="small"
            //        disabled={authCheck('0')} 
            //        icon={<EditOutlined />}
            //    >查看物流</Button>
            //}
            width={400}
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
                const result = await ordersApi.findData(params);
                if (result.code === 1) {
                    return result.data;
                } else {
                    message.error(result.message);
                    setOpen(false);
                }
            }}
            onFinish={async (values) => {
                const result = await ordersApi.viewlogistics({
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
            <Row gutter={[24, 0]}>
            
            </Row>
        </ModalForm>
    </>;
};