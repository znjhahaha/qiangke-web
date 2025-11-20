# EdgeOne Pages 部署指南

## 问题说明

EdgeOne Pages 是静态网站托管服务，**不支持 Next.js 的 API 路由**（Node.js 运行时）。这意味着：

- ✅ 本地开发：`npm run dev` 可以正常使用 API 路由
- ❌ EdgeOne 部署：所有 `/api/*` 请求会返回 404，因为 API 路由无法运行

## 解决方案

需要将 API 部分部署到支持 Node.js 的平台，然后配置前端使用外部 API 服务器。

### 方案 1：使用独立的 API 服务器（推荐）

1. **部署 API 服务器**
   - 将 `mobile-api-server` 项目部署到支持 Node.js 的平台（如 Vercel、Railway、Render 等）
   - 或者使用现有的 API 服务器

2. **配置环境变量**
   
   在 EdgeOne Pages 的部署配置中，添加环境变量：
   
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com
   ```
   
   或者
   
   ```
   NEXT_PUBLIC_MOBILE_API_URL=https://your-api-server.com
   ```

3. **重新部署**
   - 重新构建并部署到 EdgeOne Pages
   - 前端会自动使用配置的外部 API 服务器

### 方案 2：使用 Vercel 等支持 Next.js 的平台

如果必须使用 Next.js API 路由，建议将整个项目部署到：
- **Vercel**（推荐，Next.js 官方平台）
- **Netlify**（支持 Next.js）
- **Railway**（支持 Node.js）
- **Render**（支持 Node.js）

这些平台都支持 Next.js 的 API 路由，无需额外配置。

## 配置步骤

### 1. 部署 API 服务器

```bash
# 进入 API 服务器目录
cd mobile-api-server

# 安装依赖
npm install

# 部署到 Vercel（示例）
vercel deploy --prod
```

### 2. 在 EdgeOne Pages 配置环境变量

1. 登录 EdgeOne 控制台
2. 进入你的 Pages 项目
3. 找到"环境变量"或"Environment Variables"设置
4. 添加以下环境变量：

   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-server.vercel.app
   ```

### 3. 重新部署

在 EdgeOne Pages 中触发重新部署，环境变量会在构建时生效。

## 验证

部署后，打开浏览器控制台，查看 API 请求：

- ✅ 如果看到请求发送到 `https://your-api-server.com/api/...`，说明配置成功
- ❌ 如果看到请求发送到 `/api/...` 且返回 404，说明环境变量未生效

## 故障排查

### 问题：仍然显示 "Cookie无效，无法获取学生信息"

**可能原因：**
1. 环境变量未正确配置
2. API 服务器未正确部署
3. CORS 配置问题

**解决方法：**
1. 检查浏览器控制台的网络请求，确认 API 请求的 URL
2. 检查 API 服务器是否正常运行（访问 `https://your-api-server.com/api/health`）
3. 检查 API 服务器的 CORS 配置

### 问题：API 请求返回 404

**可能原因：**
1. 环境变量未设置
2. API 服务器路径不正确

**解决方法：**
1. 确认环境变量 `NEXT_PUBLIC_API_BASE_URL` 已设置
2. 确认 API 服务器地址正确（包含协议 `https://`）
3. 重新部署前端应用

## 注意事项

1. **HTTPS 要求**：生产环境必须使用 HTTPS
2. **CORS 配置**：确保 API 服务器配置了正确的 CORS 头
3. **环境变量**：环境变量需要在构建时设置，运行时修改无效
4. **API 路径**：确保 API 服务器的路径与前端请求的路径匹配

