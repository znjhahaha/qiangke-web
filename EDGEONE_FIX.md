# EdgeOne Pages 部署修复指南

## 问题

EdgeOne Pages 在 Serverless 环境中找不到 `handler.js` 文件，导致 502 错误。

错误信息：
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/user/handler.js'
```

## 解决方案

### 方案 1：使用标准 Next.js 启动（推荐）

如果 EdgeOne Pages 支持标准的 Node.js 应用，修改部署配置：

1. **构建命令**：
   ```bash
   npm install && npm run build
   ```

2. **启动命令**：
   ```bash
   npm start
   ```

3. **端口配置**：
   - 确保端口设置为 `3000`（Next.js 默认端口）
   - 或者设置环境变量 `PORT=3000`

### 方案 2：使用 Serverless 适配器

如果 EdgeOne Pages 必须使用 Serverless 函数格式：

1. **构建命令**：
   ```bash
   npm install && npm run build
   ```

2. **启动命令**：
   ```bash
   node handler.js
   ```

3. **入口文件**：
   - 确保 `handler.js` 文件在项目根目录
   - EdgeOne Pages 会自动识别 `handler.js` 作为入口点

### 方案 3：检查 EdgeOne Pages 配置

在 EdgeOne Pages 控制台检查：

1. **运行环境**：
   - 确认选择的是 "Node.js" 环境
   - Node.js 版本应该是 18.x 或 20.x

2. **入口文件**：
   - 如果支持自定义入口文件，设置为 `handler.js`
   - 或者设置为 `server.js`（如果使用自定义服务器）

3. **启动命令**：
   - 如果支持自定义启动命令，使用 `npm start`
   - 或者使用 `node server.js`（如果创建了自定义服务器）

## 创建自定义服务器（备选方案）

如果上述方案都不行，可以创建一个自定义服务器：

创建 `server.js`：

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

然后在 `package.json` 中添加：

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

## 验证

部署后，访问以下 URL 验证：

1. **健康检查**：
   ```
   https://your-domain.com/api/health
   ```

2. **调试接口**：
   ```
   https://your-domain.com/api/debug/logs
   ```

如果返回 JSON 响应，说明部署成功。

## 注意事项

1. **环境变量**：确保在 EdgeOne Pages 控制台设置了必要的环境变量
2. **端口**：确保端口配置正确（通常是 3000）
3. **构建输出**：确保 `.next` 目录被正确构建
4. **依赖**：确保 `node_modules` 被正确安装

## 如果仍然失败

如果上述方案都不行，可能需要：

1. **联系 EdgeOne Pages 技术支持**，询问 Next.js 应用的部署方式
2. **考虑使用其他平台**，如 Vercel（Next.js 官方推荐）或 Railway
3. **使用静态导出**，将 API 部分部署到其他平台

