const fs = require('fs')
const path = require('path')

// 需要添加 runtime 的 API 路由文件
const apiRoutesDir = path.join(__dirname, '..', 'app', 'api')

// 递归查找所有 route.ts 文件
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList)
    } else if (file === 'route.ts') {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

// 检查文件是否已经有 runtime 配置
function hasRuntimeConfig(content) {
  return /export const runtime\s*=/.test(content)
}

// 添加 runtime 配置
function addRuntimeConfig(content) {
  // 如果已经有 runtime 配置，直接返回
  if (hasRuntimeConfig(content)) {
    return content
  }
  
  // 查找第一个 export 语句的位置
  const exportMatch = content.match(/^(export\s+(?:async\s+)?function|export\s+const\s+dynamic)/m)
  
  if (exportMatch) {
    const insertPos = exportMatch.index
    const beforeExport = content.substring(0, insertPos)
    const afterExport = content.substring(insertPos)
    
    // 检查是否已经有 dynamic 配置
    const hasDynamic = /export const dynamic\s*=/.test(beforeExport)
    
    let runtimeConfig = ''
    if (!hasDynamic) {
      runtimeConfig = "// 明确指定使用 Node.js runtime（EdgeOne Pages 需要）\nexport const runtime = 'nodejs'\nexport const dynamic = 'force-dynamic'\n\n"
    } else {
      runtimeConfig = "// 明确指定使用 Node.js runtime（EdgeOne Pages 需要）\nexport const runtime = 'nodejs'\n"
    }
    
    return beforeExport + runtimeConfig + afterExport
  }
  
  return content
}

// 主函数
function main() {
  const routeFiles = findRouteFiles(apiRoutesDir)
  let updatedCount = 0
  
  routeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    if (!hasRuntimeConfig(content)) {
      const newContent = addRuntimeConfig(content)
      fs.writeFileSync(filePath, newContent, 'utf-8')
      console.log(`✅ 已更新: ${path.relative(apiRoutesDir, filePath)}`)
      updatedCount++
    } else {
      console.log(`⏭️  已存在: ${path.relative(apiRoutesDir, filePath)}`)
    }
  })
  
  console.log(`\n完成！共更新 ${updatedCount} 个文件。`)
}

main()

