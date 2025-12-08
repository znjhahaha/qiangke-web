// 全局学校状态管理
export interface SchoolConfig {
  id: string
  name: string
  domain: string
  protocol: string
  description?: string
}

// 支持的学校列表（动态获取，包含默认和自定义学校）
import { getAllSchools, getAllSchoolsSync } from './admin-school-manager'

// 同步版本（用于服务端渲染或立即需要数据的地方）
export function getSupportedSchools(): SchoolConfig[] {
  if (typeof window !== 'undefined') {
    return getAllSchoolsSync()
  }
  // 服务端渲染时返回默认列表
  return [
    {
      id: 'tyust',
      name: '太原科技大学',
      domain: 'newjwc.tyust.edu.cn',
      protocol: 'https',
      description: '太原科技大学教务系统'
    },
    {
      id: 'zjut',
      name: '浙江工业大学',
      domain: 'www.gdjw.zjut.edu.cn',
      protocol: 'http',
      description: '浙江工业大学教务系统'
    }
  ]
}

// 异步版本（支持从服务器同步）
export async function getSupportedSchoolsAsync(sync = true): Promise<SchoolConfig[]> {
  if (typeof window !== 'undefined') {
    return await getAllSchools(sync)
  }
  return getSupportedSchools()
}

// 向后兼容：默认学校列表（服务端渲染时使用）
const DEFAULT_SCHOOLS_LIST: SchoolConfig[] = [
  {
    id: 'tyust',
    name: '太原科技大学',
    domain: 'newjwc.tyust.edu.cn',
    protocol: 'https',
    description: '太原科技大学教务系统'
  },
  {
    id: 'zjut',
    name: '浙江工业大学',
    domain: 'www.gdjw.zjut.edu.cn',
    protocol: 'http',
    description: '浙江工业大学教务系统'
  }
]

// 向后兼容：保留 SUPPORTED_SCHOOLS，但在客户端使用动态列表
export const SUPPORTED_SCHOOLS: SchoolConfig[] = typeof window !== 'undefined'
  ? getSupportedSchools()
  : DEFAULT_SCHOOLS_LIST

// 默认学校
export const DEFAULT_SCHOOL = DEFAULT_SCHOOLS_LIST[0]

// 全局学校状态
let currentSchool: SchoolConfig = DEFAULT_SCHOOL

// 获取当前学校
export function getCurrentSchool(): SchoolConfig {
  // 在客户端环境中，尝试从localStorage读取
  if (typeof window !== 'undefined') {
    try {
      const savedSchoolId = localStorage.getItem('selected-school-id')
      if (savedSchoolId) {
        const schools = getSupportedSchools()
        const school = schools.find(s => s.id === savedSchoolId)
        if (school) {
          currentSchool = school
          return school
        } else {
          // 如果找不到学校，可能是新添加的学校，触发后台同步（不阻塞）
          console.warn(`⚠️ 找不到学校 ID "${savedSchoolId}"，可能尚未同步，触发后台同步`)
          getSupportedSchoolsAsync(true).then(syncedSchools => {
            const foundSchool = syncedSchools.find(s => s.id === savedSchoolId)
            if (foundSchool) {
              currentSchool = foundSchool
              console.log(`✅ 后台同步成功，找到学校: ${foundSchool.name}`)
            } else {
              console.warn(`⚠️ 即使同步后也找不到学校 ID "${savedSchoolId}"，使用默认学校`)
              currentSchool = DEFAULT_SCHOOL
            }
          }).catch(error => {
            console.error('后台同步学校列表失败:', error)
            currentSchool = DEFAULT_SCHOOL
          })
          // 返回默认学校，等待后台同步完成
          return DEFAULT_SCHOOL
        }
      }
    } catch (error) {
      console.error('读取学校配置失败:', error)
    }
  }
  return currentSchool
}

// 设置当前学校
export function setCurrentSchool(school: SchoolConfig): void {
  currentSchool = school

  // 在客户端环境中，保存到localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('selected-school-id', school.id)
      console.log(`✅ 学校已切换为: ${school.name} (${school.id})`)
    } catch (error) {
      console.error('保存学校配置失败:', error)
    }
  }
}

