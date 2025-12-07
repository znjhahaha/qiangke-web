import { NextRequest, NextResponse } from 'next/server'
import { getApiUrlsAsync } from '@/lib/global-school-state'

/**
 * Ping 接口 - 用于检测学校教务系统的连通性和延迟
 * GET /api/ping?schoolId=xxx
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    if (!schoolId) {
        return NextResponse.json({ success: false, error: '缺少 schoolId 参数' }, { status: 400 })
    }

    try {
        // 获取学校的API配置
        const urls = await getApiUrlsAsync(schoolId)

        // 我们尝试请求教务系统的登录页或首页，这通常是最稳定且无需认证的页面
        // studentInfo URL通常包含 index_initMenu.html，我们替换为 login_slogin.html
        // 这样更接近"服务器是否活着"的真实状态
        let targetUrl = urls.studentInfo
        try {
            const urlObj = new URL(targetUrl)
            // 尝试构造登录也URL，通常是 /jwglxt/xtgl/login_slogin.html
            // 如果不是标准正方路径，就使用 base origin
            if (urlObj.pathname.includes('/jwglxt/')) {
                targetUrl = `${urlObj.origin}/jwglxt/xtgl/login_slogin.html`
            } else {
                targetUrl = urlObj.origin
            }
        } catch (e) {
            // 如果解析失败，保持原样
        }

        const startTime = Date.now()

        // 设置5秒超时
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        try {
            // 使用 HEAD 请求减小流量，如果不支持则可能会返回 405 但仍能计算延迟
            const response = await fetch(targetUrl, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: controller.signal,
                cache: 'no-store',
                next: { revalidate: 0 } // 禁用 Next.js 缓存
            })
            clearTimeout(timeoutId)

            const endTime = Date.now()
            const latency = endTime - startTime

            // 判定质量
            // < 500ms: 流畅
            // 500ms - 2000ms: 卡顿
            // > 2000ms: 缓慢/未响应
            let quality: 'smooth' | 'laggy' | 'unresponsive' = 'smooth'

            if (latency > 2000) quality = 'unresponsive'
            else if (latency > 500) quality = 'laggy'

            // 即使状态码是 404/403/500，只要网络通了就算有响应
            // 只有超时或网络错误才算完全未响应

            return NextResponse.json({
                success: true,
                latency,
                quality,
                status: response.status
            })
        } catch (err: any) {
            clearTimeout(timeoutId)
            throw err
        }

    } catch (error: any) {
        console.error(`Ping failed for school ${schoolId}:`, error.message)
        const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout')

        return NextResponse.json({
            success: false,
            error: isTimeout ? '请求超时' : error.message,
            latency: isTimeout ? 5000 : -1,
            quality: 'unresponsive'
        }, { status: 200 }) // 返回200让前端正常处理状态
    }
}
