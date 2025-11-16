'use client'

// 播放队列组件

import type { Track } from '@/lib/types'
import { formatDuration } from '@/lib/utils'

interface PlayQueueProps {
  queue: Track[]
  currentTrack: Track | null
  onTrackSelect: (track: Track) => void
}

export default function PlayQueue({ queue, currentTrack, onTrackSelect }: PlayQueueProps) {
  if (queue.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center opacity-70">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
          <p className="text-sm">队列为空</p>
          <p className="text-xs mt-2">正在为你获取推荐...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          播放队列
          <span className="text-sm font-normal opacity-70">({queue.length})</span>
        </h3>

        <div className="space-y-2">
          {queue.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id
            return (
              <button
                key={`${track.id}-${index}`}
                onClick={() => onTrackSelect(track)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  isCurrentTrack
                    ? 'card transform scale-105'
                    : 'hover:bg-white hover:bg-opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 序号 / 播放图标 */}
                  <div className="w-8 text-center">
                    {isCurrentTrack ? (
                      <div className="audio-visualizer h-5">
                        <div className="audio-bar animate-pulse" style={{ height: '60%' }}></div>
                        <div className="audio-bar animate-pulse" style={{ height: '80%', animationDelay: '0.1s' }}></div>
                        <div className="audio-bar animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                        <div className="audio-bar animate-pulse" style={{ height: '70%', animationDelay: '0.3s' }}></div>
                      </div>
                    ) : (
                      <span className="text-sm opacity-50">{index + 1}</span>
                    )}
                  </div>

                  {/* 封面 */}
                  <img
                    src={track.cover_url || 'https://picsum.photos/50'}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentTrack ? 'font-bold' : ''}`}>
                      {track.title}
                    </p>
                    <p className="text-sm opacity-70 truncate">
                      {track.artist?.name || 'Unknown Artist'}
                    </p>
                  </div>

                  {/* 时长 */}
                  <div className="text-xs opacity-50">
                    {formatDuration(track.duration)}
                  </div>
                </div>

                {/* 标签 */}
                {track.tags && track.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 ml-11">
                    {track.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
