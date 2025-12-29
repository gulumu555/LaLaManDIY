import { useRef, lazy } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import { seedDreamStyleApi } from '@/api/seedDreamStyle';
import { Button, App } from 'antd';
import { authCheck } from '@/common/function';
import Lazyload from '@/component/lazyLoad/index';

const Form1 = lazy(() => import('./../component/form1'));

/**
 * Seedream AI 风格 新增
 *
 * @author LaLaMan
 */
export default ({ tableReload, ...props }) => {
    const formRef = useRef();
    const { message } = App.useApp();

    return <>
        <ModalForm
            name="createSeedDreamStyle"
            formRef={formRef}
            title="添加 AI 风格"
            trigger={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                >添加风格</Button>
            }
            width={700}
            autoFocusFirstInput={true}
            isKeyPressSubmit={true}
            omitNil={false}
            modalProps={{
                destroyOnClose: true,
            }}
            onFinish={async (values) => {
                // 处理图片上传数据
                if (values.cover_image && Array.isArray(values.cover_image)) {
                    values.cover_image = values.cover_image[0]?.response?.data?.url || values.cover_image[0]?.url || '';
                }
                if (values.reference_images && Array.isArray(values.reference_images)) {
                    values.reference_images = values.reference_images.map(item =>
                        item?.response?.data?.url || item?.url || ''
                    ).filter(url => url);
                }

                const result = await seedDreamStyleApi.create(values);
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
            <Lazyload height={300}>
                <Form1 typeAction="create" />
            </Lazyload>
        </ModalForm>
    </>;
};
