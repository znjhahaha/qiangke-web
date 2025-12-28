'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, School, Globe, Lock, Info, Wand2, Link } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addSchoolLocally, type SchoolConfig } from '@/lib/admin-school-manager'
import toast from 'react-hot-toast'

interface AddSchoolDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddSchoolDialog({ isOpen, onClose, onSuccess }: AddSchoolDialogProps) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        domain: '',
        protocol: 'https' as 'http' | 'https',
        basePath: '/jwglxt',
        description: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [smartUrl, setSmartUrl] = useState('')

    // 智能 URL 解析函数
    const parseUrl = (url: string) => {
        if (!url.trim()) {
            toast.error('请输入 URL')
            return
        }

        try {
            let cleanUrl = url.trim()
            let protocol: 'http' | 'https' = 'https'

            // 提取协议
            if (cleanUrl.startsWith('https://')) {
                protocol = 'https'
                cleanUrl = cleanUrl.substring(8)
            } else if (cleanUrl.startsWith('http://')) {
                protocol = 'http'
                cleanUrl = cleanUrl.substring(7)
            }

            // 提取域名
            const pathStart = cleanUrl.indexOf('/')
            let domain: string
            let pathPart: string

            if (pathStart > 0) {
                domain = cleanUrl.substring(0, pathStart)
                pathPart = cleanUrl.substring(pathStart)
            } else {
                domain = cleanUrl
                pathPart = ''
            }

            // 移除域名中的端口号后面的查询参数
            domain = domain.split('?')[0].split('#')[0]

            // 智能识别 basePath
            let basePath = '/jwglxt'

            // 常见的正方教务系统基础路径
            const commonBasePaths = ['/jwglxt', '/jwxt', '/jwxs', '/jw', '/jwweb']
            let foundBasePath = false

            for (const commonPath of commonBasePaths) {
                if (pathPart.startsWith(commonPath + '/') || pathPart === commonPath) {
                    basePath = commonPath
                    foundBasePath = true
                    break
                }
            }

            // 如果没有找到常见路径，检查是否是直接模块访问（无基础路径）
            if (!foundBasePath && pathPart) {
                // 检查是否直接以模块路径开始
                const directModulePaths = ['/xsxk', '/cjcx', '/kbcx', '/xtgl', '/xsxy', '/login']
                for (const modulePath of directModulePaths) {
                    if (pathPart.startsWith(modulePath + '/') || pathPart === modulePath) {
                        basePath = ''  // 无基础路径
                        foundBasePath = true
                        break
                    }
                }
            }

            // 更新表单数据
            setFormData(prev => ({
                ...prev,
                domain,
                protocol,
                basePath
            }))

            toast.success(`识别成功！${basePath ? `基础路径: ${basePath}` : '无基础路径（短URL）'}`)
        } catch (error) {
            console.error('URL 解析错误:', error)
            toast.error('URL 格式无效')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const school: SchoolConfig = {
                id: formData.id.toLowerCase().trim(),
                name: formData.name.trim(),
                domain: formData.domain.toLowerCase().trim(),
                protocol: formData.protocol,
                basePath: formData.basePath.trim(),
                description: formData.description.trim() || `${formData.name}教务系统`
            }

            // 添加学校到本地
            await addSchoolLocally(school)

            toast.success(`学校 "${school.name}" 已添加成功！`)

            // 重置表单
            setFormData({
                id: '',
                name: '',
                domain: '',
                protocol: 'https',
                basePath: '/jwglxt',
                description: ''
            })
            setSmartUrl('')

            // 通知父组件刷新列表
            onSuccess()
            onClose()
        } catch (error: any) {
            // 友好的错误提示，不抛出异常
            console.error('添加学校失败:', error)
            toast.error(error.message || '添加学校失败')
        } finally {
            setIsSubmitting(false)
        }
    }

    // 自动从学校名称生成 ID
    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            // 自动生成 ID：拼音或英文简写
            id: prev.id || name.toLowerCase()
                .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
                .replace(/[^a-z0-9]/g, '_') // 替换非字母数字为下划线
                .replace(/_+/g, '_') // 合并连续下划线
                .replace(/^_|_$/g, '') // 移除首尾下划线
        }))
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                    <Card className="glass border-0 shadow-2xl">
                        <CardHeader className="relative border-b border-white/5 p-4 sm:p-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <Plus className="h-5 w-5 text-green-500" />
                                <span>添加学校</span>
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                添加自定义学校到本地（仅保存在您的浏览器中）
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* 智能 URL 识别 */}
                                <div className="space-y-2 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                                    <Label className="flex items-center space-x-2 text-purple-400">
                                        <Wand2 className="h-4 w-4" />
                                        <span>智能 URL 识别（推荐）</span>
                                    </Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="粘贴教务系统任意页面 URL"
                                            value={smartUrl}
                                            onChange={(e) => setSmartUrl(e.target.value)}
                                            className="bg-white/5 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => parseUrl(smartUrl)}
                                            className="shrink-0 border-purple-500/30 hover:bg-purple-500/20"
                                        >
                                            <Link className="h-4 w-4 mr-1" />
                                            识别
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        粘贴教务系统 URL，自动识别协议、域名和基础路径
                                    </p>
                                </div>

                                {/* 学校名称 */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center space-x-2">
                                        <School className="h-4 w-4 text-blue-500" />
                                        <span>学校名称 *</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="例如：北京大学"
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        required
                                        className="bg-white/5"
                                    />
                                </div>

                                {/* 学校 ID */}
                                <div className="space-y-2">
                                    <Label htmlFor="id" className="flex items-center space-x-2">
                                        <Info className="h-4 w-4 text-yellow-500" />
                                        <span>学校 ID *</span>
                                    </Label>
                                    <Input
                                        id="id"
                                        placeholder="例如：pku（小写字母、数字、下划线）"
                                        value={formData.id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value.toLowerCase() }))}
                                        pattern="[a-z0-9_]+"
                                        required
                                        className="bg-white/5"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        用于系统识别，只能包含小写字母、数字和下划线
                                    </p>
                                </div>

                                {/* 教务系统域名 */}
                                <div className="space-y-2">
                                    <Label htmlFor="domain" className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4 text-green-500" />
                                        <span>教务系统域名 *</span>
                                    </Label>
                                    <Input
                                        id="domain"
                                        placeholder="例如：dean.pku.edu.cn"
                                        value={formData.domain}
                                        onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value.toLowerCase() }))}
                                        required
                                        className="bg-white/5"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        教务系统的域名（不包含 http:// 或 https://）
                                    </p>
                                </div>

                                {/* 基础路径 */}
                                <div className="space-y-2">
                                    <Label htmlFor="basePath" className="flex items-center space-x-2">
                                        <Link className="h-4 w-4 text-orange-500" />
                                        <span>基础路径</span>
                                    </Label>
                                    <Input
                                        id="basePath"
                                        placeholder="例如：/jwglxt 或留空"
                                        value={formData.basePath}
                                        onChange={(e) => setFormData(prev => ({ ...prev, basePath: e.target.value }))}
                                        className="bg-white/5"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        教务系统基础路径，通常为 /jwglxt。如果系统没有基础路径，请留空。
                                    </p>
                                </div>

                                {/* 协议选择 */}
                                <div className="space-y-2">
                                    <Label className="flex items-center space-x-2">
                                        <Lock className="h-4 w-4 text-purple-500" />
                                        <span>访问协议 *</span>
                                    </Label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="protocol"
                                                value="https"
                                                checked={formData.protocol === 'https'}
                                                onChange={(e) => setFormData(prev => ({ ...prev, protocol: 'https' }))}
                                                className="text-green-500"
                                            />
                                            <span className="text-sm">HTTPS（推荐）</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="protocol"
                                                value="http"
                                                checked={formData.protocol === 'http'}
                                                onChange={(e) => setFormData(prev => ({ ...prev, protocol: 'http' }))}
                                            />
                                            <span className="text-sm">HTTP</span>
                                        </label>
                                    </div>
                                </div>

                                {/* 描述（可选） */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        描述（可选）
                                    </Label>
                                    <Input
                                        id="description"
                                        placeholder="例如：北京大学教务系统"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="bg-white/5"
                                    />
                                </div>

                                {/* 提示信息 */}
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <p className="text-xs text-blue-400 flex items-start space-x-2">
                                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span>
                                            添加的学校将只保存在您的浏览器本地存储中，不会同步到服务器。
                                            系统会自动使用默认参数，无需配置技术参数。
                                        </span>
                                    </p>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex space-x-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        取消
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/20 border border-green-500/20 transition-all duration-300 hover:scale-[1.02]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '添加中...' : '添加学校'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
