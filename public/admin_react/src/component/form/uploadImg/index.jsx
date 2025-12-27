import {useState} from 'react';
import {Card, Button, Upload, App, Image, Typography} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {config} from '@/common/config';
import {getToken} from '@/common/function';
import ImgCrop from 'antd-img-crop';
import {fileApi} from '@/api/file';
import './index.css';

/**
 * 上传图片
 * @param {String} value 默认值
 * @param {fun} onChange 修改value事件
 * @param {Number} width 图片裁剪宽度
 * @param {Number} height 图片裁剪高度
 * @param {compontent} UploadButton 自定义上传按钮，如果传此值，那么就是一个单纯的上传，不会显示提示语、上传后的效果等
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 */
export default ({value, onChange, width = 0, height = 0, UploadButton = null, ...props}) => {
  const {message} = App.useApp();

  /////////////////////图片上传修改后////////////////////
  const [uploadLoading, setUploadLoading] = useState(false);
  const imgChange = info => {
    // 只是单纯的上传的时候才有
    if (info.file.status === "uploading" && UploadButton) {
      message.open({
        type: 'loading',
        content: '正在上传...',
        duration: 0,
        key: 'upload'
      });
    }
    if (info.file.status !== "uploading" && UploadButton) {
      message.destroy('upload');
    }

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
        onChange(info.file.response.data.img);
      } else {
        message.error('后端上传图片失败~')
      }
      setUploadLoading(false);
    }
  }

  /////////////////////////删除图片//////////////////
  const remove = () => {
    onChange('');
  }

  /////////////////////////预览图片开关/////////////
  const [previewVisible, setPreviewVisible] = useState(false);
  const previewVisibleChange = () => {
    setPreviewVisible(!previewVisible);
  }

  /////////////////////////上传前验证////////////////////
  const beforeUpload = file => {
    // 检查是否为图片类型（所有以 image/ 开头的 MIME 类型）
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片~');
      setUploadLoading(false);
      return false;
    }
    if (file.size / 1024 / 1024 > config.uploadImgMax) {
      message.error(`图片太大，请控制在 ${config.uploadImgMax}M 以内~`);
      setUploadLoading(false);
      return false;
    }
    // 添加返回 true，允许上传
    return true;
  };

  return (
    <>
      {value ? <>
        <Card
          className="uploaddan-img"
          size="small"
          styles={{
            body: {padding: 8}
          }}
        >
          <div className="bg">
            <Image
              src={`${value}`}
              preview={{
                visible: previewVisible,
                onVisibleChange: previewVisibleChange,
              }}
            />
            <div className="hover">
              <div>
                <Button type="text" size="small" onClick={previewVisibleChange}>
                  <EyeOutlined className="icon"/>
                </Button>
                <Button type="text" size="small" onClick={remove}>
                  <DeleteOutlined className="icon"/>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </> : <>
        <ImgCrop
          rotationSlider
          quality={1}
          fillColor="rgba(0,0,0,0)"
          cropShape="rect" /*round*/
          aspect={() => {
            return width / height
          }}
          beforeCrop={() => {
            // 有宽高就不裁剪图片
            if (width <= 0 || height <= 0) {
              return false;
            }
          }}
          // 添加以下属性来禁用压缩
          //modalWidth={window.innerWidth * 0.8}
          //modalHeight={window.innerHeight * 0.8}
          resize={false}
        >
          <Upload
            accept="image/*"
            capture={null}
            name="img"
            listType={UploadButton ? 'picture' : 'picture-card'}
            showUploadList={false}
            action={fileApi.uploadUrl}
            headers={{
              token: getToken()
            }}
            data={{
              width,
              height
            }}
            onChange={imgChange}
            beforeUpload={beforeUpload}
          >
            {UploadButton ? <UploadButton/> : <>
              <div>
                {uploadLoading ? <LoadingOutlined/> : <PlusOutlined/>}
                <div className="ant-upload-text">上传</div>
              </div>
            </>}
          </Upload>
        </ImgCrop>
      </>}
      {/*{!UploadButton ? <>
                <div style={{ width: '100%' }}>
                    {width > 0 && height > 0 ? <>
                        <Typography.Text type="secondary">请上传宽高：{width}*{height}的图片</Typography.Text>
                    </> : <>
                        {width > 0 ? <>
                            <Typography.Text type="secondary">请上传宽为{width}px的图片</Typography.Text>
                        </> : <>
                            {height > 0 ? <>
                                <Typography.Text type="secondary">请上传高为{height}px的图片</Typography.Text>
                            </> : ''}
                        </>}
                    </>}
                </div>
            </> : ''}*/}
    </>
  )
}
