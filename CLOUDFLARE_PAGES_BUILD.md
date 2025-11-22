# Cloudflare Pages 构建配置

## 问题
1. Cloudflare Pages 有文件大小限制（25MB），Next.js 构建缓存文件可能超过此限制
2. Next.js 应用需要适配器才能在 Cloudflare Pages 上运行，否则会出现 404 错误

## 解决方案

### 已安装的适配器
项目已安装 `@cloudflare/next-on-pages` 适配器，用于将 Next.js 应用转换为 Cloudflare Pages 兼容格式。

### Cloudflare Pages 构建设置

在 Cloudflare Pages 的构建设置中配置以下内容：

**构建命令：**
```bash
npm run build:cloudflare
```

**构建输出目录：**
```
.vercel/output/static
```

**Node.js 版本：**
```
18.x 或更高
```

**环境变量：**
```
NODE_ENV=production
```

### 构建流程说明

`build:cloudflare` 命令会执行以下步骤：
1. `next build` - 构建 Next.js 应用
2. `npx @cloudflare/next-on-pages` - 将 Next.js 应用转换为 Cloudflare Pages 格式
3. `node scripts/clean-cache.js` - 清理缓存文件（避免超过 25MB 限制）

### 手动构建命令（如果自动命令失败）

如果 `npm run build:cloudflare` 失败，可以手动执行：

```bash
npm install
npm run build
npx @cloudflare/next-on-pages
node scripts/clean-cache.js
```

## 注意事项

1. **构建输出目录**：必须设置为 `.vercel/output/static`，这是 `@cloudflare/next-on-pages` 生成的输出目录
2. **不要部署 `.next/cache` 目录**：这个目录包含构建缓存，不应该被部署
3. **文件大小限制**：确保单个文件不超过 25MB
4. **API 路由**：Cloudflare Pages 支持 Next.js API 路由，但需要使用适配器（已配置）

## 验证

构建完成后，检查以下内容：

1. **确认输出目录存在**：
   ```bash
   ls -la .vercel/output/static
   ```

2. **检查文件大小**：
   ```bash
   find .vercel -type f -size +25M
   ```

3. **检查函数目录**：
   ```bash
   ls -la .vercel/output/functions
   ```

## 故障排除

### 问题：访问网站时出现 404 错误

**原因：** 构建输出目录配置错误或未使用适配器

**解决方案：**
1. 确认构建命令包含 `npx @cloudflare/next-on-pages`
2. 确认构建输出目录设置为 `.vercel/output/static`
3. 检查构建日志，确认适配器成功运行

### 问题：构建失败，提示文件过大

**原因：** 缓存文件超过 25MB 限制

**解决方案：**
1. 确认 `scripts/clean-cache.js` 已执行
2. 检查 `.next/cache` 目录是否被清理
3. 如果问题持续，考虑排除更多不必要的文件

### 问题：API 路由不工作

**原因：** 适配器未正确转换 API 路由

**解决方案：**
1. 确认所有 API 路由文件位于 `app/api/` 目录
2. 检查 API 路由是否使用了 Cloudflare Pages 不支持的 Node.js API
3. 查看构建日志中的警告信息


