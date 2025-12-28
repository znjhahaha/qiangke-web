// 学校配置接口
export interface SchoolConfig {
  id: string
  name: string
  domain: string
  jwglxtPath: string
  description?: string
  protocol?: string
  basePath?: string  // 基础路径，如 /jwglxt 或为空
}

// 支持的学校列表
export const SUPPORTED_SCHOOLS: SchoolConfig[] = [
  {
    id: 'tyust',
    name: '太原科技大学',
    domain: 'newjwc.tyust.edu.cn',
    jwglxtPath: '/jwglxt/xtgl',
    description: '太原科技大学教务系统',
    protocol: 'https',
    basePath: '/jwglxt'
  },
  {
    id: 'zjut',
    name: '浙江工业大学',
    domain: 'www.gdjw.zjut.edu.cn',
    jwglxtPath: '/jwglxt/xtgl',
    description: '浙江工业大学教务系统',
    protocol: 'http',
    basePath: '/jwglxt'
  }
]

// 默认学校
export const DEFAULT_SCHOOL = SUPPORTED_SCHOOLS[0]

// 获取学校完整URL
export function getSchoolBaseUrl(school: SchoolConfig): string {
  const protocol = school.protocol || 'https'
  const basePath = school.basePath !== undefined ? school.basePath : '/jwglxt'
  return `${protocol}://${school.domain}${basePath}`
}

// 获取学校登录页面URL
export function getSchoolLoginUrl(school: SchoolConfig): string {
  const protocol = school.protocol || 'https'
  const basePath = school.basePath !== undefined ? school.basePath : '/jwglxt'
  return `${protocol}://${school.domain}${basePath}/xtgl/login_slogin.html`
}

// 获取学校主页URL
export function getSchoolHomeUrl(school: SchoolConfig): string {
  const protocol = school.protocol || 'https'
  const basePath = school.basePath !== undefined ? school.basePath : '/jwglxt'
  return `${protocol}://${school.domain}${basePath}/xtgl/index_initMenu.html`
}

// 根据ID获取学校配置
export function getSchoolById(id: string): SchoolConfig | undefined {
  return SUPPORTED_SCHOOLS.find(school => school.id === id)
}

// 获取当前选中的学校（从localStorage）
export function getCurrentSchool(): SchoolConfig {
  if (typeof window !== 'undefined') {
    try {
      const savedSchoolId = localStorage.getItem('selected-school-id')
      console.log(`🔍 getCurrentSchool() - localStorage中的学校ID: ${savedSchoolId}`)
      if (savedSchoolId) {
        const school = getSchoolById(savedSchoolId)
        if (school) {
          console.log(`✅ 找到学校配置: ${school.name} (${school.id})`)
          return school
        }
      }
    } catch (error) {
      console.error('获取学校配置失败:', error)
    }
  } else {
    console.log('🔍 getCurrentSchool() - 服务器端环境，返回默认学校')
  }
  console.log(`🔍 getCurrentSchool() - 返回默认学校: ${DEFAULT_SCHOOL.name}`)
  return DEFAULT_SCHOOL
}

// 保存选中的学校到localStorage
export function saveCurrentSchool(school: SchoolConfig): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('selected-school-id', school.id)
    } catch (error) {
      console.error('保存学校配置失败:', error)
    }
  }
}
