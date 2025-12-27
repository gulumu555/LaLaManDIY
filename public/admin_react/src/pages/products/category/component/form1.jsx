import { lazy } from 'react';
import { ProForm, ProFormText, ProFormDigit, ProFormSwitch, } from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import { arrayToTree } from '@/common/function';
import UploadImg from '@/component/form/uploadImg/index';

/**
 * 分类管理 添加修改的form字段
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
                    name="cate_name"
                    label="产品类型"
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
                  checkedChildren="显示"
                  unCheckedChildren="隐藏"
                  checked={true}
                />
            </Col>
        </Row>
    </>
}
