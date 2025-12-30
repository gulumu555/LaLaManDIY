import { lazy } from 'react';
import { categoryApi } from '@/api/category';
import { ProForm, ProFormText, ProFormTextArea, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormSlider } from '@ant-design/pro-components';
import { Row, Col, Divider, Typography } from 'antd';
import { arrayToTree } from '@/common/function';
import UploadImg from '@/component/form/uploadImg/index';

const { Text } = Typography;

/**
 * 风格样例 添加修改的form字段
 * 
 * v1.3 升级：增加模型选择、参考图、生成参数
 *
 * @param {string} typeAction create》添加，update》修改
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ typeAction, ...props }) => {

    return <>
        <Row gutter={[24, 0]}>
            {/* 基本信息 */}
            <Col span={24}>
                <Divider orientation="left">基本信息</Divider>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormSelect
                    name="cate_id"
                    label="一级风格"
                    placeholder="请选择"
                    fieldProps={{
                        showSearch: true,
                        optionFilterProp: 'label',
                    }}
                    request={async () => {
                        const res = await categoryApi.getList({ pageSize: 1000, type: 2 });
                        return res.data.data.map(item => {
                            return {
                                label: item.cate_name,
                                value: item.id
                            }
                        });
                    }}
                    rules={[
                        { required: false, message: '请选择' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="style_name"
                    label="二级风格"
                    placeholder="请输入风格名称，如：吉卜力水彩"
                    rules={[
                        { required: true, message: '请输入风格名称' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormTextArea
                    name="descript"
                    label="AI提示词"
                    placeholder="请输入英文提示词，如：Studio Ghibli watercolor style, soft colors, warm lighting"
                    fieldProps={{
                        rows: 3,
                        showCount: true,
                        maxLength: 500,
                    }}
                    rules={[
                        { required: true, message: '请输入AI提示词' },
                    ]}
                />
            </Col>

            {/* 模型配置 */}
            <Col span={24}>
                <Divider orientation="left">AI模型配置</Divider>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProFormSelect
                    name="model"
                    label="AI模型"
                    placeholder="请选择模型"
                    tooltip="选择用于生成图片的AI模型"
                    request={async () => {
                        try {
                            // 动态从后台获取模型列表
                            const { modelConfigApi } = await import('@/api/modelConfig');
                            const res = await modelConfigApi.getActiveList();
                            if (res.code === 1 && res.data) {
                                return res.data.map(item => ({
                                    label: item.is_default ? `${item.name} (默认)` : item.name,
                                    value: item.key
                                }));
                            }
                        } catch (e) {
                            console.warn('获取模型列表失败，使用默认选项');
                        }
                        // 备用选项
                        return [
                            { label: 'Seedream 4.5 (默认)', value: 'seedream_4_5' },
                            { label: 'Seedream 4.0', value: 'seedream_4_0' },
                        ];
                    }}
                    rules={[
                        { required: true, message: '请选择模型' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProFormDigit
                    name="style_strength"
                    label="风格强度"
                    placeholder="0.1 - 1.0"
                    initialValue={0.7}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip="参考图对生成结果的影响程度 (0.1-1.0)"
                    fieldProps={{
                        precision: 1,
                        style: { width: '100%' },
                    }}
                />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProFormDigit
                    name="identity_strength"
                    label="身份保持强度"
                    placeholder="0.1 - 1.0"
                    initialValue={0.8}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip="照片相似度保持程度 (0.1-1.0)"
                    fieldProps={{
                        precision: 1,
                        style: { width: '100%' },
                    }}
                />
            </Col>

            {/* 图片配置 */}
            <Col span={24}>
                <Divider orientation="left">图片配置</Divider>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProForm.Item
                    name="style_img"
                    label="前端展示图 (1张)"
                    tooltip="用于小程序风格选择列表展示，建议正方形"
                    rules={[
                        { required: true, message: '请上传展示图' },
                    ]}

                >
                    <UploadImg />
                </ProForm.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProForm.Item
                    name="reference_images"
                    label="AI参考图 (3-4张)"
                    tooltip="AI生成时参考这些图片的风格，建议3-4张同风格图片"
                    rules={[
                        { required: true, message: '请上传至少1张参考图' },
                    ]}
                >
                    <UploadImg maxCount={5} multiple />
                </ProForm.Item>
            </Col>

            {/* 其他设置 */}
            <Col span={24}>
                <Divider orientation="left">其他设置</Divider>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProFormDigit
                    name="sort"
                    label="排序"
                    placeholder="请输入"
                    initialValue={0}
                    fieldProps={{
                        precision: 0,
                        style: { width: '100%' },
                    }}
                    min={0}
                    extra="数值越大，排序越靠前"
                    rules={[
                        { required: false, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProFormSwitch
                    name="status"
                    label="状态"
                    extra=""
                    checkedChildren="显示"
                    unCheckedChildren="隐藏"
                    checked={true}
                />
            </Col>
        </Row>

    </>
}

