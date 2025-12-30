import { useEffect, useState } from 'react';
import { DrawerForm } from '@ant-design/pro-components';
import { message, Spin } from 'antd';
import { modelConfigApi } from '@/api/modelConfig';
import Form1 from '../component/form1';

/**
 * AI模型配置 修改
 */
export default ({ id, open, onClose, tableReload }) => {
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {
        if (open && id) {
            setLoading(true);
            modelConfigApi.findData({ id }).then(res => {
                if (res.code === 1) {
                    setInitialValues(res.data);
                }
                setLoading(false);
            });
        }
    }, [open, id]);

    return (
        <DrawerForm
            title="修改AI模型配置"
            open={open}
            drawerProps={{
                destroyOnClose: true,
                onClose: onClose,
            }}
            width={600}
            initialValues={initialValues}
            onFinish={async (values) => {
                const res = await modelConfigApi.update({ ...values, id });
                if (res.code === 1) {
                    message.success('修改成功');
                    tableReload?.();
                    onClose?.();
                    return true;
                }
                message.error(res.msg || '修改失败');
                return false;
            }}
        >
            {loading ? <Spin /> : <Form1 typeAction="update" initialValues={initialValues} />}
        </DrawerForm>
    );
};
