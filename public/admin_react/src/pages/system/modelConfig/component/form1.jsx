import { ProFormText, ProFormTextArea, ProFormDigit, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Space, Divider } from 'antd';

/**
 * AI模型配置 表单字段
 */
export default ({ typeAction, ...props }) => {
    return <>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Divider orientation="left">基本信息</Divider>

            <ProFormText
                name="key"
                label="模型标识"
                placeholder="如: seedream_4_5 (只能是字母、数字、下划线)"
                rules={[
                    { required: true, message: '请输入模型标识' },
                    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '只能是字母开头，包含字母、数字、下划线' },
                ]}
                disabled={typeAction === 'update'}
                tooltip="唯一标识，创建后不可修改"
            />

            <ProFormText
                name="name"
                label="模型名称"
                placeholder="如: Seedream 4.5"
                rules={[{ required: true, message: '请输入模型名称' }]}
            />

            <ProFormText
                name="version"
                label="版本号"
                placeholder="如: 4.5"
            />

            <ProFormSelect
                name="provider"
                label="服务商"
                initialValue="volcengine"
                options={[
                    { label: '火山引擎', value: 'volcengine' },
                    { label: '其他', value: 'other' },
                ]}
            />

            <ProFormTextArea
                name="description"
                label="模型描述"
                placeholder="描述模型特点和用途"
                fieldProps={{ rows: 3 }}
            />

            <Divider orientation="left">配置参数</Divider>

            <ProFormText
                name="api_endpoint"
                label="API端点"
                placeholder="如: https://api.volcengine.com/seedream"
                tooltip="可选，用于自定义API地址"
            />

            <Space size="large">
                <ProFormDigit
                    name="sort"
                    label="排序"
                    initialValue={0}
                    min={0}
                    max={999}
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
                    name="is_default"
                    label="设为默认"
                    initialValue={false}
                    checkedChildren="是"
                    unCheckedChildren="否"
                    tooltip="设为默认模型，风格未指定模型时使用"
                />
            </Space>
        </Space>
    </>;
};
