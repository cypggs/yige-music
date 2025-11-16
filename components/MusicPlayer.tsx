'use client'

// 音乐播放器组件 - 亦歌核心组件

import { useEffect, useRef, useState } from 'react'
import type { Track } from '@/lib/types'
import { getUserId, getSessionId, formatDuration } from '@/lib/utils'

interface MusicPlayerProps {
  currentTrack: Track | null
  queue: Track[]
  onTrackEnd: () => void
  onEvent: (action: string, playDuration?: number) => void
}

export default function MusicPlayer({
  currentTrack,
  queue,
  onTrackEnd,
  onEvent,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [playStartTime, setPlayStartTime] = useState<number>(0)

  // 当切换曲目时，重置播放器状态并自动播放
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audio_url
      audioRef.current.load()
      setCurrentTime(0)
      setIsPlaying(false)
      setPlayStartTime(Date.now())

      // 自动播放
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            onEvent('play')
          })
          .catch(error => {
            console.warn('Auto-play prevented:', error)
          })
      }
    }
  }, [currentTrack])

  // 更新播放进度
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnd = () => {
      const playDuration = Math.floor((Date.now() - playStartTime) / 1000)
      onEvent('complete', playDuration)
      onTrackEnd()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnd)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnd)
    }
  }, [currentTrack, onTrackEnd, onEvent, playStartTime])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error('Play error:', error))
    }
  }

  const handleSkip = () => {
    if (!currentTrack) return
    const playDuration = Math.floor((Date.now() - playStartTime) / 1000)
    onEvent('skip', playDuration)
    onTrackEnd()
  }

  const handleFavorite = () => {
    if (!currentTrack) return
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    onEvent(newFavoriteState ? 'favorite' : 'unfavorite')
  }

  const handleLock = () => {
    if (!currentTrack) return
    const newLockedState = !isLocked
    setIsLocked(newLockedState)
    if (newLockedState) {
      onEvent('lock')
    }
  }

  const handleBlacklist = () => {
    if (!currentTrack || !currentTrack.artist) return
    if (confirm(`确定要将 "${currentTrack.artist.name}" 加入黑名单吗？\n该歌手的歌曲将不再播放。`)) {
      onEvent('blacklist')
      onTrackEnd() // 立即跳过当前歌曲
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const vol = parseFloat(e.target.value)
    audio.volume = vol
    setVolume(vol)
  }

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-sm opacity-70">正在加载音乐...</p>
        </div>
      </div>
    )
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      {/* 音频元素 */}
      <audio ref={audioRef} />

      {/* 封面 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          <img
            src={currentTrack.cover_url || 'https://picsum.photos/300'}
            alt={currentTrack.title}
            className={`w-64 h-64 rounded-lg shadow-2xl object-cover ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          />
          {isLocked && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 歌曲信息 */}
      <div className="text-center px-8 py-4">
        <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
        <button
          onClick={() => currentTrack.artist && window.open(`/artist/${currentTrack.artist.id}`, '_blank')}
          className="text-lg opacity-70 hover:opacity-100 hover:underline transition-opacity"
        >
          {currentTrack.artist?.name || 'Unknown Artist'}
        </button>
        {currentTrack.album && (
          <p className="text-sm opacity-50 mt-1">{currentTrack.album}</p>
        )}
        {currentTrack.tags && currentTrack.tags.length > 0 && (
          <div className="flex gap-2 justify-center mt-2">
            {currentTrack.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="px-8 py-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--theme-primary) 0%, var(--theme-primary) ${progressPercent}%, rgba(0,0,0,0.1) ${progressPercent}%, rgba(0,0,0,0.1) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs opacity-70 mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-4 px-8 py-6">
        {/* 锁定 */}
        <button
          onClick={handleLock}
          className={`btn-icon ${isLocked ? 'text-yellow-600' : ''}`}
          title={isLocked ? '已锁定' : '锁定当前歌曲'}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            {isLocked ? (
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            ) : (
              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
            )}
          </svg>
        </button>

        {/* 收藏 */}
        <button
          onClick={handleFavorite}
          className={`btn-icon ${isFavorite ? 'text-red-500' : ''}`}
          title={isFavorite ? '取消收藏' : '收藏'}
        >
          <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* 播放/暂停 */}
        <button
          onClick={togglePlay}
          className="btn-icon w-16 h-16 text-white"
          style={{ background: 'var(--theme-primary)' }}
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* 跳过 */}
        <button
          onClick={handleSkip}
          className="btn-icon"
          title="跳过"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
        </button>

        {/* 黑名单 */}
        <button
          onClick={handleBlacklist}
          className="btn-icon text-gray-600 hover:text-red-600"
          title="加入黑名单"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 音量控制 */}
      <div className="flex items-center gap-3 px-8 pb-6">
        <svg className="w-5 h-5 opacity-70" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--theme-primary) 0%, var(--theme-primary) ${volume * 100}%, rgba(0,0,0,0.1) ${volume * 100}%, rgba(0,0,0,0.1) 100%)`,
          }}
        />
        <span className="text-xs opacity-70 w-10 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* 队列信息 */}
      <div className="px-8 pb-4 text-center text-sm opacity-70">
        队列中还有 {queue.length} 首歌曲
      </div>
    </div>
  )
}
