import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '亦歌 - 简洁在线音乐播放器',
  description: '亦歌（1g1g）复刻版 - 零输入自动播放，行为驱动推荐的极简音乐播放器',
  keywords: '亦歌, 1g1g, 在线音乐, 音乐播放器, 自动推荐',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
