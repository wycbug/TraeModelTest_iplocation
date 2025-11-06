# IP地理位置查询系统

基于Cloudflare Workers和React构建的高精度IP地理位置查询系统，支持IPv4和IPv6地址查询，提供现代化的Web界面和丰富的功能特性。

## 功能特性

- 🌍 **高精度定位**: 支持IPv4和IPv6地址的精确地理位置查询
- 📊 **批量查询**: 支持多个IP地址的批量查询和结果导出
- 🗺️ **地图可视化**: 在地图上显示IP地址的地理位置
- 📈 **统计分析**: 提供查询结果的统计分析和可视化图表
- 📝 **查询历史**: 保存和管理查询历史记录
- 💾 **数据导出**: 支持JSON和CSV格式的数据导出
- 🎨 **现代化UI**: 响应式设计，支持移动端和桌面端
- ⚡ **高性能**: 基于Cloudflare Workers的全球分布式架构

## 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **CSS3** - 现代化样式设计

### 后端
- **Cloudflare Workers** - 无服务器计算平台
- **TypeScript** - 类型安全的开发体验
- **KV Storage** - 数据持久化存储

### API集成
- **PearkTrue API** - 高精度IP地理位置数据源

## 项目结构

```
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── MapComponent.tsx    # 单个IP地图组件
│   │   ├── BatchMap.tsx        # 批量IP地图组件
│   │   ├── Statistics.tsx      # 统计分析组件
│   │   └── QueryHistory.tsx    # 查询历史组件
│   ├── App.tsx             # 主应用组件
│   ├── App.css             # 应用样式
│   └── main.tsx            # 应用入口
├── worker/
│   └── index.ts            # Cloudflare Worker代码
├── package.json            # 项目依赖
├── wrangler.jsonc          # Cloudflare Workers配置
└── README.md               # 项目文档
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Cloudflare账户（用于部署Worker）

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd iplocation
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **启动Worker开发服务器**
   ```bash
   npm run dev:worker
   ```

### 部署到Cloudflare

1. **登录Cloudflare**
   ```bash
   npx wrangler login
   ```

2. **部署Worker**
   ```bash
   npm run deploy
   ```

## API文档

详细的API文档请参考 [apidoc.md](./apidoc.md)

### 主要API端点

- `GET /api/ip-location` - 单个IP位置查询
- `GET /api/client-ip` - 获取客户端IP
- `POST /api/batch-location` - 批量IP位置查询

## 使用说明

### 单个IP查询
1. 在输入框中输入IP地址（IPv4或IPv6）
2. 点击"查询位置"按钮
3. 查看详细的地理位置信息和地图位置
4. 可导出查询结果为JSON格式

### 批量IP查询
1. 切换到"批量查询"标签页
2. 在文本框中输入多个IP地址，每行一个
3. 点击"批量查询"按钮
4. 查看表格形式的查询结果
5. 可导出结果为JSON或CSV格式
6. 在地图上查看所有IP的位置分布

### 统计分析
1. 切换到"统计分析"标签页
2. 查看查询结果的统计图表
3. 包括地理分布、时区分布等可视化数据

### 查询历史
1. 在"统计分析"标签页中查看查询历史
2. 支持删除单条历史记录
3. 历史数据保存在本地存储中

## 配置说明

### Cloudflare Workers配置

在 `wrangler.jsonc` 中配置：
- Worker名称和路由
- KV命名空间绑定
- 环境变量设置

### 环境变量

- `IP_LOCATION_KV` - KV命名空间，用于存储查询历史和统计数据

## 性能特性

- **全球分布式**: 基于Cloudflare全球网络
- **低延迟**: 边缘计算，就近响应
- **高可用**: 99.9%+ 的可用性保证
- **自动扩展**: 无需手动扩容
- **速率限制**: 内置API速率限制保护

## 安全特性

- **CORS支持**: 跨域资源共享配置
- **速率限制**: 防止API滥用
- **输入验证**: IP地址格式验证
- **错误处理**: 完善的错误处理机制

## 开发指南

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/App.tsx` 中集成组件
3. 在 `worker/index.ts` 中添加相应的API端点
4. 更新类型定义和样式

### 自定义样式

- 修改 `src/App.css` 来调整界面样式
- 使用CSS变量进行主题定制
- 响应式设计已内置支持

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 支持

如有问题，请通过以下方式联系：
- 提交GitHub Issue
- 查看项目文档
- 联系项目维护者
