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
    console.error('❌ API路由：获取学生信息失败', {
      error: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // 处理特殊错误
    if (error.message?.includes('Cookie已过期') || error.message?.includes('需要重新登录')) {
      return NextResponse.json({
        success: false,
        error: 'Cookie已过期',
        message: 'Cookie已过期，请重新登录',
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
