# EdgeOne Pages API 路由修复说明

## 问题描述

在 EdgeOne Pages 部署后，构建正常但所有 API 路由返回 500 错误：
- 错误码：`INTERNAL_NODE_FUNCTION_ERROR`
- 所有 API 端点都无法正常工作

## 问题原因

根据 [EdgeOne Pages 文档](https://pages.edgeone.ai/zh/document/project-management)，Next.js API 路由在 EdgeOne Pages 上需要明确指定 runtime 类型。如果 API 路由使用了 Node.js 特定功能（如文件系统操作、`process.*` 等），必须明确声明使用 Node.js runtime。

## 修复方案

### 1. 为所有 API 路由添加 runtime 配置

在所有 API 路由文件中添加：
```typescript
// 明确指定使用 Node.js runtime（EdgeOne Pages 需要）
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

**已修复的文件：**
- ✅ 所有 `app/api/**/route.ts` 文件（共 32 个文件）

### 2. 创建 edgeone.json 配置文件

在项目根目录创建 `edgeone.json`，配置 EdgeOne Pages 的构建和部署设置：

```json
{
  "buildCommand": "npm install && npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "nodeVersion": "20.x",
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, x-admin-token, x-course-cookie"
        }
      ]
    }
  ]
}
```

### 3. 配置说明

#### buildCommand
- 构建命令，EdgeOne Pages 会在部署时执行
- 使用 `npm install && npm run build` 确保依赖安装和构建

#### outputDirectory
- Next.js 构建输出目录
- 设置为 `.next`（Next.js 默认输出目录）

#### nodeVersion
- Node.js 版本
- 设置为 `20.x` 以匹配项目依赖

#### headers
- 为 API 路由添加 CORS 头
- 允许跨域访问（用于 APK 访问）

## 验证修复

1. **提交代码到 Git 仓库**
   ```bash
   git add .
   git commit -m "Fix: Add runtime config for EdgeOne Pages API routes"
   git push
   ```

2. **在 EdgeOne Pages 控制台重新部署**
   - 进入项目设置
   - 点击"重新部署"
   - 等待构建完成

3. **测试 API 端点**
   - 访问 `/api/health` 应该返回健康检查信息
   - 其他 API 端点应该正常工作

## 注意事项

### 文件系统操作

如果 API 路由使用了文件系统操作（如 `fs/promises`），确保：
1. ✅ 已添加 `export const runtime = 'nodejs'`
2. ✅ 已配置 COS 存储（可选，用于持久化数据）
3. ✅ 数据目录可写（EdgeOne Pages 的文件系统可能有限制）

### 环境变量

确保在 EdgeOne Pages 项目设置中配置了所有必要的环境变量：
- `ADMIN_SECRET_TOKEN` - 管理员密钥
- `COS_SECRET_ID` - 腾讯云 COS SecretId（如果使用 COS）
- `COS_SECRET_KEY` - 腾讯云 COS SecretKey（如果使用 COS）
- `COS_REGION` - COS 存储桶地域
- `COS_BUCKET` - COS 存储桶名称

## 参考文档

- [EdgeOne Pages 项目管理](https://pages.edgeone.ai/zh/document/project-management)
- [edgeone.json 配置](https://pages.edgeone.ai/zh/document/edgeone-json)
- [Next.js 框架指南](https://pages.edgeone.ai/zh/document/framework-guide/nextjs)

## 相关文件

- `edgeone.json` - EdgeOne Pages 配置文件
- `scripts/add-runtime-to-api-routes.js` - 批量添加 runtime 配置的脚本
- `app/api/**/route.ts` - 所有 API 路由文件（已添加 runtime 配置）

