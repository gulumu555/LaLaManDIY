import { useRef, useState, lazy } from 'react';
import {
    ModalForm,
} from '@ant-design/pro-components';
import { photoStyleApi } from '@/api/photoStyle';
import { App } from 'antd';
import { useUpdateEffect } from 'ahooks';
import Lazyload from '@/component/lazyLoad/index';

const Form1 = lazy(() => import('./../component/form1'));

/**
 * 风格样例 修改
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
            name="updatePhotoStyle"
            formRef={formRef}
            open={open}
            onOpenChange={(_boolean) => {
                setOpen(_boolean);
                // 关闭的时候干掉updateId，不然无法重复修改同一条数据
                if (_boolean === false) {
                    setUpdateId(0);
                }
            }}
            title="修改二级风格"
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
                const result = await photoStyleApi.findData(params);
                if (result.code === 1) {
                    const data = result.data;
                    // 确保 reference_images 是数组格式供 UploadImgMultiple 使用
                    if (data.reference_images && typeof data.reference_images === 'string') {
                        try {
                            data.reference_images = JSON.parse(data.reference_images);
                        } catch (e) {
                            data.reference_images = [];
                        }
                    }
                    if (!Array.isArray(data.reference_images)) {
                        data.reference_images = [];
                    }
                    console.log('Loaded reference_images:', data.reference_images);
                    return data;
                } else {
                    message.error(result.message);
                    setOpen(false);
                }
            }}
            onFinish={async (values) => {
                // 确保 reference_images 是数组格式
                const submitData = { ...values, id: updateId };
                if (submitData.reference_images && !Array.isArray(submitData.reference_images)) {
                    submitData.reference_images = [];
                }
                console.log('Submitting reference_images:', submitData.reference_images);

                const result = await photoStyleApi.update(submitData);
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
                <Form1 typeAction='update' />
            </Lazyload>
        </ModalForm>
    </>;
};
