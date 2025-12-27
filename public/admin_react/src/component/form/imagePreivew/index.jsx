import { useState } from 'react';
import { Image, Typography } from 'antd';
import Item from './item';

/**
 * 图片预览组件
 * @param {Array} value 默认值
 * @param {Number} width 图片宽度
 * @param {Number} height 图片高度
 * @param {Number} maxCount 图片最多显示张数
 */
export default ({ value = [], width = 0, height = 0, maxCount = 3 }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewCurrent, setPreviewCurrent] = useState(0);

  const previewVisibleChange = () => {
    setPreviewVisible(!previewVisible);
  }

  // 图片预览的时候
  const preview = (file, index) => {
    setPreviewCurrent(index);
    previewVisibleChange();
  }

  const showValue = value.slice(0, maxCount);

  return (
    <>
      <div style={{ width: '100%', overflow: 'hidden' }}>
        {showValue.map((item, index) => (
          <Item
            key={item}
            data={{ url: item, uid: item }}
            preview={() => preview(item, index)}
          />
        ))}
      </div>
      {/*{*/}
      {/*  width > 0 && height > 0 ? (*/}
      {/*    <Typography.Text type="secondary">显示宽高：{width}*{height}的图片，最多显示{maxCount}张图片~</Typography.Text>*/}
      {/*  ) : width > 0 ? (*/}
      {/*    <Typography.Text type="secondary">显示宽为{width}px的图片，最多显示{maxCount}张图片~</Typography.Text>*/}
      {/*  ) : height > 0 ? (*/}
      {/*    <Typography.Text type="secondary">显示高为{height}px的图片，最多显示{maxCount}张图片~</Typography.Text>*/}
      {/*  ) : (*/}
      {/*    <Typography.Text type="secondary">最多显示{maxCount}张图片~</Typography.Text>*/}
      {/*  )*/}
      {/*}*/}
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible: previewVisible,
            onVisibleChange: previewVisibleChange,
            current: previewCurrent,
            onChange: (current) => {
              setPreviewCurrent(current);
            }
          }}
        >
          {showValue.map((item) => <Image src={item} key={item} />)}
        </Image.PreviewGroup>
      </div>
    </>
  )
}