// 根据ID获取学校（支持服务器端）
export function getSchoolById(id: string): SchoolConfig | undefined {
  // 服务器端：尝试从缓存获取
  if (typeof window === 'undefined') {
    if (serverSchoolsCache && serverSchoolsCache.length > 0) {
      const found = serverSchoolsCache.find(s => s.id === id)
      if (found) {
        console.log(`✅ 服务器端：从缓存找到学校 ${found.name} (${found.id})`)
        return found
      }
      // 缓存中有数据但没找到，记录警告
      console.warn(`⚠️ 服务器端：缓存中有 ${serverSchoolsCache.length} 所学校，但未找到 ID "${id}"`)
      console.warn(`⚠️ 缓存中的学校:`, serverSchoolsCache.map((s: SchoolConfig) => `${s.name} (${s.id})`).join(', '))
    } else {
      // 缓存未加载，记录警告
      console.warn(`⚠️ 服务器端：学校列表缓存未加载，尝试从默认列表查找 ID "${id}"`)
    }
    // 如果缓存中没有，返回默认学校（异步加载会更新缓存）
    const defaultSchool = DEFAULT_SCHOOLS_LIST.find(s => s.id === id)
    if (defaultSchool) {
      console.warn(`⚠️ 服务器端：使用默认学校列表中的 ${defaultSchool.name} (${defaultSchool.id})`)
      return defaultSchool
    }
    console.error(`❌ 服务器端：找不到学校 ID "${id}"，默认列表中也未找到`)
    return undefined
  }

  // 客户端：使用原有逻辑
  const schools = getSupportedSchools()
  const found = schools.find(school => school.id === id)

  // 如果找不到学校，可能是新添加的，触发后台同步（不阻塞）
  if (!found) {
    console.warn(`⚠️ 找不到学校 ID "${id}"，可能尚未同步，触发后台同步`)
    getSupportedSchoolsAsync(true).then(syncedSchools => {
      const syncedFound = syncedSchools.find(s => s.id === id)
      if (syncedFound) {
        console.log(`✅ 后台同步成功，找到学校: ${syncedFound.name} (${syncedFound.id})`)
      } else {
        console.warn(`⚠️ 即使同步后也找不到学校 ID "${id}"`)
      }
    }).catch(error => {
      console.error('后台同步学校列表失败:', error)
    })
  }

  return found
}

// 生成完整的学校URL
export function getSchoolUrl(path: string = ''): string {
  const school = getCurrentSchool()
  const baseUrl = `${school.protocol}://${school.domain}`
  return path ? `${baseUrl}${path}` : baseUrl
}

// 学校特定的URL配置（默认配置，可以在后台管理页面动态添加）
const DEFAULT_SCHOOL_URL_CONFIG: Record<string, {
  gradeGnmkdm?: string
  courseGnmkdm?: string
  scheduleGnmkdm?: string
}> = {
  tyust: {
    gradeGnmkdm: 'N305005',
    courseGnmkdm: 'N253512',
    scheduleGnmkdm: 'N253508'
  },
  zjut: {
    gradeGnmkdm: 'N305005',
    courseGnmkdm: 'N253512',
    scheduleGnmkdm: 'N253508'
  }
}

// 服务器端URL配置缓存
let serverUrlConfigsCache: Record<string, any> | null = null
let serverUrlConfigsCacheTime = 0
// 服务器端学校列表缓存
let serverSchoolsCache: SchoolConfig[] | null = null
let serverSchoolsCacheTime = 0
const CACHE_DURATION = 60000 // 缓存1分钟

