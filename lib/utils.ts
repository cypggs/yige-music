// 工具函数

import { v4 as uuidv4 } from 'uuid'

/**
 * 获取或生成用户 ID（基于浏览器指纹）
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server'

  const storageKey = 'yige_user_id'
  let userId = localStorage.getItem(storageKey)

  if (!userId) {
    // 生成简单的浏览器指纹
    const fingerprint = `${navigator.userAgent}_${navigator.language}_${screen.width}x${screen.height}`
    userId = btoa(fingerprint).slice(0, 32)
    localStorage.setItem(storageKey, userId)
  }

  return userId
}

/**
 * 获取会话 ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'

  const storageKey = 'yige_session_id'
  let sessionId = sessionStorage.getItem(storageKey)

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(storageKey, sessionId)
  }

  return sessionId
}

/**
 * 格式化时长（秒 -> MM:SS）
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于 1 分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于 1 小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  }
  // 小于 1 天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  }
  // 否则显示日期
  return date.toLocaleDateString('zh-CN')
}

/**
 * Shuffle 数组
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
