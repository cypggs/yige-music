// 亦歌音乐播放器 - 类型定义

export interface Artist {
  id: string
  name: string
  name_en?: string
  avatar_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Track {
  id: string
  title: string
  title_en?: string
  artist_id: string
  artist?: Artist
  album?: string
  duration: number
  audio_url: string
  cover_url?: string
  lyrics?: string
  tags?: string[]
  popularity: number
  created_at: string
  updated_at: string
}

export type UserAction = 'play' | 'skip' | 'lock' | 'favorite' | 'unfavorite' | 'complete' | 'blacklist'

export interface UserBehavior {
  id?: string
  user_id: string
  track_id: string
  artist_id: string
  action: UserAction
  play_duration?: number
  timestamp?: string
  session_id?: string
  metadata?: Record<string, any>
}

export interface UserFavorite {
  id?: string
  user_id: string
  track_id: string
  created_at?: string
}

export interface UserBlacklist {
  id?: string
  user_id: string
  artist_id: string
  created_at?: string
}

export interface PlayQueueItem {
  id?: string
  user_id: string
  track_id: string
  track?: Track
  position: number
  is_locked: boolean
  created_at?: string
}

export type ThemeName = 'lightblue' | 'red' | 'blue' | 'black' | 'google'

export interface Theme {
  name: ThemeName
  displayName: string
  bg: string
  primary: string
  secondary: string
  text: string
}

export const THEMES: Record<ThemeName, Theme> = {
  lightblue: {
    name: 'lightblue',
    displayName: '淡蓝',
    bg: '#e8f4f8',
    primary: '#5fb7d4',
    secondary: '#4a9fb8',
    text: '#333',
  },
  red: {
    name: 'red',
    displayName: '红色',
    bg: '#fceaea',
    primary: '#e57373',
    secondary: '#d32f2f',
    text: '#333',
  },
  blue: {
    name: 'blue',
    displayName: '蓝色',
    bg: '#e3f2fd',
    primary: '#42a5f5',
    secondary: '#1976d2',
    text: '#333',
  },
  black: {
    name: 'black',
    displayName: '黑色',
    bg: '#1a1a1a',
    primary: '#4a4a4a',
    secondary: '#2a2a2a',
    text: '#f0f0f0',
  },
  google: {
    name: 'google',
    displayName: 'Google',
    bg: '#ffffff',
    primary: '#4285f4',
    secondary: '#34a853',
    text: '#333',
  },
}
