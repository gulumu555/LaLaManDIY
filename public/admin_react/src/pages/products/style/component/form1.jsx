import { lazy } from 'react';
import { categoryApi } from '@/api/category';
import { ProForm, ProFormText, ProFormTextArea, ProFormDigit, ProFormSelect, ProFormSwitch, } from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import { arrayToTree } from '@/common/function';
import UploadImg from '@/component/form/uploadImg/index';

/**
 * 风格样例 添加修改的form字段
 *
 * @param {string} typeAction create》添加，update》修改
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({typeAction, ...props}) => {

    return <>
        <Row gutter={[24, 0]}>

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
                        const res = await categoryApi.getList({pageSize: 1000, type: 2});
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
                    placeholder="请输入"
                    rules={[
                        //{ required: false, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormTextArea
                    name="descript"
                    label="AI提示词"
                    placeholder="请输入"
                    // extra="AI提示词不能为空"
                    rules={[
                        { required: false, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <ProForm.Item
                    name="style_img"
                    label="风格样例"
                    rules={[
                        { required: false, message: '请输入' },
                    ]}

                >
                    <UploadImg />
                </ProForm.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormDigit
                    name="sort"
                    label="排序"
                    placeholder="请输入"
                    fieldProps={{
                        precision: 0,
                        style: {width: '100%'},
                    }}
                    min={0}
                    extra="数值越大，排序越靠前"
                    rules={[
                        { required: false, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
