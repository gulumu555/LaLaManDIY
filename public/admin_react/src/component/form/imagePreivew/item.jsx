import { Card, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import './item.css'

export default ({ data, preview }) => {
  return (
    <Card
      key={data.uid}
      size="small"
      styles={{ body: { padding: 8 } }}
      className="preview-img"
    >
      <div className="bg">
        <img src={data.url} />
        <div className="hover">
          <div>
            <Button type="text" size="small" onClick={preview}>
              <EyeOutlined className="icon" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
