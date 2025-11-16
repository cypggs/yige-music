'use client'

// 亦歌主页 - 原版复刻（紧凑列表式设计）

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Track, UserAction } from '@/lib/types'
import { getUserId, getSessionId, formatDuration } from '@/lib/utils'

const MIN_QUEUE_LENGTH = 2
const FETCH_COUNT = 30

type Tab = 'hot' | 'favorites' | 'recent'

export default function HomePage() {
  const [queue, setQueue] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [favorites, setFavorites] = useState<Track[]>([])
  const [userId, setUserId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentTab, setCurrentTab] = useState<Tab>('hot')
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<'lightblue' | 'red' | 'blue' | 'black'>('lightblue')

  // 播放器状态
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // 初始化
  useEffect(() => {
    setUserId(getUserId())
    setSessionId(getSessionId())
    const savedTheme = localStorage.getItem('yige_theme') as any
    if (savedTheme) setTheme(savedTheme)
  }, [])

  // 获取推荐
  const fetchRecommendations = useCallback(async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/reco?userId=${userId}&count=${FETCH_COUNT}`)
      const data = await response.json()
      if (data.success && data.tracks.length > 0) {
        setQueue(prev => [...prev, ...data.tracks])
        setError('')
        return data.tracks
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setError('网络错误')
      return []
    }
  }, [userId])

  // 初始化加载
  useEffect(() => {
    if (!userId) return
    const init = async () => {
      setIsLoading(true)
      const tracks = await fetchRecommendations()
      if (tracks.length > 0) {
        setCurrentTrack(tracks[0])
      }
      setIsLoading(false)
    }
    init()
  }, [userId, fetchRecommendations])

  // 自动补充队列
  useEffect(() => {
    if (queue.length <= MIN_QUEUE_LENGTH && !isLoading && userId) {
      fetchRecommendations()
    }
  }, [queue.length, isLoading, userId, fetchRecommendations])

  // 记录事件
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
        }),
      })
    } catch (err) {
      console.error('Failed to record event:', err)
    }
  }, [userId, currentTrack, sessionId])

  // 播放控制
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.src = currentTrack.audio_url
    audio.load()

    const playPromise = audio.play()
    if (playPromise) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          recordEvent('play')
        })
        .catch(() => setIsPlaying(false))
    }

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnd = () => handleNext()

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnd)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnd)
    }
  }, [currentTrack])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleNext = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id)
    if (currentIndex !== -1 && currentIndex + 1 < queue.length) {
      setCurrentTrack(queue[currentIndex + 1])
      setQueue(prev => prev.slice(currentIndex + 1))
      recordEvent('complete')
    }
  }

  const handleSkip = () => {
    recordEvent('skip')
    handleNext()
  }

  const handleLock = () => {
    recordEvent('lock')
  }

  const handleFavorite = () => {
    if (!currentTrack) return
    const isFav = favorites.some(f => f.id === currentTrack.id)
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== currentTrack.id))
      recordEvent('unfavorite')
    } else {
      setFavorites(prev => [...prev, currentTrack])
      recordEvent('favorite')
    }
  }

  const handleBlacklist = () => {
    if (!currentTrack?.artist) return
    if (confirm(`确定要将 "${currentTrack.artist.name}" 加入黑名单吗？`)) {
      recordEvent('blacklist')
      handleNext()
    }
  }

  const handleTrackClick = (track: Track) => {
    const trackIndex = queue.findIndex(t => t.id === track.id)
    if (trackIndex !== -1) {
      setCurrentTrack(track)
      setQueue(prev => prev.slice(trackIndex))
    }
  }

  const themes = {
    lightblue: { bg: '#b8d4e8', headerBg: '#a8c4d8', text: '#333', highlight: '#ffeb3b' },
    red: { bg: '#fce4ec', headerBg: '#f8bbd0', text: '#333', highlight: '#ffeb3b' },
    blue: { bg: '#e3f2fd', headerBg: '#bbdefb', text: '#333', highlight: '#ffeb3b' },
    black: { bg: '#1a1a1a', headerBg: '#2a2a2a', text: '#f0f0f0', highlight: '#ffeb3b' },
  }

  const currentTheme = themes[theme]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: currentTheme.bg }}>
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p>正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: currentTheme.bg, color: currentTheme.text, fontFamily: 'Arial, sans-serif' }}>
      <audio ref={audioRef} />

      {/* 顶部用户区 */}
      <div className="flex items-center justify-between px-6 py-2 text-xs" style={{ background: currentTheme.headerBg, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">亦歌</h1>
          <span className="text-[10px] opacity-60">Beta</span>
        </div>
        <div className="flex items-center gap-3">
          <span>欢迎您</span>
          <span className="opacity-60 cursor-pointer hover:opacity-100">帮助</span>
          <div className="flex gap-1">
            <button onClick={() => {setTheme('lightblue'); localStorage.setItem('yige_theme', 'lightblue')}} className="theme-btn" style={{ background: '#5fb7d4' }} title="淡蓝" />
            <button onClick={() => {setTheme('red'); localStorage.setItem('yige_theme', 'red')}} className="theme-btn" style={{ background: '#e57373' }} title="红色" />
            <button onClick={() => {setTheme('blue'); localStorage.setItem('yige_theme', 'blue')}} className="theme-btn" style={{ background: '#42a5f5' }} title="蓝色" />
            <button onClick={() => {setTheme('black'); localStorage.setItem('yige_theme', 'black')}} className="theme-btn" style={{ background: '#2a2a2a' }} title="黑色" />
          </div>
        </div>
      </div>

      {/* 导航栏 */}
      <div className="flex items-center gap-6 px-6 py-2 text-xs" style={{ background: currentTheme.headerBg, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => setCurrentTab('hot')}
          className={`yige-tab ${currentTab === 'hot' ? 'active' : ''}`}
        >
          <span>🎵</span> 百度热门
        </button>
        <button
          onClick={() => setCurrentTab('favorites')}
          className={`yige-tab ${currentTab === 'favorites' ? 'active' : ''}`}
        >
          <span>⭐</span> 我的收藏 ({favorites.length})
        </button>
        <button
          onClick={() => setCurrentTab('recent')}
          className={`yige-tab ${currentTab === 'recent' ? 'active' : ''}`}
        >
          <span>🔄</span> 刚刚听过
        </button>
        <div className="flex-1"></div>
        <input
          type="text"
          placeholder="搜索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="yige-input"
        />
        <button className="yige-btn">
          搜索
        </button>
      </div>

      {/* 主体内容 - 3列布局 */}
      <div className="grid grid-cols-[450px_1fr_400px] gap-4 p-4 h-[calc(100vh-120px)]">
        {/* 左侧：播放器 + 播放列表 */}
        <div className="flex flex-col gap-3">
          {/* 播放器 */}
          <div className="yige-player">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={togglePlay} className="yige-player-btn text-base">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button onClick={handleNext} className="yige-player-btn text-sm">⏭</button>
              <div className="flex-1 text-[10px]">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
              <button className="text-sm opacity-70 hover:opacity-100">🔊</button>
            </div>
            <div className="yige-progress" onClick={(e) => {
              const audio = audioRef.current
              if (audio && duration) {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const percent = x / rect.width
                audio.currentTime = duration * percent
              }
            }}>
              <div className="yige-progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>
          </div>

          {/* 播放列表 */}
          <div className="flex-1 yige-panel">
            <div className="yige-panel-header">
              播放列表 ({queue.length})
            </div>
            <div className="overflow-y-auto h-[calc(100%-28px)]">
              {queue.slice(0, 20).map((track, index) => {
                const isCurrent = track.id === currentTrack?.id
                return (
                  <div
                    key={`${track.id}-${index}`}
                    onClick={() => handleTrackClick(track)}
                    className={`yige-list-item cursor-pointer flex items-center gap-1 ${isCurrent ? 'active' : ''}`}
                  >
                    <span className="w-4 text-center opacity-50 text-[10px]">{isCurrent ? '▶' : index + 1}</span>
                    <span className="flex-1 truncate">{track.title}</span>
                    <span className="text-[10px] opacity-60 whitespace-nowrap">{track.artist?.name}</span>
                    {isCurrent && (
                      <div className="flex gap-0.5 ml-1">
                        <button onClick={(e) => { e.stopPropagation(); handleLock(); }} className="yige-icon-btn" title="锁定">🔒</button>
                        <button onClick={(e) => { e.stopPropagation(); handleFavorite(); }} className="yige-icon-btn" title="收藏">⭐</button>
                        <button onClick={(e) => { e.stopPropagation(); handleBlacklist(); }} className="yige-icon-btn" title="删除">❌</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 中间：播放区 */}
        <div className="yige-panel">
          <div className="yige-panel-header">
            播放区
          </div>
          <div className="p-4">
            {currentTrack ? (
              <div className="space-y-3">
                <div className="text-center">
                  <img
                    src={currentTrack.cover_url || 'https://picsum.photos/200'}
                    alt={currentTrack.title}
                    className="w-48 h-48 mx-auto rounded shadow-lg"
                  />
                  <h2 className="text-lg font-bold mt-4">{currentTrack.title}</h2>
                  <p className="text-xs opacity-70">{currentTrack.artist?.name}</p>
                  {currentTrack.album && <p className="text-[10px] opacity-50 mt-1">{currentTrack.album}</p>}
                </div>
                <div className="flex gap-2 justify-center mt-4">
                  <button onClick={handleLock} className="yige-btn">
                    🔒 锁定
                  </button>
                  <button onClick={handleFavorite} className="yige-btn">
                    ⭐ 收藏
                  </button>
                  <button onClick={handleSkip} className="yige-btn">
                    ⏭ 跳过
                  </button>
                  <button onClick={handleBlacklist} className="yige-btn">
                    ❌ 黑名单
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs opacity-50 py-20">
                暂无播放内容
              </div>
            )}
          </div>
        </div>

        {/* 右侧：我的收藏 */}
        <div className="yige-panel">
          <div className="yige-panel-header">
            我的收藏 ({favorites.length})
          </div>
          <div className="overflow-y-auto h-[calc(100%-28px)]">
            {favorites.length === 0 ? (
              <div className="text-center text-[10px] opacity-50 py-10">
                暂无收藏
              </div>
            ) : (
              favorites.map((track) => (
                <div
                  key={track.id}
                  className="yige-list-item cursor-pointer flex items-center gap-1"
                  onClick={() => handleTrackClick(track)}
                >
                  <span className="flex-1 truncate">{track.title}</span>
                  <span className="text-[10px] opacity-60 whitespace-nowrap">{track.artist?.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (currentTrack?.id === track.id) {
                        handleFavorite()
                      }
                    }}
                    className="yige-icon-btn"
                  >
                    ➕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="text-center text-xs opacity-50 py-2">
        亦歌 - 零输入自动播放 · 队列剩余 {queue.length} 首
      </div>
    </div>
  )
}