// 从服务器获取学校列表（仅在服务器端使用，也导出供其他模块使用）
export async function getSchoolsFromServer(): Promise<SchoolConfig[]> {
  // 只在服务器端执行
  if (typeof window !== 'undefined') {
    return []
  }

  try {
    // 检查缓存
    const now = Date.now()
    if (serverSchoolsCache && (now - serverSchoolsCacheTime) < CACHE_DURATION) {
      return serverSchoolsCache
    }

    // 从文件或COS加载学校列表
    const { getDataDir, loadDataFromFile } = await import('./data-storage')
    const path = await import('path')
    const { isCosEnabled, loadFromCos } = await import('./cos-storage')

    const dataDir = await getDataDir()
    const schoolsFile = path.join(dataDir, 'schools.json')

    // 优先使用 COS 存储
    if (isCosEnabled()) {
      try {
        const cosKey = `qiangke-data/${path.basename(schoolsFile)}`
        const data = await loadFromCos(cosKey)
        if (data && data.schools && Array.isArray(data.schools) && data.schools.length > 0) {
          serverSchoolsCache = data.schools
          serverSchoolsCacheTime = now
          console.log(`✅ 从 COS 加载学校列表: ${data.schools.length} 所学校`)
          console.log(`📝 学校列表:`, data.schools.map((s: SchoolConfig) => `${s.name} (${s.id})`).join(', '))
          return data.schools
        }
      } catch (error: any) {
        console.warn('⚠️ 从 COS 加载学校列表失败，尝试使用文件系统:', error?.message)
      }
    }

    // 使用文件系统
    const loaded = await loadDataFromFile<SchoolConfig>(schoolsFile, 'schools', [])
    if (loaded.length > 0) {
      serverSchoolsCache = loaded
      serverSchoolsCacheTime = now
      console.log(`✅ 从文件系统加载学校列表: ${loaded.length} 所学校`)
      console.log(`📝 学校列表:`, loaded.map((s: SchoolConfig) => `${s.name} (${s.id})`).join(', '))
      return loaded
    }

    // 如果没有找到，返回默认学校（合并默认学校和可能存在的自定义学校）
    console.warn('⚠️ 未找到学校配置文件或文件为空，使用默认学校列表')
    // 确保缓存也被设置为默认学校列表
    serverSchoolsCache = DEFAULT_SCHOOLS_LIST
    serverSchoolsCacheTime = now
    return DEFAULT_SCHOOLS_LIST
  } catch (error: any) {
    console.error('从服务器获取学校列表失败:', error)
    return DEFAULT_SCHOOLS_LIST
  }
}

// 从服务器获取URL配置（仅在服务器端使用）
async function getSchoolUrlConfigFromServer(schoolId: string): Promise<{
  gradeGnmkdm?: string
  courseGnmkdm?: string
  scheduleGnmkdm?: string
} | null> {
  // 只在服务器端执行
  if (typeof window !== 'undefined') {
    return null
  }

  try {
    // 检查缓存
    const now = Date.now()
    if (serverUrlConfigsCache && (now - serverUrlConfigsCacheTime) < CACHE_DURATION) {
      return serverUrlConfigsCache[schoolId] || null
    }

    // 直接使用服务器端数据存储模块加载URL配置
    const { getDataDir, loadDataFromFile } = await import('./data-storage')
    const { existsSync } = await import('fs')
    const { readFile } = await import('fs/promises')
    const path = await import('path')
    const { isCosEnabled, loadFromCos } = await import('./cos-storage')

    const dataDir = await getDataDir()
    const urlConfigsFile = path.join(dataDir, 'url-configs.json')

    // 优先使用 COS 存储
    if (isCosEnabled()) {
      try {
        const cosKey = `qiangke-data/${path.basename(urlConfigsFile)}`
        const data = await loadFromCos(cosKey)
        if (data && data.urlConfigs) {
          serverUrlConfigsCache = data.urlConfigs
          serverUrlConfigsCacheTime = now
          return data.urlConfigs[schoolId] || null
        }
      } catch (error: any) {
        console.warn('⚠️ 从 COS 加载URL配置失败，尝试使用文件系统:', error?.message)
      }
    }

    // 使用文件系统
    if (existsSync(urlConfigsFile)) {
      const content = await readFile(urlConfigsFile, 'utf-8')
      const data = JSON.parse(content)
      serverUrlConfigsCache = data.urlConfigs || {}
      serverUrlConfigsCacheTime = now
      return serverUrlConfigsCache?.[schoolId] || null
    }
  } catch (error: any) {
    console.error('从服务器获取URL配置失败:', error)
  }

  return null
}

// 获取学校URL配置（优先从后台管理获取）
async function getSchoolUrlConfigAsync(schoolId: string): Promise<{
  gradeGnmkdm?: string
  courseGnmkdm?: string
  scheduleGnmkdm?: string
}> {
  // 客户端：从localStorage获取
  if (typeof window !== 'undefined') {
    try {
      const { getSchoolUrlConfig } = require('./admin-school-manager')
      const config = getSchoolUrlConfig(schoolId)
      if (config) {
        return config
      }
    } catch (error) {
      console.error('获取学校URL配置失败:', error)
    }
  } else {
    // 服务器端：从文件或COS获取
    const serverConfig = await getSchoolUrlConfigFromServer(schoolId)
    if (serverConfig) {
      return serverConfig
    }
  }

  // 回退到默认配置
  return DEFAULT_SCHOOL_URL_CONFIG[schoolId] || DEFAULT_SCHOOL_URL_CONFIG['tyust']
}

