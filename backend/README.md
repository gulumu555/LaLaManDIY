# LaLaManDIY 小程序后端服务

这是 LaLaManDIY 微信小程序的后端服务，提供图片处理、风格转换、动效生成和打印订单等 API 服务。

## 功能特点

- **图片上传**：支持图片上传并返回可访问的 URL
- **风格转换**：将照片转换为多种艺术风格
- **动效处理**：为照片添加动态效果，生成 GIF
- **打印服务**：提供照片打印订单处理
- **MCP 架构**：Model Control Panel 设计，可轻松切换不同的 AI 模型提供商

## 目录结构

```
backend/
├── src/                  # 源代码目录
│   ├── app.js            # 应用入口
│   ├── controllers/      # 控制器（业务逻辑）
│   ├── routes/           # 路由定义
│   ├── models/           # 数据模型（目前使用内存存储）
│   ├── services/         # 服务层
│   │   ├── mcp/          # 模型控制面板
│   │   │   ├── providers/  # 不同的 AI 服务提供商
│   │   │   └── adapters/   # 适配器
│   │   └── storage/      # 存储服务
│   ├── config/           # 配置文件
│   └── utils/            # 工具函数
├── uploads/              # 上传文件存储目录
├── logs/                 # 日志文件目录
├── .env.example          # 环境变量示例
└── package.json          # 项目依赖
```

## 安装步骤

1. **安装 Node.js**

   如果您尚未安装 Node.js，请从官方网站下载并安装：https://nodejs.org/

2. **克隆项目并安装依赖**

   ```bash
   # 进入项目目录
   cd /Users/lalanman/Desktop/LaLaMan/windsurf/20250425/backend
   
   # 安装依赖
   npm install
   ```

3. **配置环境变量**

   ```bash
   # 复制环境变量示例文件
   cp .env.example .env
   
   # 编辑 .env 文件，根据需要修改配置
   ```

4. **启动服务**

   ```bash
   # 开发模式启动（带自动重载）
   npm run dev
   
   # 或生产模式启动
   npm start
   ```

## API 接口说明

### 健康检查

- `GET /api/health` - 检查服务健康状态

### 图片上传

- `POST /api/upload` - 上传图片
  - 请求体：`multipart/form-data` 格式，字段名 `image`
  - 返回：图片 URL 和 ID

### 风格转换

- `GET /api/style/categories` - 获取风格分类列表
- `GET /api/style/category/:categoryId` - 获取指定分类下的风格列表
- `POST /api/style/apply` - 应用风格转换
  - 请求体：`{ "imageUrl": "图片URL", "styleId": "风格ID" }`

### 动效处理

- `GET /api/effect/list` - 获取可用动效列表
- `POST /api/effect/apply` - 应用动效处理
  - 请求体：`{ "imageUrl": "图片URL", "effectType": "动效类型", "params": {} }`

### 打印服务

- `GET /api/print/products` - 获取打印产品列表
- `POST /api/print/order` - 创建打印订单
  - 请求体：`{ "imageUrl": "图片URL", "productType": "poster", "size": "40x60cm", "quantity": 1, "addressInfo": {} }`
- `GET /api/print/order/:orderId` - 获取订单详情
- `GET /api/print/orders?userId=xxx` - 获取用户订单列表

## 开发说明

### 模型控制面板 (MCP)

MCP 是一个核心设计，允许我们轻松切换不同的 AI 模型提供商：

1. 在 `.env` 文件中设置 `MCP_PROVIDER` 为需要的提供商（如 `mock`, `tencent` 等）
2. 所有 API 调用都会自动路由到指定的提供商
3. 如需添加新提供商，只需在 `src/services/mcp/providers/` 目录下创建新文件

### 存储服务

目前支持两种存储方式：

1. **本地存储**：文件保存在 `uploads/` 目录
2. **腾讯云存储**：需配置腾讯云 COS 密钥（待实现）

## 注意事项

- 当前版本使用内存存储模拟数据库，重启服务后数据会丢失
- 生产环境应配置真实的数据库和云存储
- API 密钥等敏感信息应通过环境变量配置，不要硬编码

## 后续计划

- 接入真实的 AI 服务（如腾讯云 AI、百度 AI 等）
- 添加用户认证和鉴权
- 实现数据持久化存储
- 添加更多风格和动效选项

## 问题排查

如遇到问题，请检查：

1. Node.js 版本是否兼容（推荐 v14 以上）
2. 环境变量是否正确配置
3. 查看 `logs/` 目录下的日志文件

如有其他问题，请联系开发团队。
