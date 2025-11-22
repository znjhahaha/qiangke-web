# Cloudflare Pages 快速配置指南

## 问题原因
Next.js 应用在 Cloudflare Pages 上出现 404 错误，是因为：
1. Next.js 需要适配器才能在 Cloudflare Pages 上运行
2. 构建输出目录配置不正确

## ✅ 已完成的配置
- ✅ 已安装 `@cloudflare/next-on-pages` 适配器
- ✅ 已更新构建脚本 `build:cloudflare`

## 🔧 Cloudflare Pages 设置步骤

### 1. 进入 Cloudflare Pages 项目设置

在 Cloudflare Dashboard 中，进入你的 Pages 项目，点击 **"设置" (Settings)** → **"构建设置" (Builds & deployments)**

### 2. 配置构建设置

**构建命令：**
```
npm run build:cloudflare
```

**构建输出目录：**
```
.vercel/output/static
```

**Node.js 版本：**
```
18.x 或更高（推荐 20.x）
```

### 3. 环境变量（可选）

如果需要，可以添加以下环境变量：
```
NODE_ENV=production
```

### 4. 保存并重新部署

保存设置后，点击 **"重新部署" (Retry deployment)** 或推送新的代码触发构建。

## ✅ 验证

部署成功后，访问你的网站应该可以正常显示，不再出现 404 错误。

## 🐛 如果仍然出现 404

1. **检查构建日志**：确认 `npx @cloudflare/next-on-pages` 成功执行
2. **确认输出目录**：构建日志中应该显示输出到 `.vercel/output/static`
3. **检查文件大小**：确认没有文件超过 25MB
4. **查看构建日志中的错误信息**：根据具体错误进行修复

## 📝 注意事项

- `.vercel` 目录是构建时生成的，不需要提交到 Git（已在 `.gitignore` 中）
- 每次部署时，Cloudflare Pages 会自动运行构建命令并生成输出
- 如果修改了代码，需要重新推送或手动触发部署