// 同步版本的获取函数（用于客户端立即调用，服务器端尝试从缓存获取）
function getSchoolUrlConfig(schoolId: string): {
  gradeGnmkdm?: string
  courseGnmkdm?: string
  scheduleGnmkdm?: string
} {
  if (typeof window !== 'undefined') {
    // 客户端：从localStorage获取
    try {
      const { getSchoolUrlConfig } = require('./admin-school-manager')
      const config = getSchoolUrlConfig(schoolId)
      if (config) {
        console.log(`✅ 找到学校 "${schoolId}" 的URL配置:`, config)
        return config
      } else {
        // 如果找不到配置，可能是新添加的学校，先检查是否是默认学校
        const isDefaultSchool = DEFAULT_SCHOOL_URL_CONFIG[schoolId]
        if (isDefaultSchool) {
          console.log(`📝 学校 "${schoolId}" 使用默认URL配置`)
          return isDefaultSchool
        }

        // 不是默认学校且找不到配置，触发后台同步（不阻塞）
        console.warn(`⚠️ 找不到学校 "${schoolId}" 的URL配置，触发后台同步...`)
        getSchoolUrlConfigAsync(schoolId).then(syncedConfig => {
          if (syncedConfig) {
            console.log(`✅ 后台同步成功，获取到学校 "${schoolId}" 的URL配置:`, syncedConfig)
          } else {
            console.warn(`⚠️ 即使同步后也找不到学校 "${schoolId}" 的URL配置，将使用默认参数`)
          }
        }).catch(error => {
          console.error('后台同步URL配置失败:', error)
        })

        // 对于自定义添加的学校，使用默认的 gnmkdm 参数
        // 这些参数适用于大多数使用正方教务系统的学校
        const defaultGnmkdm = {
          gradeGnmkdm: 'N305005',
          courseGnmkdm: 'N253512',
          scheduleGnmkdm: 'N253508'
        }
        console.log(`📝 学校 "${schoolId}" 使用默认 gnmkdm 参数`)
        return defaultGnmkdm
      }
    } catch (error) {
      console.error('获取学校URL配置失败:', error)
    }
  } else {
    // 服务器端：尝试从缓存获取（如果缓存存在）
    if (serverUrlConfigsCache && serverUrlConfigsCache[schoolId]) {
      return serverUrlConfigsCache[schoolId]
    }
  }

  // 检查是否是默认学校
  const defaultConfig = DEFAULT_SCHOOL_URL_CONFIG[schoolId]
  if (defaultConfig) {
    console.log(`📝 服务器端：学校 "${schoolId}" 使用默认URL配置`)
    return defaultConfig
  }

  // 回退到通用默认 gnmkdm 参数（适用于大多数正方教务系统）
  console.log(`📝 学校 "${schoolId}" 使用通用默认 gnmkdm 参数`)
  return {
    gradeGnmkdm: 'N305005',
    courseGnmkdm: 'N253512',
    scheduleGnmkdm: 'N253508'
  }
}

// 直接从学校配置对象生成 API URLs（用于处理客户端传递的本地学校配置）
export function getApiUrlsForSchool(school: SchoolConfig, urlConfig?: {
  gradeGnmkdm?: string
  courseGnmkdm?: string
  scheduleGnmkdm?: string
}) {
  const baseUrl = `${school.protocol}://${school.domain}`

  // 如果没有提供 urlConfig，使用默认的 gnmkdm 参数
  const config = urlConfig || {
    gradeGnmkdm: 'N305005',
    courseGnmkdm: 'N253512',
    scheduleGnmkdm: 'N253508'
  }

  console.log(`🔧 [服务器端] 使用请求中的学校配置: ${school.name} (${school.id})`)
  console.log(`🔧 [服务器端] 基础URL: ${baseUrl}`)
  console.log(`🔧 [服务器端] gnmkdm配置:`, config)

  return {
    baseUrl,
    loginUrl: `${baseUrl}/`,
    gradeUrl: `${baseUrl}/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=${config.gradeGnmkdm}`,
    courseUrl: `${baseUrl}/xsxk/zzxkyzb_cxZzxkYzbDisplay.html?gnmkdm=${config.courseGnmkdm}`,
    scheduleUrl: `${baseUrl}/kbcx/xskbcx_cxXsKb.html?gnmkdm=${config.scheduleGnmkdm}`,
    studentInfoUrl: `${baseUrl}/xsxxxggl/xsxxwh_cxCkDgxsxx.html?gnmkdm=N100801`,
    selectCourseUrl: `${baseUrl}/xsxk/zzxkyzb_xkBcZyZzxkYzb.html?gnmkdm=${config.courseGnmkdm}`,
  }
}

