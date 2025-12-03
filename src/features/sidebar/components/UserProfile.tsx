'use client'

import { cn } from '@/shared'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import type { UserProfileProps } from '../types/sidebar.types'

export function UserProfile({ user, isCollapsed, onSignOut }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url
  const email = user.email

  const initials = name
    ? name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false)
    }
  }, [isCollapsed])

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'px-3 py-4 border-t border-gray-200 dark:border-gray-700 relative',
        isCollapsed && 'px-2',
      )}
    >
      <button
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 rounded-lg transition-colors',
          !isCollapsed && 'hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2',
          isCollapsed && 'justify-center cursor-default',
        )}
        title={isCollapsed ? `${name}\n${email}` : undefined}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white font-medium text-sm flex-shrink-0">
            {initials}
          </div>
        )}

        {!isCollapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
            {email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>}
          </div>
        )}
      </button>

      {isOpen && !isCollapsed && (
        <div className="absolute left-3 right-3 bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{name}</p>
            {email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>}
          </div>

          <div className="py-1">
            {onSignOut && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  onSignOut()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
