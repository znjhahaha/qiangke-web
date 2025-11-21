import { NextRequest, NextResponse } from 'next/server'
import { getGlobalSelector } from '@/lib/smart-course-selector'

// 明确指定使用 Node.js runtime（EdgeOne Pages 需要）
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const selector = getGlobalSelector()
    const status = selector.getStatus()

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '获取选课状态失败'
    }, { status: 500 })
  }
}