// 生成具体的API URL（支持传入schoolId参数，不依赖全局状态）
// 注意：此函数在服务器端调用时，URL配置可能不完整（因为无法访问localStorage）
// 服务器端应该使用 getApiUrlsAsync 函数
export function getApiUrls(schoolId?: string) {
  // 如果提供了schoolId，优先使用指定的学校
  let school: SchoolConfig | undefined

  if (schoolId) {
    // 先尝试从同步的学校列表中查找
    school = getSchoolById(schoolId)

    // 如果找不到，可能是新添加的学校，尝试从所有学校中查找（包括服务器同步的）
    if (!school && typeof window !== 'undefined') {
      console.warn(`⚠️ 根据 schoolId "${schoolId}" 找不到学校，尝试同步获取...`)
      // 注意：这里不能等待异步，所以先返回当前找到的，后台会同步
      // 如果还是没有，使用当前选择的学校，但记录警告
      school = getCurrentSchool()
      if (school.id !== schoolId) {
        console.error(`❌ 严重错误：找不到学校 ID "${schoolId}"，当前使用的是 "${school.id}" (${school.name})`)
        console.error(`❌ 这可能是因为学校尚未同步到客户端，请稍后重试或刷新页面`)
      }
    }
  } else {
    school = getCurrentSchool()
  }

  // 确保使用的是正确的学校配置，而不是默认的
  if (!school || !school.domain) {
    console.error('❌ 获取学校配置失败，使用默认学校')
    const defaultSchool = DEFAULT_SCHOOL
    const baseUrl = `${defaultSchool.protocol}://${defaultSchool.domain}`
    const urlConfig = getSchoolUrlConfig(defaultSchool.id)
    return generateApiUrls(baseUrl, urlConfig, defaultSchool)
  }

  // 验证学校ID是否匹配（如果提供了schoolId）
  if (schoolId && school.id !== schoolId) {
    console.error(`❌ 学校ID不匹配：请求的是 "${schoolId}"，但实际使用的是 "${school.id}" (${school.name})`)
    console.error(`❌ 这可能导致使用了错误的学校域名！`)
  }

  const baseUrl = `${school.protocol}://${school.domain}`
  const urlConfig = getSchoolUrlConfig(school.id)

  // 调试日志：检查URL配置是否正确
  console.log(`🔍 ========== 生成API URL ==========`)
  console.log(`🔍 请求的 schoolId: ${schoolId || '(未指定，使用当前学校)'}`)
  console.log(`🔍 实际使用的学校: ${school.name} (${school.id})`)
  console.log(`🔍 学校域名: ${school.domain}, 协议: ${school.protocol}`)
  console.log(`🔍 基础URL: ${baseUrl}`)
  console.log(`🔍 URL配置:`, urlConfig)
  console.log(`🔍 =================================`)

  // 如果URL配置为空且不是默认学校，警告用户
  if (!urlConfig || Object.keys(urlConfig).length === 0) {
    const isDefault = DEFAULT_SCHOOL_URL_CONFIG[school.id]
    if (!isDefault) {
      console.warn(`⚠️ 警告：学校 "${school.name}" (${school.id}) 没有配置URL参数，某些功能可能不可用`)
      console.warn(`⚠️ 请在后台管理中为学校 "${school.name}" 配置 gradeGnmkdm、courseGnmkdm、scheduleGnmkdm 参数`)
    }
  }

  return generateApiUrls(baseUrl, urlConfig, school)
}

