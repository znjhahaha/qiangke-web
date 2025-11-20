/**
 * 检测是否为 APK 运行环境
 */
export function isApkEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检测 Capacitor 环境
  if ((window as any).Capacitor) {
    return true
  }
  
  // 检测自定义环境变量
  if (process.env.NEXT_PUBLIC_IS_APK === 'true') {
    return true
  }
  
  // 检测 User-Agent（Capacitor 应用通常有特定的 User-Agent）
  const userAgent = navigator.userAgent || ''
  if (userAgent.includes('Capacitor') || userAgent.includes('Android')) {
    // 进一步检查是否在原生容器中（而不是浏览器）
    if (!userAgent.includes('Chrome') && !userAgent.includes('Firefox')) {
      return true
    }
  }
  
  return false
}

/**
 * 检测是否为静态部署环境（如 EdgeOne Pages）
 * 静态部署时，API 路由不可用，需要使用外部 API 服务器
 */
export function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检查环境变量（显式指定使用外部 API）
  if (process.env.NEXT_PUBLIC_USE_EXTERNAL_API === 'true') {
    return true
  }
  
  // 检查是否有配置外部 API URL（如果有，说明是静态部署）
  if (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_MOBILE_API_URL) {
    return true
  }
  
  // 尝试检测：如果 API 路由不可用（返回 404），则可能是静态部署
  // 这个检测在运行时进行，通过尝试访问 /api/health 来判断
  return false
}

/**
 * 获取 API 基础 URL
 * 优先级：
 * 1. 如果配置了外部 API URL（NEXT_PUBLIC_API_BASE_URL 或 NEXT_PUBLIC_MOBILE_API_URL），使用外部 API
 * 2. 如果是 APK 环境，使用环境变量配置的 API 服务器地址
 * 3. 默认使用相对路径（仅在支持 API 路由的环境中有效）
 */
export function getApiBaseUrl(): string {
  // 优先检查是否有配置外部 API URL（用于静态部署）
  const externalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_MOBILE_API_URL
  if (externalApiUrl) {
    return externalApiUrl.replace(/\/$/, '') // 移除末尾的斜杠
  }
  
  // 如果是 APK 环境，也应该使用外部 API（但上面已经检查过了）
  if (isApkEnvironment()) {
    // 如果 APK 环境但没有配置外部 API，返回相对路径（可能不可用）
    return '/api'
  }
  
  // 默认使用相对路径（网页版，需要支持 API 路由）
  return '/api'
}

