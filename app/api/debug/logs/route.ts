import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * 调试接口：查看服务器状态和最近的操作
 * 注意：此接口仅用于调试，生产环境建议删除或添加访问限制
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '调试接口正常',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasApiBaseUrl: !!process.env.NEXT_PUBLIC_API_BASE_URL,
        hasMobileApiUrl: !!process.env.NEXT_PUBLIC_MOBILE_API_URL
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

