const fs = require('fs')
const path = require('path')

/**
 * 清理 Next.js 构建缓存，避免文件过大
 * 特别用于 Cloudflare Pages 部署（文件大小限制 25MB）
 */
function cleanCache() {
  const cacheDir = path.join(process.cwd(), '.next', 'cache')
  
  if (fs.existsSync(cacheDir)) {
    console.log('🧹 清理 Next.js 构建缓存...')
    
    try {
      // 删除整个 cache 目录
      fs.rmSync(cacheDir, { recursive: true, force: true })
      console.log('✅ 缓存目录已清理')
    } catch (error) {
      console.error('❌ 清理缓存失败:', error.message)
      process.exit(1)
    }
  } else {
    console.log('ℹ️  缓存目录不存在，跳过清理')
  }
  
  // 检查并清理 webpack 缓存文件（如果存在）
  const webpackCacheDir = path.join(process.cwd(), '.next', 'cache', 'webpack')
  if (fs.existsSync(webpackCacheDir)) {
    try {
      fs.rmSync(webpackCacheDir, { recursive: true, force: true })
      console.log('✅ Webpack 缓存已清理')
    } catch (error) {
      console.warn('⚠️  清理 Webpack 缓存失败:', error.message)
    }
  }
}

cleanCache()


