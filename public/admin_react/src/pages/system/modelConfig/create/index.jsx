import { ModalForm } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { modelConfigApi } from '@/api/modelConfig';
import Form1 from '../component/form1';

/**
 * AI模型配置 新增
 */
export default ({ tableReload }) => {
    return (
        <ModalForm
            title="添加AI模型"
            trigger={
                <Button type="primary" icon={<PlusOutlined />}>
                    添加模型
                </Button>
            }
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
            }}
            width={600}
            onFinish={async (values) => {
                const res = await modelConfigApi.create(values);
                if (res.code === 1) {
                    message.success('添加成功');
                    tableReload?.();
                    return true;
                }
                message.error(res.msg || '添加失败');
                return false;
            }}
        >
            <Form1 typeAction="create" />
        </ModalForm>
    );
};
