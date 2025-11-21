import { NextRequest, NextResponse } from 'next/server'
import { getGlobalSelector } from '@/lib/smart-course-selector'

// 明确指定使用 Node.js runtime（EdgeOne Pages 需要）
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const selector = getGlobalSelector()
    selector.stop()

    return NextResponse.json({
      success: true,
      message: '选课已停止'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '停止选课失败'
    }, { status: 500 })
  }
}
