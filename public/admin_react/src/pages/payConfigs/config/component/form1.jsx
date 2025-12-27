import { lazy } from 'react';
import { ProForm, ProFormText, ProFormDigit, ProFormSwitch, } from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import { arrayToTree } from '@/common/function';

/**
 * 支付配置 添加修改的form字段
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
                    name="title"
                    label="套餐名称"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="desc"
                    label="副标题"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="price"
                    label="购买价格（元）"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="show_price"
                    label="原价（元）"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="count"
                    label="生效次数"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormText
                    name="tip"
                    label="标签"
                    placeholder="请输入"
                    rules={[
                        //{ required: true, message: '请输入' },
                    ]}
                />
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
                        //{ required: true, message: '请输入' },
                    ]}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <ProFormSwitch
                    name="status"
                    label="状态"
                    extra=""
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                />
            </Col>
        </Row>
    </>
}
