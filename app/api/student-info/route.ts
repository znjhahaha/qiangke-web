import { NextRequest, NextResponse } from 'next/server'
import { getStudentInfo } from '@/lib/course-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const schoolId = searchParams.get('schoolId')
    
    // 从请求头获取Cookie
    const cookieHeader = request.headers.get('x-course-cookie')
    
    if (!cookieHeader) {
      return NextResponse.json({
        success: false,
        error: 'Cookie未设置',
        message: '请先在系统设置页面配置您的登录Cookie',
        action: '请前往"系统设置"页面，输入您的登录Cookie后重试'
      }, { status: 400 })
    }

    // 添加详细的日志
    console.log('🔍 API路由：开始获取学生信息', {
      hasCookie: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0,
      cookiePreview: cookieHeader?.substring(0, 50) || 'none',
      sessionId: sessionId || 'none',
      schoolId: schoolId || 'none'
    })
    
    // 直接传递schoolId参数，不再修改服务器端状态
    const studentInfo = await getStudentInfo(sessionId || undefined, cookieHeader, schoolId || undefined)
    
    console.log('✅ API路由：学生信息获取成功', {
      hasName: !!studentInfo.name,
      name: studentInfo.name,
      hasStudentId: !!studentInfo.studentId
    })
    
    return NextResponse.json({
      success: true,
      data: studentInfo
    })
  } catch (error: any) {
    // 重新获取 cookieHeader，因为在 catch 块中可能无法访问
    const cookieHeaderInError = request.headers.get('x-course-cookie')
    console.error('❌ API路由：获取学生信息失败', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cookieLength: cookieHeaderInError?.length || 0
    })
    
    // 处理特殊错误
    if (error.message?.includes('Cookie已过期') || error.message?.includes('需要重新登录') || error.message?.includes('无效')) {
      return NextResponse.json({
        success: false,
        error: 'Cookie已过期或无效',
        message: 'Cookie已过期或无效，请重新登录',
        action: '请前往"系统设置"页面，重新输入您的登录Cookie'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || '获取学生信息失败',
      message: error.message || '获取学生信息时发生未知错误'
    }, { status: 500 })
  }
}
