import { useRef, lazy, useEffect, useState } from 'react';
import { ModalForm } from '@ant-design/pro-components';
import { seedDreamStyleApi } from '@/api/seedDreamStyle';
import { App, Spin } from 'antd';
import Lazyload from '@/component/lazyLoad/index';

const Form1 = lazy(() => import('./../component/form1'));

/**
 * Seedream AI 风格 编辑
 *
 * @author LaLaMan
 */
export default ({ tableReload, updateId, setUpdateId, ...props }) => {
    const formRef = useRef();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({});

    // 加载详情数据
    useEffect(() => {
        if (updateId > 0) {
            setLoading(true);
            seedDreamStyleApi.findData({ id: updateId }).then(res => {
                if (res.code === 1 && res.data) {
                    const data = res.data;
                    // 转换图片格式用于Upload组件
                    if (data.cover_image) {
                        data.cover_image = [{
                            uid: '-1',
                            name: 'cover.png',
                            status: 'done',
                            url: data.cover_image,
                        }];
                    }
                    if (data.reference_images && Array.isArray(data.reference_images)) {
                        data.reference_images = data.reference_images.map((url, index) => ({
                            uid: `-${index + 2}`,
                            name: `ref_${index}.png`,
                            status: 'done',
                            url: url,
                        }));
                    }
                    setInitialValues(data);
                    formRef.current?.setFieldsValue?.(data);
                }
            }).finally(() => setLoading(false));
        }
    }, [updateId]);

    return <>
        <ModalForm
            name="updateSeedDreamStyle"
            formRef={formRef}
            title="编辑 AI 风格"
            open={updateId > 0}
            width={700}
            autoFocusFirstInput={true}
            isKeyPressSubmit={true}
            omitNil={false}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => setUpdateId(0),
            }}
            onFinish={async (values) => {
                values.id = updateId;

                // 处理图片上传数据
                if (values.cover_image && Array.isArray(values.cover_image)) {
                    values.cover_image = values.cover_image[0]?.response?.data?.url || values.cover_image[0]?.url || '';
                }
                if (values.reference_images && Array.isArray(values.reference_images)) {
                    values.reference_images = values.reference_images.map(item =>
                        item?.response?.data?.url || item?.url || ''
                    ).filter(url => url);
                }

                const result = await seedDreamStyleApi.update(values);
                if (result.code === 1) {
                    tableReload?.();
                    message.success(result.message)
                    setUpdateId(0);
                    return true;
                } else {
                    message.error(result.message)
                }
            }}
        >
            <Spin spinning={loading}>
                <Lazyload height={300}>
                    <Form1 typeAction="update" initialValues={initialValues} />
                </Lazyload>
            </Spin>
        </ModalForm>
    </>;
};
