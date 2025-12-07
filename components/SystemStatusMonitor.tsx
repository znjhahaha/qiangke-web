'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentSchool } from '@/lib/global-school-state'

type StatusType = 'smooth' | 'laggy' | 'unresponsive' | 'loading'

export default function SystemStatusMonitor() {
    const [latency, setLatency] = useState<number | null>(null)
    const [status, setStatus] = useState<StatusType>('loading')
    const [schoolName, setSchoolName] = useState('')
    const [minimized, setMinimized] = useState(false)

    // 轮询检查状态
    useEffect(() => {
        let isMounted = true

        const checkStatus = async () => {
            // 每次检查时重新获取当前学校（处理切换）
            const school = getCurrentSchool()
            if (!school) return

            if (typeof document !== 'undefined' && document.hidden) return // 页面不可见时不轮询

            setSchoolName(school.name)

            try {
                const res = await fetch(`/api/ping?schoolId=${school.id}`)
                const data = await res.json()

                if (isMounted) {
                    if (data.success) {
                        setLatency(data.latency)
                        setStatus(data.quality)
                    } else {
                        setLatency(null)
                        setStatus('unresponsive')
                    }
                }
            } catch (e) {
                if (isMounted) {
                    setLatency(null)
                    setStatus('unresponsive')
                }
            }
        }

        // 初始检查
        checkStatus()

        // 每 5 秒轮询一次
        const interval = setInterval(checkStatus, 5000)

        // 监听 storage 事件以响应学校切换（多标签页）
        const handleStorage = () => {
            checkStatus()
        }
        window.addEventListener('storage', handleStorage)

        return () => {
            isMounted = false
            clearInterval(interval)
            window.removeEventListener('storage', handleStorage)
        }
    }, [])

    // 状态配置
    const config = {
        smooth: {
            color: 'bg-emerald-500',
            text: 'text-emerald-500',
            label: '流畅',
            icon: (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        laggy: {
            color: 'bg-amber-500',
            text: 'text-amber-500',
            label: '卡顿',
            icon: (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        unresponsive: {
            color: 'bg-red-500',
            text: 'text-red-500',
            label: '未响应',
            icon: (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        },
        loading: {
            color: 'bg-gray-400',
            text: 'text-gray-400',
            label: '连接中...',
            icon: (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            )
        }
    }

    const currentConfig = config[status]

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-24 right-6 z-40 flex flex-col items-end pointer-events-none"
        >
            {/* 主要状态显示 */}
            <div
                className={`
            pointer-events-auto cursor-pointer
            flex items-center gap-2 px-4 py-2 rounded-full 
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-md 
            shadow-lg border border-white/20 dark:border-slate-700/50
            transition-all duration-300 hover:scale-105 active:scale-95
            ${minimized ? 'w-10 h-10 justify-center p-0' : ''}
          `}
                onClick={() => setMinimized(!minimized)}
            >
                {/* 指示灯 */}
                <div className="relative flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${currentConfig.color} ${status === 'unresponsive' ? 'animate-pulse' : ''}`}></div>
                    {status === 'smooth' && (
                        <div className={`absolute w-3 h-3 rounded-full ${currentConfig.color} animate-ping opacity-20`}></div>
                    )}
                </div>

                <AnimatePresence>
                    {!minimized && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="flex items-center gap-2 overflow-hidden whitespace-nowrap pl-1"
                        >
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {schoolName || '教务系统'}
                            </span>

                            <div className={`flex items-center gap-1 text-sm font-bold ${currentConfig.text}`}>
                                {currentConfig.label}
                                {latency !== null && latency >= 0 && (
                                    <span className="text-xs opacity-80 font-normal ml-1">
                                        {latency}ms
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 卡顿或未响应时的额外提示 */}
            <AnimatePresence>
                {(status === 'laggy' || status === 'unresponsive') && !minimized && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-center"
                    >
                        <span className={`inline-block px-2 py-1 text-[10px] rounded-md font-medium shadow-sm backdrop-blur-sm ${status === 'unresponsive' ? 'bg-red-100/90 text-red-700' : 'bg-amber-100/90 text-amber-700'}`}>
                            {status === 'unresponsive' ? '无法连接到服务器，请检查网络' : '网络状况一般，操作可能延迟'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