// 提取URL生成逻辑为独立函数
function generateApiUrls(baseUrl: string, urlConfig: {
  gradeGnmkdm?: string
  courseGnmkdm?: string
  scheduleGnmkdm?: string
}, school: SchoolConfig) {

  return {
    // 学生信息
    studentInfo: `${baseUrl}/jwglxt/xtgl/index_cxYhxxIndex.html?xt=jw&localeKey=zh_CN&_=${Date.now()}&gnmkdm=index`,

    // 选课参数
    courseSelectionParams: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbIndex.html?gnmkdm=${urlConfig.courseGnmkdm}&layout=default&su=${school.domain}`,

    // 选课显示页面（用于获取完整参数）
    courseSelectionDisplay: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbDisplay.html?gnmkdm=${urlConfig.courseGnmkdm}`,

    // 可选课程
    availableCourses: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbPartDisplay.html?gnmkdm=${urlConfig.courseGnmkdm}`,

    // 已选课程
    selectedCourses: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbChoosedDisplay.html?gnmkdm=${urlConfig.courseGnmkdm}`,

    // 课表参数
    scheduleParams: `${baseUrl}/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=${urlConfig.scheduleGnmkdm}`,

    // 课表数据
    scheduleData: `${baseUrl}/jwglxt/kbcx/xskbcx_cxXsKb.html?gnmkdm=${urlConfig.scheduleGnmkdm}`,

    // 成绩查询（根据学校配置）
    gradeQuery: `${baseUrl}/jwglxt/cjcx/cjcx_cxXsgrcj.html?doType=query&gnmkdm=${urlConfig.gradeGnmkdm}`,
    gradePage: `${baseUrl}/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=${urlConfig.gradeGnmkdm}&layout=default`,

    // 总体成绩查询
    overallGradeIndex: `${baseUrl}/jwglxt/xsxy/xsxyqk_cxXsxyqkIndex.html?gnmkdm=N105515&layout=default`,
    overallGradeQuery: `${baseUrl}/jwglxt/xsxy/xsxyqk_cxJxzxjhxfyqKcxx.html?gnmkdm=N105515`,

    // 选课执行
    courseSelection: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzb.html?gnmkdm=${urlConfig.courseGnmkdm}&su=${school.domain}`,

    // Referer头
    getRefererHeader: (type: 'course' | 'schedule' | 'student' | 'grade' | 'overallGrade') => {
      switch (type) {
        case 'course':
          return `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbIndex.html?gnmkdm=${urlConfig.courseGnmkdm}&layout=default&su=${school.domain}`
        case 'schedule':
          return `${baseUrl}/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=${urlConfig.scheduleGnmkdm}`
        case 'student':
          return `${baseUrl}/jwglxt/xtgl/index_initMenu.html`
        case 'grade':
          return `${baseUrl}/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=${urlConfig.gradeGnmkdm}&layout=default`
        case 'overallGrade':
          return `${baseUrl}/jwglxt/xsxy/xsxyqk_cxXsxyqkIndex.html?gnmkdm=N105515&layout=default`
        default:
          return baseUrl
      }
    }
  }
}

// 异步版本的API URL生成函数（支持服务器端获取URL配置）
export async function getApiUrlsAsync(schoolId?: string) {
  let school: SchoolConfig | undefined

  // 在服务器端，从文件或COS加载学校列表
  if (typeof window === 'undefined') {
    if (schoolId) {
      // 从服务器加载学校列表（强制刷新，不使用缓存）
      const schools = await getSchoolsFromServer()

      console.log(`🔍 [服务器端] 请求的 schoolId: "${schoolId}"`)
      console.log(`🔍 [服务器端] 已加载 ${schools.length} 所学校`)
      console.log(`🔍 [服务器端] 学校列表:`, schools.map((s: SchoolConfig) => `${s.name} (${s.id})`).join(', '))

      school = schools.find(s => s.id === schoolId)

      if (!school) {
        console.error(`❌ 服务器端：找不到学校 ID "${schoolId}"`)
        console.error(`❌ 可用的学校列表:`, schools.map((s: SchoolConfig) => `${s.name} (${s.id})`).join(', '))
        console.error(`❌ 这可能是数据同步问题，请检查 schools.json 文件或 COS 存储`)
        // 使用默认学校
        school = DEFAULT_SCHOOL
        console.error(`❌ 回退到默认学校: ${school.name} (${school.id})`)
      } else {
        console.log(`✅ 服务器端：找到学校 ${school.name} (${school.id})，域名: ${school.domain}`)
        // 更新缓存，确保后续的 getSchoolById() 也能找到
        if (!serverSchoolsCache || !serverSchoolsCache.find(s => s.id === schoolId)) {
          serverSchoolsCache = schools
          serverSchoolsCacheTime = Date.now()
          console.log(`✅ 服务器端：已更新学校列表缓存`)
        }
      }
    } else {
      // 未提供schoolId，使用默认学校
      school = DEFAULT_SCHOOL
      console.warn('⚠️ 服务器端：未提供 schoolId，使用默认学校')
    }
  } else {
    // 客户端：使用原有逻辑
    school = schoolId ? (getSchoolById(schoolId) || getCurrentSchool()) : getCurrentSchool()
  }

  if (!school || !school.domain) {
    console.error('❌ 获取学校配置失败，使用默认学校')
    school = DEFAULT_SCHOOL
  }

  const baseUrl = `${school.protocol}://${school.domain}`
  const urlConfig = await getSchoolUrlConfigAsync(school.id)

  // 服务器端调试日志
  if (typeof window === 'undefined') {
    console.log(`🔍 ========== [服务器端] 生成API URL ==========`)
    console.log(`🔍 [服务器端] 学校: ${school.name} (${school.id})`)
    console.log(`🔍 [服务器端] 域名: ${school.domain}, 协议: ${school.protocol}`)
    console.log(`🔍 [服务器端] 基础URL: ${baseUrl}`)
    console.log(`🔍 [服务器端] URL配置:`, urlConfig)
    console.log(`🔍 ============================================`)
  }

  return {
    // 学生信息
    studentInfo: `${baseUrl}/jwglxt/xtgl/index_cxYhxxIndex.html?xt=jw&localeKey=zh_CN&_=${Date.now()}&gnmkdm=index`,

    // 选课参数
    courseSelectionParams: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbIndex.html?gnmkdm=${urlConfig.courseGnmkdm}&layout=default&su=${school.domain}`,

    // 选课显示页面（用于获取完整参数）
    courseSelectionDisplay: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbDisplay.html?gnmkdm=${urlConfig.courseGnmkdm}`,

    // 可选课程
    availableCourses: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbPartDisplay.html?gnmkdm=${urlConfig.courseGnmkdm}`,

    // 已选课程
    selectedCourses: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbChoosedDisplay.html?gnmkdm=${urlConfig.courseGnmkdm}`,

    // 课表参数
    scheduleParams: `${baseUrl}/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=${urlConfig.scheduleGnmkdm}`,

    // 课表数据
    scheduleData: `${baseUrl}/jwglxt/kbcx/xskbcx_cxXsKb.html?gnmkdm=${urlConfig.scheduleGnmkdm}`,

    // 成绩查询（根据学校配置）
    gradeQuery: `${baseUrl}/jwglxt/cjcx/cjcx_cxXsgrcj.html?doType=query&gnmkdm=${urlConfig.gradeGnmkdm}`,
    gradePage: `${baseUrl}/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=${urlConfig.gradeGnmkdm}&layout=default`,

    // 总体成绩查询
    overallGradeIndex: `${baseUrl}/jwglxt/xsxy/xsxyqk_cxXsxyqkIndex.html?gnmkdm=N105515&layout=default`,
    overallGradeQuery: `${baseUrl}/jwglxt/xsxy/xsxyqk_cxJxzxjhxfyqKcxx.html?gnmkdm=N105515`,

    // 选课执行
    courseSelection: `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzb.html?gnmkdm=${urlConfig.courseGnmkdm}&su=${school.domain}`,

    // Referer头
    getRefererHeader: (type: 'course' | 'schedule' | 'student' | 'grade' | 'overallGrade') => {
      switch (type) {
        case 'course':
          return `${baseUrl}/jwglxt/xsxk/zzxkyzb_cxZzxkYzbIndex.html?gnmkdm=${urlConfig.courseGnmkdm}&layout=default&su=${school.domain}`
        case 'schedule':
          return `${baseUrl}/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=${urlConfig.scheduleGnmkdm}`
        case 'student':
          return `${baseUrl}/jwglxt/xtgl/index_initMenu.html`
        case 'grade':
          return `${baseUrl}/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=${urlConfig.gradeGnmkdm}&layout=default`
        case 'overallGrade':
          return `${baseUrl}/jwglxt/xsxy/xsxyqk_cxXsxyqkIndex.html?gnmkdm=N105515&layout=default`
        default:
          return baseUrl
      }
    }
  }
}

// 调试信息
export function getDebugInfo() {
  const school = getCurrentSchool()
  const urls = getApiUrls()

  return {
    currentSchool: school,
    urls: urls,
    localStorage: typeof window !== 'undefined' ? localStorage.getItem('selected-school-id') : 'N/A'
  }
}
