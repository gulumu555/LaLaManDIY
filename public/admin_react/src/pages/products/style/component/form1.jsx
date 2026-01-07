import { lazy, useState, useEffect } from 'react';
import { categoryApi } from '@/api/category';
import { modelConfigApi } from '@/api/modelConfig';
import { ProForm, ProFormText, ProFormTextArea, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormDependency } from '@ant-design/pro-components';
import { Row, Col, Divider, Typography } from 'antd';
import { arrayToTree } from '@/common/function';
import UploadImg from '@/component/form/uploadImg/index';
import UploadImgMultiple from '@/component/form/uploadImgMultiple/index';

const { Text } = Typography;

/**
 * 一级风格 → 二级风格 映射表
 * 根据一级风格名称过滤对应的二级风格选项
 */
const STYLE_MAPPING = {
    '游戏': ['魔兽世界', '原神', '塞尔达传说'],
    '动漫': ['吉卜力', '新海诚', '吉卜力水彩', '迪士尼', '皮克斯', '莫比斯（复古漫画）', '赛璐璐'],
    '插画': ['几米', '第九朵云'],
    '艺术': ['油画', '印象派', '水彩', '素描', '国风', '波谱', '像素'],
    '3D': ['桌面手办', '毛绒玩偶', '粘土玩偶'],
    // 兼容旧数据
    '其他': ['桌面手办', '毛绒玩偶', '粘土玩偶'],
};

/**
 * 风格样例 添加修改的form字段
 * 
 * v1.3 升级：增加模型选择、参考图、生成参数
 * v1.3.1: 添加一级/二级风格关联约束
 *
 * @param {string} typeAction create》添加，update》修改
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({ typeAction, ...props }) => {
    // 存储一级风格列表 (id -> name 映射)
    const [categoryMap, setCategoryMap] = useState({});

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
                    placeholder="请选择一级风格"
                    fieldProps={{
                        showSearch: true,
                        optionFilterProp: 'label',
                    }}
                    request={async () => {
                        const res = await categoryApi.getList({ pageSize: 1000, type: 2 });
                        const list = res.data.data.map(item => ({
                            label: item.cate_name,
                            value: item.id
                        }));
                        // 构建 id -> name 映射
                        const map = {};
                        res.data.data.forEach(item => {
                            map[item.id] = item.cate_name;
                        });
                        setCategoryMap(map);
                        return list;
                    }}
                    rules={[
                        { required: true, message: '请选择一级风格' },
                    ]}
                />
            </Col>

            {/* 二级风格：根据一级风格动态过滤 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormDependency name={['cate_id']}>
                    {({ cate_id }) => {
                        // 获取一级风格名称
                        const cateName = categoryMap[cate_id] || '';
                        // 获取对应的二级风格列表
                        const styleOptions = (STYLE_MAPPING[cateName] || []).map(name => ({
                            label: name,
                            value: name
                        }));

                        return (
                            <ProFormSelect
                                name="style_name"
                                label="二级风格"
                                placeholder={cate_id ? "请选择二级风格" : "请先选择一级风格"}
                                disabled={!cate_id}
                                options={styleOptions}
                                rules={[
                                    { required: true, message: '请选择二级风格' },
                                ]}
                                fieldProps={{
                                    showSearch: true,
                                    optionFilterProp: 'label',
                                }}
                            />
                        );
                    }}
                </ProFormDependency>
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
                    name="style_type"
                    label="风格类型"
                    placeholder="请选择风格类型"
                    tooltip="知名风格：模型已训练，只需提示词；定制风格：需要参考图教模型"
                    initialValue={1}
                    options={[
                        { label: '知名风格（吉卜力、迪士尼等）', value: 1 },
                        { label: '定制风格（需参考图）', value: 2 },
                    ]}
                    rules={[
                        { required: true, message: '请选择风格类型' },
                    ]}
                />
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <ProFormSelect
                    name="model"
                    label="AI模型"
                    placeholder="请选择模型"
                    tooltip="选择用于生成图片的AI模型"
                    initialValue="seedream_4_5"
                    options={[
                        { label: 'Seedream 4.5 (默认)', value: 'seedream_4_5' },
                        { label: 'Seedream 4.0', value: 'seedream_4_0' },
                    ]}
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
                    <UploadImgMultiple maxCount={5} />
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

