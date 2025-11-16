'use client'

// 亦歌主页 - 集成所有组件

import { useEffect, useState, useCallback } from 'react'
import MusicPlayer from '@/components/MusicPlayer'
import PlayQueue from '@/components/PlayQueue'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import type { Track, UserAction } from '@/lib/types'
import { getUserId, getSessionId } from '@/lib/utils'

const MIN_QUEUE_LENGTH = 2 // 当队列少于此数量时自动补充
const FETCH_COUNT = 20 // 每次获取推荐数量

export default function HomePage() {
  const [queue, setQueue] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // 初始化用户 ID 和会话 ID
  useEffect(() => {
    setUserId(getUserId())
    setSessionId(getSessionId())
  }, [])

  // 获取推荐曲目
  const fetchRecommendations = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/reco?userId=${userId}&count=${FETCH_COUNT}`)
      const data = await response.json()

      if (data.success && data.tracks.length > 0) {
        setQueue(prev => [...prev, ...data.tracks])
        setError('')
        return data.tracks
      } else {
        setError('无法获取推荐曲目')
        return []
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setError('网络错误，请稍后重试')
      return []
    }
  }, [userId])

  // 初始化：自动加载推荐并开始播放
  useEffect(() => {
    if (!userId) return

    const initPlayer = async () => {
      setIsLoading(true)
      const tracks = await fetchRecommendations()
      if (tracks.length > 0) {
        setCurrentTrack(tracks[0])
      }
      setIsLoading(false)
    }

    initPlayer()
  }, [userId, fetchRecommendations])

  // 自动补充队列（当队列长度 <= MIN_QUEUE_LENGTH 时）
  useEffect(() => {
    if (queue.length <= MIN_QUEUE_LENGTH && !isLoading && userId) {
      console.log('队列即将用尽，自动补充推荐...')
      fetchRecommendations()
    }
  }, [queue.length, isLoading, userId, fetchRecommendations])

  // 记录用户行为事件
  const recordEvent = useCallback(async (action: UserAction, playDuration?: number) => {
    if (!userId || !currentTrack) return

    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          trackId: currentTrack.id,
          artistId: currentTrack.artist_id,
          action,
          playDuration,
          sessionId,
          metadata: {
            queueLength: queue.length,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      console.log(`Event recorded: ${action}`, { trackId: currentTrack.id, playDuration })
    } catch (err) {
      console.error('Failed to record event:', err)
    }
  }, [userId, currentTrack, sessionId, queue.length])

  // 处理曲目结束（自动播放下一首）
  const handleTrackEnd = useCallback(() => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < queue.length) {
      // 播放下一首
      setCurrentTrack(queue[nextIndex])
      // 从队列中移除已播放的曲目
      setQueue(prev => prev.slice(nextIndex))
    } else {
      // 队列已空，等待自动补充
      setCurrentTrack(null)
      setQueue([])
    }
  }, [queue, currentTrack])

  // 手动选择曲目
  const handleTrackSelect = useCallback((track: Track) => {
    const trackIndex = queue.findIndex(t => t.id === track.id)
    if (trackIndex !== -1) {
      setCurrentTrack(track)
      // 重新排列队列，将选中的曲目移到最前面
      setQueue(prev => prev.slice(trackIndex))
    }
  }, [queue])

  // Loading 状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <h2 className="text-xl font-bold mb-2">亦歌</h2>
          <p className="text-sm opacity-70">正在加载音乐...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error && !currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold mb-2 text-red-600">出错了</h2>
          <p className="text-sm opacity-70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-black border-opacity-10">
        <div>
          <h1 className="text-3xl font-bold">亦歌</h1>
          <p className="text-sm opacity-70 mt-1">零输入，自动播放 · 行为驱动推荐</p>
        </div>
        <ThemeSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left: Player (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <MusicPlayer
              currentTrack={currentTrack}
              queue={queue}
              onTrackEnd={handleTrackEnd}
              onEvent={recordEvent}
            />
          </div>
        </div>

        {/* Right: Queue (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <PlayQueue
              queue={queue}
              currentTrack={currentTrack}
              onTrackSelect={handleTrackSelect}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm opacity-70 border-t border-black border-opacity-10">
        <p>
          亦歌（1g1g）复刻版 · 使用现代 Web 技术重现经典
        </p>
        <p className="mt-1 text-xs">
          Generated with{' '}
          <a
            href="https://claude.com/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-100"
          >
            Claude Code
          </a>
        </p>
      </footer>
    </div>
  )
}
