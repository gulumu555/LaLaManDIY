import { useState, useEffect } from 'react';
import { Card, Button, Upload, App, Image, Space } from 'antd';
import {
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { config } from '@/common/config';
import { getToken } from '@/common/function';
import { fileApi } from '@/api/file';
import './index.css';

/**
 * 多图上传组件
 * @param {Array} value 默认值 (URL数组)
 * @param {function} onChange 修改value事件
 * @param {Number} maxCount 最大上传数量，默认5
 * @author LaLaMan
 */
export default ({ value = [], onChange, maxCount = 5, ...props }) => {
    const { message } = App.useApp();
    const [uploadLoading, setUploadLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    // 确保 value 始终是数组
    const imageList = Array.isArray(value) ? value : (value ? [value] : []);

    // 图片上传成功
    const imgChange = (info) => {
        if (info.file.status === 'uploading') {
            setUploadLoading(true);
        }
        if (info.file.status === 'error') {
            const errorMessage = info.file.error?.message || info.file.response?.message || '图片限制在1M以内~';
            message.error(errorMessage);
            setUploadLoading(false);
        }
        if (info.file.status === 'done') {
            if (info.file.response.code === 1) {
                const newUrl = info.file.response.data.img;
                const newList = [...imageList, newUrl];
                onChange(newList);
            } else {
                message.error('后端上传图片失败~');
            }
            setUploadLoading(false);
        }
    };

    // 删除图片
    const remove = (index) => {
        const newList = imageList.filter((_, i) => i !== index);
        onChange(newList);
    };

    // 预览图片
    const handlePreview = (url) => {
        setPreviewImage(url);
        setPreviewVisible(true);
    };

    // 上传前验证
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片~');
            return false;
        }
        if (file.size / 1024 / 1024 > config.uploadImgMax) {
            message.error(`图片太大，请控制在 ${config.uploadImgMax}M 以内~`);
            return false;
        }
        return true;
    };

    return (
        <>
            <Space wrap size={[8, 8]}>
                {/* 已上传的图片列表 */}
                {imageList.map((url, index) => (
                    <Card
                        key={index}
                        className="uploaddan-img"
                        size="small"
                        styles={{ body: { padding: 8 } }}
                    >
                        <div className="bg">
                            <Image
                                src={url}
                                preview={false}
                                onClick={() => handlePreview(url)}
                            />
                            <div className="hover">
                                <div>
                                    <Button type="text" size="small" onClick={() => handlePreview(url)}>
                                        <EyeOutlined className="icon" />
                                    </Button>
                                    <Button type="text" size="small" onClick={() => remove(index)}>
                                        <DeleteOutlined className="icon" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* 上传按钮（未达到最大数量时显示） */}
                {imageList.length < maxCount && (
                    <Upload
                        accept="image/*"
                        capture={null}
                        name="img"
                        listType="picture-card"
                        showUploadList={false}
                        action={fileApi.uploadUrl}
                        headers={{
                            token: getToken()
                        }}
                        onChange={imgChange}
                        beforeUpload={beforeUpload}
                    >
                        <div>
                            {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
                            <div className="ant-upload-text">上传</div>
                        </div>
                    </Upload>
                )}
            </Space>

            {/* 图片预览 */}
            <Image
                style={{ display: 'none' }}
                preview={{
                    visible: previewVisible,
                    src: previewImage,
                    onVisibleChange: (visible) => setPreviewVisible(visible),
                }}
            />
        </>
    );
};
