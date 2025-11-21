# EdgeOne Pages Next.js 部署修复

## 问题描述

错误信息：
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/user/handler.js' imported from /var/user/index.mjs
```

这个错误表明 EdgeOne Pages 误将项目识别为需要 Node Functions，但实际上 Next.js 应用应该直接部署，不需要额外的 Functions。

## 问题原因

1. **`functions` 目录存在**：EdgeOne Pages 检测到 `functions` 目录，误认为需要使用 Node Functions
2. **配置不完整**：`edgeone.json` 中缺少 `framework` 和 `startCommand` 配置

## 解决方案

### 1. 重命名 functions 目录

已将 `functions` 目录重命名为 `functions.disabled`，避免 EdgeOne Pages 误识别。

### 2. 更新 edgeone.json 配置

添加了以下配置：
- `"framework": "nextjs"` - 明确指定为 Next.js 框架
- `"startCommand": "npm start"` - 指定启动命令

### 3. 确保 Next.js 配置正确

`next.config.js` 中：
- ✅ 未设置 `output: 'export'`（除非 `BUILD_APK=true`）
- ✅ 所有 API 路由已添加 `export const runtime = 'nodejs'`

## 验证步骤

1. **提交代码并重新部署**
   ```bash
   git add .
   git commit -m "Fix: Remove functions directory and update EdgeOne config"
   git push
   ```

2. **在 EdgeOne Pages 控制台检查**
   - 项目设置 → 构建配置
   - 确认框架类型为 "Next.js"
   - 确认启动命令为 `npm start`
   - 确认输出目录为 `.next`

3. **重新部署后测试**
   - 访问 `/api/health` 应该返回健康检查信息
   - 其他 API 端点应该正常工作

## 重要提示

- ✅ Next.js 应用在 EdgeOne Pages 上应该作为标准 Next.js 应用部署
- ✅ 不需要使用 EdgeOne Functions（除非有特殊需求）
- ✅ 确保 `functions` 目录不存在或被重命名
- ✅ 确保 `edgeone.json` 中指定了 `framework: "nextjs"`

## 参考

- [EdgeOne Pages Next.js 指南](https://pages.edgeone.ai/zh/document/framework-guide/nextjs)
- [EdgeOne Pages 项目管理](https://pages.edgeone.ai/zh/document/project-management)

