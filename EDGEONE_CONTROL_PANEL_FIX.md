# EdgeOne Pages 控制台配置修复指南

## ⚠️ 重要提示

**错误仍然存在的原因：** EdgeOne Pages 控制台的项目设置中可能配置了 Functions，需要在控制台中手动禁用。

## 必须执行的操作

### 1. 在 EdgeOne Pages 控制台禁用 Functions

**这是最关键的一步！** 仅修改代码文件是不够的，必须在控制台中禁用 Functions：

1. **登录 EdgeOne Pages 控制台**
   - 访问 https://console.cloud.tencent.com/edgeone/pages

2. **进入项目设置**
   - 找到您的项目
   - 点击项目进入详情页
   - 点击 **"项目设置"** 或 **"Settings"**

3. **找到 Functions 配置**
   - 在设置页面中找到 **"Functions"** 或 **"边缘函数"** 相关选项
   - 可能的位置：
     - **"Functions 目录"** - 设置为空或删除
     - **"启用 Functions"** - 取消勾选
     - **"Functions 配置"** - 禁用或删除

4. **确认项目类型**
   - 确保项目类型设置为 **"Next.js"** 或 **"Node.js"**
   - **不要**选择 **"Functions"** 或 **"边缘函数"**

5. **保存设置**
   - 点击 **"保存"** 或 **"应用"**
   - 等待设置生效

### 2. 重新部署项目

在控制台禁用 Functions 后：

1. 点击 **"重新部署"** 或 **"Redeploy"**
2. 等待部署完成
3. 检查部署日志，确认没有 Functions 相关的错误

### 3. 验证修复

部署完成后，测试 API 端点：

```bash
# 测试健康检查
curl https://your-domain.com/api/health

# 应该返回 JSON 响应，而不是错误
```

## 代码层面的修复（已完成）

✅ 已更新 `edgeone.json`，添加 `"functions": { "enabled": false }`
✅ 已删除 `functions` 目录
✅ 已配置 `framework: "nextjs"` 和 `startCommand: "npm start"`

## 如果控制台没有 Functions 设置选项

如果 EdgeOne Pages 控制台中没有找到 Functions 相关的设置选项，可能需要：

1. **联系 EdgeOne Pages 技术支持**
   - 说明您的项目是 Next.js 应用，不需要 Functions
   - 请求他们帮助禁用 Functions

2. **检查项目创建方式**
   - 如果项目是通过导入 Functions 项目创建的，可能需要重新创建项目
   - 创建时选择 **"Next.js"** 模板，而不是 **"Functions"** 模板

## 参考文档

- [EdgeOne Pages 项目管理](https://pages.edgeone.ai/zh/document/project-management)
- [EdgeOne Pages Next.js 指南](https://pages.edgeone.ai/zh/document/framework-guide/nextjs)
- [EdgeOne Pages 错误码](https://pages.edgeone.ai/zh/document/error-codes)

