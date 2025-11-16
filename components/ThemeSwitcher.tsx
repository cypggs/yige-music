'use client'

// 主题切换器组件

import { useEffect, useState } from 'react'
import { THEMES, type ThemeName } from '@/lib/types'

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('lightblue')

  useEffect(() => {
    // 从 localStorage 加载主题
    const savedTheme = localStorage.getItem('yige_theme') as ThemeName
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('lightblue')
    }
  }, [])

  const applyTheme = (themeName: ThemeName) => {
    const theme = THEMES[themeName]
    document.documentElement.style.setProperty('--theme-bg', theme.bg)
    document.documentElement.style.setProperty('--theme-primary', theme.primary)
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary)
    document.documentElement.style.setProperty('--theme-text', theme.text)
  }

  const handleThemeChange = (themeName: ThemeName) => {
    setCurrentTheme(themeName)
    applyTheme(themeName)
    localStorage.setItem('yige_theme', themeName)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium opacity-70">主题:</span>
      <div className="flex gap-2">
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key as ThemeName)}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              currentTheme === key
                ? 'font-bold scale-110'
                : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              background: theme.primary,
              color: theme.name === 'black' ? '#fff' : '#333',
            }}
            title={`切换到${theme.displayName}主题`}
          >
            {theme.displayName}
          </button>
        ))}
      </div>
    </div>
  )
}
