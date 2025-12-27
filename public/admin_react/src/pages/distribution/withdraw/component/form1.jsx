import { lazy } from 'react';
import { ProForm, ProFormText, ProFormTextArea, ProFormRadio, } from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import { arrayToTree } from '@/common/function';

/**
 * 提现记录 添加修改的form字段
 *
 * @param {string} typeAction create》添加，update》修改
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 * */
export default ({typeAction, ...props}) => {

    return <>
        <Row gutter={[24, 0]}>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="amount"
                    label="提现金额"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                    disabled={true}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="wx_id"
                    label="提现账号"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                    disabled={true}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormRadio.Group
                    name="status"
                    label="提现状态"
                    placeholder="请选择"
                    options={[
                        { label: '通过', value: 1},
                        { label: '拒绝', value: 2},
                    ]}
                    rules={[
                        { required: true, message: '请选择' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormTextArea
                    name="remark"
                    label="备注"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
        </Row>
    </>
}
