'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/shared'
import type { ThemeToggleProps } from '../types/sidebar.types'

export function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = savedTheme || (systemPreference ? 'dark' : 'light')
    setTheme(initialTheme as 'light' | 'dark')

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors',
        isCollapsed && 'justify-center',
      )}
      title={isCollapsed ? (theme === 'light' ? 'Modo escuro' : 'Modo claro') : undefined}
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Modo escuro</span>}
        </>
      ) : (
        <>
          <Sun className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Modo claro</span>}
        </>
      )}
    </button>
  )
}
