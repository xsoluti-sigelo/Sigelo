'use client'

import Image from 'next/image'

interface UserAvatarProps {
  pictureUrl?: string
  fullName: string
}

export function UserAvatar({ pictureUrl, fullName }: UserAvatarProps) {
  if (pictureUrl) {
    return (
      <Image
        src={pictureUrl}
        alt={fullName}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full"
      />
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
      <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
        {fullName?.charAt(0)?.toUpperCase() || '?'}
      </span>
    </div>
  )
}
