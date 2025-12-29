import { ProFormText, ProFormTextArea, ProFormSelect, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
import { Form, Upload, Button, Space, message as antMessage } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { config } from '@/common/config';
import { useState } from 'react';

/**
 * Seedream AI 风格 表单字段
 *
 * @author LaLaMan
 */
export default ({ typeAction, initialValues = {}, ...props }) => {
    const getToken = () => localStorage.getItem('token') || '';

    // 上传配置
    const uploadProps = {
        action: config.apiUrl + '/admin/File/upload',
        headers: {
            'X-Token': getToken(),
        },
        listType: 'picture-card',
        accept: 'image/*',
    };

    return <>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 基本信息 */}
            <ProFormText
                name="key"
                label="风格标识"
                placeholder="如: ghibli_watercolor (只能是字母、数字、下划线)"
                rules={[
                    { required: true, message: '请输入风格标识' },
                    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '只能是字母开头，包含字母、数字、下划线' },
                ]}
                disabled={typeAction === 'update'}
                tooltip="唯一标识，创建后不可修改"
            />

            <ProFormText
                name="name"
                label="风格名称"
                placeholder="如: 吉卜力水彩"
                rules={[{ required: true, message: '请输入风格名称' }]}
            />

            <ProFormSelect
                name="category"
                label="分类"
                initialValue="anime"
                options={[
                    { label: '动漫', value: 'anime' },
                    { label: '绘画', value: 'painting' },
                    { label: '混合', value: 'mixed' },
                    { label: '通用', value: 'general' },
                ]}
                rules={[{ required: true, message: '请选择分类' }]}
            />

            {/* 模型选择 */}
            <ProFormSelect
                name="model"
                label="AI模型"
                initialValue="seedream_4_5"
                tooltip="选择用于生成图片的AI模型"
                options={[
                    { label: 'Seedream 4.5 (推荐)', value: 'seedream_4_5' },
                    { label: 'Seedream 4.0', value: 'seedream_4_0' },
                    { label: 'Seedream 3.0 (旧版)', value: 'seedream_3_0' },
                    { label: 'FLUX 1.1', value: 'flux_1_1' },
                    { label: 'Stable Diffusion XL', value: 'sdxl' },
                ]}
                rules={[{ required: true, message: '请选择模型' }]}
            />

            {/* 生成参数 */}
            <Space size="large">
                <ProFormDigit
                    name="style_strength"
                    label="风格强度"
                    initialValue={0.7}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip="参考图影响程度 (0.1-1.0)"
                    width="sm"
                />
                <ProFormDigit
                    name="identity_strength"
                    label="身份保持强度"
                    initialValue={0.8}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip="照片相似度 (0.1-1.0)"
                    width="sm"
                />
            </Space>

            <ProFormTextArea
                name="prompt"
                label="风格提示词"
                placeholder="英文提示词，描述风格特点，如: Studio Ghibli watercolor style, soft colors..."
                rules={[{ required: true, message: '请输入提示词' }]}
                fieldProps={{
                    rows: 4,
                    showCount: true,
                    maxLength: 1000,
                }}
            />

            {/* 封面图上传 */}
            <Form.Item
                name="cover_image"
                label="封面图 (前端展示)"
                tooltip="用于小程序风格选择列表展示，建议正方形"
                rules={[{ required: true, message: '请上传封面图' }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList || e}
            >
                <Upload
                    {...uploadProps}
                    maxCount={1}
                    defaultFileList={initialValues.cover_image}
                >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传封面</div>
                    </div>
                </Upload>
            </Form.Item>

            {/* 参考图上传 */}
            <Form.Item
                name="reference_images"
                label="参考图 (AI生成用)"
                tooltip="3-4张风格参考图，AI会参考这些图片的风格进行生成"
                rules={[{ required: true, message: '请上传至少1张参考图' }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList || e}
            >
                <Upload
                    {...uploadProps}
                    maxCount={5}
                    multiple
                    defaultFileList={initialValues.reference_images}
                >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传参考图 (最多5张)</div>
                    </div>
                </Upload>
            </Form.Item>

            {/* 其他设置 */}
            <ProFormTextArea
                name="description"
                label="风格描述"
                placeholder="对用户展示的风格描述 (可选)"
                fieldProps={{
                    rows: 2,
                }}
            />

            <Space size="large">
                <ProFormDigit
                    name="sort"
                    label="排序"
                    initialValue={0}
                    min={0}
                    max={9999}
                    tooltip="越大越靠前"
                    width="sm"
                />

                <ProFormSwitch
                    name="is_active"
                    label="启用"
                    initialValue={true}
                    checkedChildren="是"
                    unCheckedChildren="否"
                />

                <ProFormSwitch
                    name="is_new"
                    label="新品标签"
                    initialValue={false}
                    checkedChildren="是"
                    unCheckedChildren="否"
                />
            </Space>
        </Space>
    </>;
};
