import { SchoolConfig, getSchoolBaseUrl } from './school-config'

// 动态URL配置类
export class UrlConfig {
  private school: SchoolConfig

  constructor(school: SchoolConfig) {
    this.school = school
  }

  // 获取基础路径
  get basePath(): string {
    return this.school.basePath !== undefined ? this.school.basePath : '/jwglxt'
  }

  // 获取基础URL
  get baseUrl(): string {
    return getSchoolBaseUrl(this.school)
  }

  // 获取完整域名
  get domain(): string {
    const protocol = this.school.protocol || 'https'
    return `${protocol}://${this.school.domain}`
  }

  // 获取完整基础路径（域名 + basePath）
  get fullBasePath(): string {
    return `${this.domain}${this.basePath}`
  }

  // 登录相关URL
  get loginPageUrl(): string {
    return `${this.fullBasePath}/xtgl/login_slogin.html`
  }

  get loginUrl(): string {
    return `${this.fullBasePath}/xtgl/login_slogin.html`
  }

  get homeUrl(): string {
    return `${this.fullBasePath}/xtgl/index_initMenu.html`
  }

  // 课程选择相关URL
  get courseSelectionIndexUrl(): string {
    return `${this.fullBasePath}/xsxk/zzxkyzb_cxZzxkYzbIndex.html?gnmkdm=N253512&layout=default&su=${this.school.domain}`
  }

  get courseSelectionUrl(): string {
    return `${this.fullBasePath}/xsxk/zzxkyzb_cxZzxkYzb.html?gnmkdm=N253512`
  }

  get courseSelectionParamsUrl(): string {
    return `${this.fullBasePath}/xsxk/zzxkyzb_cxZzxkYzbIndex.html?gnmkdm=N253512&layout=default&su=${this.school.domain}`
  }

  get courseSelectionExecuteUrl(): string {
    return `${this.fullBasePath}/xsxk/zzxkyzb_cxZzxkYzb.html?gnmkdm=N253512`
  }

  get courseSelectionVerifyUrl(): string {
    return `${this.fullBasePath}/xsxk/zzxkyzb_cxZzxkYzb.html?gnmkdm=N253512`
  }

  // 课表相关URL
  get scheduleIndexUrl(): string {
    return `${this.fullBasePath}/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=N253508&layout=default`
  }

  get scheduleUrl(): string {
    return `${this.fullBasePath}/kbcx/xskbcx_cxXsKb.html?gnmkdm=N253508`
  }

  // 学生信息相关URL
  get studentInfoUrl(): string {
    return `${this.fullBasePath}/xsxxxggl/xsgrxxwh_cxXsgrxx.html?gnmkdm=N100801&layout=default&su=${this.school.domain}`
  }

  // 获取Referer头
  getRefererHeader(urlType: 'course' | 'schedule' | 'student'): string {
    switch (urlType) {
      case 'course':
        return this.courseSelectionIndexUrl
      case 'schedule':
        return this.scheduleIndexUrl
      case 'student':
        return this.studentInfoUrl
      default:
        return this.homeUrl
    }
  }

  // 更新学校配置
  updateSchool(school: SchoolConfig): void {
    this.school = school
  }

  // 获取当前学校信息
  getCurrentSchool(): SchoolConfig {
    return this.school
  }
}

// 全局URL配置实例
let globalUrlConfig: UrlConfig | null = null

// 获取全局URL配置
export function getUrlConfig(school?: SchoolConfig): UrlConfig {
  if (!globalUrlConfig || (school && school.id !== globalUrlConfig.getCurrentSchool().id)) {
    if (school) {
      globalUrlConfig = new UrlConfig(school)
    } else {
      // 如果没有提供学校，从localStorage获取当前学校
      const { getCurrentSchool } = require('./school-config')
      const currentSchool = getCurrentSchool()
      globalUrlConfig = new UrlConfig(currentSchool)
    }
  } else if (!school) {
    // 即使没有提供school参数，也要检查localStorage中的学校是否已更改
    const { getCurrentSchool } = require('./school-config')
    const currentSchool = getCurrentSchool()
    if (globalUrlConfig.getCurrentSchool().id !== currentSchool.id) {
      console.log(`🔄 检测到学校变更: ${globalUrlConfig.getCurrentSchool().name} -> ${currentSchool.name}`)
      globalUrlConfig = new UrlConfig(currentSchool)
    }
  }

  // 添加调试信息
  if (!school) {
    console.log(`🔍 getUrlConfig() 返回: ${globalUrlConfig.getCurrentSchool().name} - ${globalUrlConfig.domain}`)
  }

  return globalUrlConfig
}

// 更新全局URL配置
export function updateUrlConfig(school: SchoolConfig): void {
  console.log(`🔄 更新URL配置: ${school.name} (${school.domain})`)
  globalUrlConfig = new UrlConfig(school)
  console.log(`✅ URL配置已更新: ${globalUrlConfig.domain}`)
}
