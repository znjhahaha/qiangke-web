# EdgeOne Pages 禁用 Functions 配置指南

## 问题

即使重命名了 `functions` 目录，EdgeOne Pages 仍然尝试加载 Node Functions，导致错误：
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/user/handler.js' imported from /var/user/index.mjs
```

## 解决方案

### 1. 在 EdgeOne Pages 控制台禁用 Functions

**重要：** 需要在 EdgeOne Pages 控制台的项目设置中手动禁用 Functions：

1. 登录 EdgeOne Pages 控制台
2. 进入项目设置页面
3. 找到 **"Functions"** 或 **"边缘函数"** 相关设置
4. **禁用 Functions** 或 **清空 Functions 目录配置**
5. 确保项目类型设置为 **"Next.js"** 而不是 **"Functions"**

### 2. 检查项目设置

在 EdgeOne Pages 控制台的项目设置中，确认以下配置：

- ✅ **框架类型**：Next.js
- ✅ **构建命令**：`npm install && npm run build`
- ✅ **启动命令**：`npm start`
- ✅ **输出目录**：`.next`
- ✅ **Functions 目录**：**留空** 或 **禁用**

### 3. 确保代码中无 Functions 相关文件

- ✅ 已删除 `functions` 目录
- ✅ 已删除 `functions-dist` 目录（如果存在）
- ✅ 已删除 `_worker.js` 文件（如果存在）
- ✅ `edgeone.json` 中未配置 Functions 相关设置

### 4. 重新部署

1. 提交代码到 Git 仓库
2. 在 EdgeOne Pages 控制台点击 **"重新部署"**
3. 等待部署完成

## 验证

部署完成后，检查日志：
- ✅ 不应该看到 Functions 相关的错误
- ✅ API 路由应该正常工作
- ✅ `/api/health` 应该返回健康检查信息

## 如果问题仍然存在

如果按照上述步骤操作后问题仍然存在，请检查：

1. **EdgeOne Pages 控制台的项目设置**
   - 确认 Functions 已禁用
   - 确认项目类型为 Next.js

2. **构建日志**
   - 查看构建日志，确认没有尝试构建 Functions
   - 确认构建输出只有 `.next` 目录

3. **联系 EdgeOne Pages 支持**
   - 如果控制台设置正确但问题仍然存在，可能需要联系 EdgeOne Pages 技术支持

