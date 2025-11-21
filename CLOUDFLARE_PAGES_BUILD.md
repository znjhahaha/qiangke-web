# Cloudflare Pages 构建配置

## 问题
Cloudflare Pages 有文件大小限制（25MB），Next.js 构建缓存文件可能超过此限制。

## 解决方案

### 方法 1：使用专用构建命令（推荐）

在 Cloudflare Pages 的构建设置中，使用以下构建命令：

```bash
npm run build:cloudflare
```

这个命令会在构建后自动清理缓存文件。

### 方法 2：手动配置构建命令

在 Cloudflare Pages 的构建设置中：

**构建命令：**
```bash
npm run build && node scripts/clean-cache.js
```

**构建输出目录：**
```
.next
```

**Node.js 版本：**
```
18.x 或更高
```

### 方法 3：环境变量配置

在 Cloudflare Pages 的环境变量中设置：

```
NODE_ENV=production
```

## 注意事项

1. **不要部署 `.next/cache` 目录**：这个目录包含构建缓存，不应该被部署
2. **文件大小限制**：确保单个文件不超过 25MB
3. **构建时间**：清理缓存可能会稍微增加构建时间，但可以避免部署问题

## 验证

构建完成后，检查 `.next` 目录中是否有超过 25MB 的文件：

```bash
find .next -type f -size +25M
```

如果有，需要进一步优化或排除这些文件。

