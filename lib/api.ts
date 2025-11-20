// Next.js API路由调用
import LocalCookieManager from './local-cookie-manager'
import { getApiBaseUrl } from './apk-config'

// 动态获取 API 基础 URL（APK 环境使用独立服务器，网页版使用相对路径）
const getApiBaseUrlDynamic = () => {
  if (typeof window !== 'undefined') {
    return getApiBaseUrl()
  }
  return '/api' // 服务器端默认使用相对路径
}

/**
 * 获取完整的 API URL（供直接使用 fetch 的地方调用）
 */
export function getApiUrl(path: string): string {
  const apiBaseUrl = getApiBaseUrlDynamic()
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

// 通用请求函数
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // 从本地存储获取Cookie并添加到请求头
  const localCookie = LocalCookieManager.getCookie()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }
  
  // 如果有本地Cookie，添加到请求头
  if (localCookie) {
    headers['x-course-cookie'] = localCookie
  }

  try {
    const apiBaseUrl = getApiBaseUrlDynamic()
    const fullUrl = `${apiBaseUrl}${url}`
    
    // 添加调试日志（开发环境或生产环境都记录，便于排查问题）
    console.log(`🌐 API请求: ${fullUrl}`, { 
      apiBaseUrl,
      hasCookie: !!headers['x-course-cookie'],
      cookieLength: headers['x-course-cookie']?.length || 0
    })
    
    const response = await fetch(fullUrl, {
      headers,
      ...options,
    })

    // 添加响应状态日志
    if (!response.ok) {
      console.error(`❌ API请求失败: ${fullUrl}`, { 
        status: response.status, 
        statusText: response.statusText,
        apiBaseUrl,
        url
      })
      
      // 如果是 404，可能是静态部署环境，API 路由不可用
      if (response.status === 404) {
        const errorText = await response.clone().text().catch(() => '')
        if (errorText.includes('404') || errorText.length < 100) {
          throw new Error(`API路由不可用 (404)。如果部署在静态托管平台（如 EdgeOne Pages），请配置环境变量 NEXT_PUBLIC_API_BASE_URL 指向外部 API 服务器。当前 API 地址: ${apiBaseUrl}`)
        }
      }
    }

    // 尝试解析响应，无论状态码如何
    let data: any
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (e) {
        // JSON解析失败，尝试文本
        const text = await response.clone().text()
        throw new Error(text || `HTTP ${response.status}: 响应格式错误`)
      }
    } else {
      // 不是JSON格式，读取文本
      const text = await response.text()
      if (!response.ok) {
        throw new Error(text || `HTTP ${response.status}`)
      }
      return text as any as T
    }

    // 如果状态码不是成功的，但响应是JSON格式
    // 检查是否有 success 字段，如果有则返回数据让调用者处理
    if (!response.ok) {
      // 如果是JSON格式的错误响应，可能包含 success: false
      // 对于成绩查询等API，我们允许返回 success: false 的数据
      if (data && typeof data === 'object' && 'success' in data) {
        return data as T
      }
      // 否则抛出错误
      throw new Error(data.error || data.message || `HTTP ${response.status}`)
    }

    return data as T
  } catch (error: any) {
    // 添加详细的错误日志
    const apiBaseUrl = getApiBaseUrlDynamic()
    const fullUrl = `${apiBaseUrl}${url}`
    console.error(`❌ API请求异常: ${fullUrl}`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      apiBaseUrl,
      url
    })
    
    // 如果是网络错误（如 CORS、连接失败等）
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`无法连接到API服务器 (${apiBaseUrl})。请检查：1) API服务器是否运行 2) 网络连接是否正常 3) CORS配置是否正确`)
    }
    
    // 如果是我们主动抛出的错误，直接抛出
    if (error instanceof Error && error.message) {
      throw error
    }
    // 其他网络错误
    throw new Error(error.message || '网络请求失败，请检查网络连接')
  }
}

// API接口定义
export const courseAPI = {
  // 健康检查
  healthCheck: () => request('/health'),
  
  // 会话管理
  createSession: (data: { cookie: string }) =>
    request('/session', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSession: (sessionId: string) =>
    request(`/session?sessionId=${sessionId}`),
  deleteSession: (sessionId: string) =>
    request(`/session?sessionId=${sessionId}`, {
      method: 'DELETE',
    }),
  
  // 配置管理
  getConfig: () => request('/config'),
  setConfig: (data: { cookie: string }) => 
    request('/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // 学生信息
  getStudentInfo: (sessionId?: string, schoolId?: string) => {
    const params = new URLSearchParams()
    if (sessionId) params.append('sessionId', sessionId)
    if (schoolId) params.append('schoolId', schoolId)
    const queryString = params.toString()
    return request(`/student-info${queryString ? `?${queryString}` : ''}`)
  },
  
  // 课程信息
  getAvailableCourses: (schoolId?: string, options?: { forceRefresh?: boolean }) => {
    const params = new URLSearchParams()
    if (schoolId) params.append('schoolId', schoolId)
    if (options?.forceRefresh) params.append('forceRefresh', '1')
    const queryString = params.toString()
    return request(`/courses/available${queryString ? `?${queryString}` : ''}`)
  },
  getSelectedCourses: (schoolId?: string) => 
    request(`/courses/selected${schoolId ? `?schoolId=${schoolId}` : ''}`),
  getScheduleData: (schoolId?: string) => 
    request(`/schedule${schoolId ? `?schoolId=${schoolId}` : ''}`),
  
  // 成绩查询（支持传入schoolId参数）
  getGrades: (xnm: string, xqm: string, sessionId?: string, schoolId?: string) =>
    request('/grade', {
      method: 'POST',
      body: JSON.stringify({ xnm, xqm, sessionId, schoolId }),
    }),
  
  // 总体成绩查询（支持传入schoolId参数）
  getOverallGrades: (sessionId?: string, schoolId?: string) =>
    request('/overall-grade', {
      method: 'POST',
      body: JSON.stringify({ sessionId, schoolId }),
    }),
  
  // 选课功能
  executeSingleCourseSelection: (courseData: {
    jxb_id: string
    do_jxb_id: string
    kch_id: string
    jxbzls?: string
    kklxdm?: string
    kcmc?: string
    jxbmc?: string
    _rwlx?: string  // 获取课程列表时使用的 rwlx 参数
    _xklc?: string  // 获取课程列表时使用的 xklc 参数
    _xkly?: string  // 获取课程列表时使用的 xkly 参数
    _xkkz_id?: string  // 获取课程列表时使用的 xkkz_id 参数
  }, schoolId?: string) => 
    request(`/course-selection/single${schoolId ? `?schoolId=${schoolId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),
  
  // 批量抢课
  executeBatchCourseSelection: (data: {
    courses: Array<{
      jxb_id: string
      do_jxb_id: string
      kch_id: string
      jxbzls?: string
      kklxdm?: string
      kcmc?: string
      jxbmc?: string
    }>
    batchSize?: number
    delay?: number
  }, schoolId?: string) => 
    request(`/course-selection/batch${schoolId ? `?schoolId=${schoolId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // 智能选课
  startSmartCourseSelection: (data: {
    courses: any[]
    max_attempts?: number
    interval?: number
  }) => 
    request('/course-selection/smart/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  stopSmartCourseSelection: (threadId: string) => 
    request(`/course-selection/smart/stop/${threadId}`, {
      method: 'POST',
    }),
  
  getCourseSelectionStatus: (threadId: string) => 
    request(`/course-selection/status/${threadId}`),
  
  getCourseSelectionThreads: () => 
    Promise.resolve({
      success: true,
      data: {}
    }),
}
