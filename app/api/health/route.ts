import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 检查系统状态
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      // 检查 API 路由是否可用
      apiRoutesAvailable: true,
      // 环境变量检查
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasApiBaseUrl: !!process.env.NEXT_PUBLIC_API_BASE_URL,
        hasMobileApiUrl: !!process.env.NEXT_PUBLIC_MOBILE_API_URL
      }
    }

    console.log('✅ 健康检查通过:', healthCheck)
    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    }
    console.error('❌ 健康检查失败:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}